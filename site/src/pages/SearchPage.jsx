import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../App"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import WordCloudContent from "../components/WordCloudContent"
import GeniusService from "../services/GeniusService"
import SkipLink from "../components/SkipLink"
import { useModalFocus } from "../hooks/UseModalFocus"
import "../styles/SearchPage.css"
import SongDetailsPopUp from "../components/SongDetailsPopUp"

const DEFAULT_ALBUM_COVER = "/images/placeholder.svg"

const SearchPage = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [searchQuery, setSearchQuery] = useState("")
    const [numSongs, setNumSongs] = useState(10)

    const [potentialArtists, setPotentialArtists] = useState([])
    const [selectedArtist, setSelectedArtist] = useState(null)
    const [songs, setSongs] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showArtistPopup, setShowArtistPopup] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const [announceMessage, setAnnounceMessage] = useState("")
    const [activeArtistIndex, setActiveArtistIndex] = useState(-1)

    const songListRef = useRef(null)
    const lastFocusedElementRef = useRef(null)

    // Close artist popup
    const closeArtistPopup = () => {
        setShowArtistPopup(false)
        // Return focus to the last focused element
        if (lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus()
        }
    }

    // Use our custom hook for modal focus management
    const artistModalRef = useModalFocus(showArtistPopup, closeArtistPopup)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const query = params.get("q") || ""
        const numParam = params.get("num")
        const num = Number.parseInt(numParam, 10) > 0 ? Number.parseInt(numParam, 10) : 10

        setSearchQuery(query)
        setNumSongs(num)

        setPotentialArtists([])
        setSelectedArtist(null)
        setSongs([])
        setError(null)

        if (query) {
            const fetchArtists = async () => {
                setIsLoading(true)
                setError(null)
                setAnnounceMessage(`Searching for artists matching "${query}"`)
                try {
                    const artists = await GeniusService.searchArtist(query)
                    if (artists && artists.length > 0) {
                        const filteredArtists = Array.from(new Map(artists.map((a) => [a.artist_id, a])).values())
                        setPotentialArtists(filteredArtists)
                        setShowArtistPopup(true)
                        setAnnounceMessage(`Found ${filteredArtists.length} artists matching "${query}". Please select one.`)
                    } else {
                        setError(`No artists found matching "${query}". Please try a different search term.`)
                        setPotentialArtists([])
                        setShowArtistPopup(false)
                        setAnnounceMessage(`No artists found matching "${query}". Please try a different search term.`)
                    }
                } catch (err) {
                    console.error("Failed to fetch artists:", err)
                    setError(err.message || "Failed to search for artists. Check connection or API status.")
                    setPotentialArtists([])
                    setShowArtistPopup(false)
                    setAnnounceMessage("Error searching for artists. Please try again.")
                } finally {
                    setIsLoading(false)
                }
            }
            fetchArtists()
        } else {
            setError(null)
            setPotentialArtists([])
            setSelectedArtist(null)
            setSongs([])
            setShowArtistPopup(false)
        }
    }, [location.search])

    useEffect(() => {
        if (selectedArtist && selectedArtist.artist_id) {
            const fetchSongsForArtist = async () => {
                setIsLoading(true)
                setError(null)
                setSongs([])
                setAnnounceMessage(`Fetching top songs for ${selectedArtist.artist_name}`)
                try {
                    const fetchedSongs = await GeniusService.getTopSongs(selectedArtist.artist_id, numSongs)

                    if (fetchedSongs && fetchedSongs.length > 0) {
                        const formattedSongs = fetchedSongs.map((song, index) => ({
                            id: song.id || index + 1,
                            title: song.title || "Unknown Title",
                            artist: song.primary_artist?.name || selectedArtist.artist_name || "Unknown Artist",
                            featuring: song.featured_artists?.map((a) => a.name).join(", ") || "",
                            albumCover: song.song_art_image_thumbnail_url || song.header_image_thumbnail_url || DEFAULT_ALBUM_COVER,
                            url: song.url || "",
                            dateReleased: song.release_date_for_display || "",
                            fullTitle: song.full_title || "",
                            album: "",
                        }))
                        setSongs(formattedSongs)
                        setAnnounceMessage(`Loaded ${formattedSongs.length} songs by ${selectedArtist.artist_name}`)
                    } else {
                        setError(`No songs found for ${selectedArtist.artist_name}. They might not have songs listed on Genius.`)
                        setSongs([])
                        setAnnounceMessage(`No songs found for ${selectedArtist.artist_name}`)
                    }
                } catch (err) {
                    console.error("Failed to fetch songs:", err)
                    setError(err.message || `Failed to fetch songs for ${selectedArtist.artist_name}.`)
                    setSongs([])
                    setAnnounceMessage(`Error fetching songs for ${selectedArtist.artist_name}`)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchSongsForArtist()
        }
    }, [selectedArtist, numSongs])

    // Clear announcement after it's been read
    useEffect(() => {
        if (announceMessage) {
            const timer = setTimeout(() => {
                setAnnounceMessage("")
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [announceMessage])

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const handleArtistSelect = useCallback((artist) => {
        if (artist && artist.artist_id) {
            setSelectedArtist(artist)
            setPotentialArtists([])
            setShowArtistPopup(false)
            setError(null)
            setAnnounceMessage(`Selected artist: ${artist.artist_name}`)
        } else {
            console.error("Invalid artist object passed to handleArtistSelect:", artist)
            setError("An error occurred selecting the artist.")
            setAnnounceMessage("Error selecting artist")
        }
    }, [])

    const handleAddFavorites = () => {
        console.log("Added favorites list to word cloud.", songs)
        setAnnounceMessage("Added favorites list to word cloud")
    }

    const handleSongClick = (song) => {
        lastFocusedElementRef.current = document.activeElement
        setSelectedSong(song)
    }

    const handleCloseSongDetails = () => {
        setSelectedSong(null)
        // Return focus to the last focused element
        if (lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus()
        }
    }

    // Handle keyboard navigation in artist popup
    const handleArtistKeyDown = (e, artist, index) => {
        switch (e.key) {
            case "Enter":
            case " ": // Space
                e.preventDefault()
                handleArtistSelect(artist)
                break
            case "ArrowDown":
                e.preventDefault()
                setActiveArtistIndex((prevIndex) => (prevIndex < potentialArtists.length - 1 ? prevIndex + 1 : prevIndex))
                break
            case "ArrowUp":
                e.preventDefault()
                setActiveArtistIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
                break
            case "Escape":
                e.preventDefault()
                closeArtistPopup()
                break
            default:
                break
        }
    }

    // Handle keyboard navigation for song list
    const handleSongKeyDown = (e, song) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleSongClick(song)
        }
    }

    const LoadingIndicator = () => (
        <div className="loading-indicator" role="status" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p>Loading...</p>
        </div>
    )

    return (
        <div className="search-page">
            <SkipLink />
            <Navbar onLogout={handleLogout} initialSearchQuery={searchQuery} initialNumSongs={numSongs} />

            {/* Screen reader announcements */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {announceMessage}
            </div>

            <main id="main-content" className="search-page-content">
                {error && !isLoading && (
                    <div className="search-error-message" role="alert">
                        Error: {error}
                    </div>
                )}

                {/* Artist Selection Popup */}
                {showArtistPopup && potentialArtists.length > 0 && !selectedArtist && (
                    <div
                        className="artist-popup-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="artist-selection-title"
                    >
                        <div className="artist-popup" ref={artistModalRef} tabIndex="-1">
                            <h3 id="artist-selection-title">Please pick an artist:</h3>
                            <div className="artist-list-container">
                                <ul className="artist-list" role="listbox" aria-label="Available artists">
                                    {potentialArtists.map((artist, index) => (
                                        <li
                                            key={artist.artist_id}
                                            className={`artist-list-item ${index === activeArtistIndex ? "active" : ""}`}
                                            role="option"
                                            aria-selected={index === activeArtistIndex}
                                        >
                                            <button
                                                onClick={() => handleArtistSelect(artist)}
                                                onKeyDown={(e) => handleArtistKeyDown(e, artist, index)}
                                                tabIndex="0"
                                                aria-label={`Select ${artist.artist_name}`}
                                                ref={index === 0 ? (el) => el && el.focus() : null}
                                            >
                                                <div className="artist-avatar" aria-hidden="true"></div>
                                                <span>{artist.artist_name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Only show when an artist is selected or loading */}
                {(selectedArtist || isLoading) && (
                    <div className="search-results-container">
                        {/* Left Column - Song List */}
                        <section className="search-results-list" aria-labelledby="song-list-title">
                            <h2 id="song-list-title" className="search-results-title">
                                {isLoading ? "Loading songs..." : `Top ${songs.length} Songs`}
                            </h2>

                            {isLoading ? (
                                <div className="content-loading-container">
                                    <LoadingIndicator />
                                </div>
                            ) : (
                                <div className="song-list-container">
                                    <ul className="song-list" ref={songListRef} role="list">
                                        {songs.map((song, index) => (
                                            <li
                                                key={song.id}
                                                className="song-item"
                                                onClick={() => handleSongClick(song)}
                                                onKeyDown={(e) => handleSongKeyDown(e, song)}
                                                tabIndex="0"
                                                role="button"
                                                aria-label={`View details for ${song.title} by ${song.artist}`}
                                            >
                        <span className="song-number" aria-hidden="true">
                          {index + 1}
                        </span>
                                                <img
                                                    src={song.albumCover || DEFAULT_ALBUM_COVER}
                                                    alt=""
                                                    className="song-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null
                                                        e.target.src = DEFAULT_ALBUM_COVER
                                                    }}
                                                    aria-hidden="true"
                                                />
                                                <div className="song-info">
                                                    <div className="song-title">{song.title}</div>
                                                    <div className="song-artist">
                                                        {song.artist}
                                                        {song.featuring ? `, ${song.featuring}` : ""}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>

                        {/* Right Column - Word Cloud */}
                        <section className="word-cloud-wrapper" aria-label="Word cloud visualization">
                            {
                                isLoading && !selectedArtist ? (
                                    <div className="content-loading-container">
                                        <LoadingIndicator />
                                    </div>
                                ) : selectedArtist && songs.length === 0 && !isLoading && !error ? (
                                    <div className="initial-prompt" role="status">
                                        <p>Fetching songs or no songs found for this artist.</p>
                                    </div>
                                ) : selectedArtist || (potentialArtists.length === 0 && searchQuery) ? (
                                    <WordCloudContent songsData={songs} onAddFavorites={handleAddFavorites} />
                                ) : null /* Or show initial prompt */
                            }
                        </section>
                    </div>
                )}

                {!isLoading && !error && !searchQuery && potentialArtists.length === 0 && !selectedArtist && (
                    <div className="initial-prompt" role="status">
                        <p>Enter an artist name in the search bar above to begin.</p>
                    </div>
                )}

                {/* Song Details Popup */}
                {selectedSong && <SongDetailsPopUp song={selectedSong} onClose={handleCloseSongDetails} />}
            </main>

            <Footer />
        </div>
    )
}

export default SearchPage