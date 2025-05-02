import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import WordCloudContent from "../components/WordCloudContent";
import GeniusService from '../services/GeniusService';
import "../styles/SearchPage.css"
import SongDetailsPopUp from "../components/SongDetailsPopUp";

const DEFAULT_ALBUM_COVER = "/images/placeholder.svg";

const SearchPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [numSongs, setNumSongs] = useState(10);
    const [sort, setSort] = useState("popularity");

    const [potentialArtists, setPotentialArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showArtistPopup, setShowArtistPopup] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const numParam = params.get('num');
        const num = Number.parseInt(numParam, 10) > 0 ? Number.parseInt(numParam, 10) : 10;
        const sortParam = params.get('sort') || 'popularity';
        console.log("query: " + query);

        console.log("--- useEffect Triggered ---");
        console.log("Raw location.search:", location.search);
        console.log("Extracted query (q):", query);
        console.log("Extracted numParam (num):", numParam);
        console.log("Extracted sortParam (sort):", sortParam);
        console.log("--------------------------");

        setSearchQuery(query);
        setNumSongs(num);
        setSort(sortParam);

        setPotentialArtists([]);
        setSelectedArtist(null);
        setSongs([]);
        setError(null);

        if (query) {
            const fetchArtists = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const artists = await GeniusService.searchArtist(query);
                    if (artists && artists.length > 0) {
                        const filteredArtists = Array.from(new Map(artists.map(a => [a.artist_id, a])).values())
                        setPotentialArtists(filteredArtists);
                        setShowArtistPopup(true);
                    } else {
                        setError(`No artists found matching "${query}". Please try a different search term.`);
                        setPotentialArtists([]);
                        setShowArtistPopup(false)
                    }
                } catch (err) {
                    console.error("Failed to fetch artists:", err);
                    setError(err.message || "Failed to search for artists. Check connection or API status.");
                    setPotentialArtists([]);
                    setShowArtistPopup(false)
                } finally {
                    setIsLoading(false);
                }
            };
            fetchArtists();
        } else {
            setError(null);
            setPotentialArtists([]);
            setSelectedArtist(null);
            setSongs([]);
            setShowArtistPopup(false)
        }
    }, [location.search]);

    useEffect(() => {
        if (selectedArtist && selectedArtist.artist_id) {
            const fetchSongsForArtist = async () => {
                setIsLoading(true);
                setError(null);
                setSongs([]);
                try {
                    const fetchedSongs = await GeniusService.getTopSongs(selectedArtist.artist_id, numSongs, sort);

                    if (fetchedSongs && fetchedSongs.length > 0) {
                        const formattedSongs = fetchedSongs.map((song, index) => ({
                            id: song.id || index + 1,
                            title: song.title || 'Unknown Title',
                            artist: song.primary_artist?.name || selectedArtist.artist_name || 'Unknown Artist',
                            featuring: song.featured_artists?.map(a => a.name).join(', ') || '',
                            albumCover: song.song_art_image_thumbnail_url || song.header_image_thumbnail_url || DEFAULT_ALBUM_COVER,
                            url: song.url || '',
                            dateReleased: song.release_date_for_display || "",
                            fullTitle: song.full_title || "",
                            album: ""

                        }));
                        setSongs(formattedSongs);
                    } else {
                        setError(`No songs found for ${selectedArtist.artist_name}. They might not have songs listed on Genius.`);
                        setSongs([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch songs:", err);
                    setError(err.message || `Failed to fetch songs for ${selectedArtist.artist_name}.`);
                    setSongs([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSongsForArtist();
        }
    }, [selectedArtist]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleArtistSelect = useCallback((artist) => {
        if (artist && artist.artist_id) {
            setSelectedArtist(artist);
            setPotentialArtists([]);
            setShowArtistPopup(false)
            setError(null);
        } else {
            console.error("Invalid artist object passed to handleArtistSelect:", artist);
            setError("An error occurred selecting the artist.");
        }
    }, []);

    const handleAddFavorites = () => {
        console.log("Added favorites list to word cloud.", songs);
    };

    const handleSongClick = (song) => {
        setSelectedSong(song)
    }

    const handleCloseSongDetails = () => {
        setSelectedSong(null)
    }

    const LoadingIndicator = () => (
        <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    )

    return (
        <div className="search-page">
            <Navbar
                onLogout={handleLogout}
                initialSearchQuery={searchQuery}
                initialNumSongs={numSongs}
                initialSortOption={sort}
            />

            <div className="search-page-content">

                {error && !isLoading && <div className="search-error-message">Error: {error}</div>}

                {showArtistPopup && potentialArtists.length > 0 && !selectedArtist && (
                    <div className="artist-popup-overlay">
                        <div className="artist-popup">
                            <h3>Please pick an artist:</h3>
                            <div className="artist-list-container">
                                <ul className="artist-list">
                                    {potentialArtists.map((artist) => (
                                        <li key={artist.artist_id} className="artist-list-item">
                                            <button onClick={() => handleArtistSelect(artist)}>
                                                <div className="artist-avatar"></div>
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
                        <div className="search-results-list">
                            <h2 className="search-results-title">{isLoading ? "Loading songs..." : `Top ${songs.length} Songs`}</h2>

                            {isLoading ? (
                                <div className="content-loading-container">
                                    <LoadingIndicator />
                                </div>
                            ) : (
                                <div className="song-list-container">
                                    <ul className="song-list">
                                        {songs.map((song, index) => (
                                            <li key={song.id} className="song-item"
                                                onClick={() => handleSongClick(song)}>
                                                <span className="song-number">{index + 1}</span>
                                                <img
                                                    src={song.albumCover || DEFAULT_ALBUM_COVER}
                                                    alt={`${song.title} cover`}
                                                    className="song-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null
                                                        e.target.src = DEFAULT_ALBUM_COVER
                                                    }}
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
                        </div>

                        {/* Right Column - Word Cloud */}
                        <div className="word-cloud-wrapper">
                            {isLoading && !selectedArtist ? (
                                <div className="content-loading-container">
                                    <LoadingIndicator />
                                </div>
                            ) : selectedArtist && songs.length === 0 && !isLoading && !error ? (
                                <div className="initial-prompt"><p>Fetching songs or no songs found for this artist.</p></div>
                            ) : selectedArtist || (potentialArtists.length === 0 && searchQuery) ? (
                                <WordCloudContent
                                    songsData={songs}

                                    onAddFavorites={handleAddFavorites}
                                />
                            ) : null /* Or show initial prompt */}
                        </div>
                    </div>
                )}

                {!isLoading && !error && !searchQuery && potentialArtists.length === 0 && !selectedArtist && (
                    <div className="initial-prompt">
                        <p>Enter an artist name in the search bar above to begin.</p>
                    </div>
                )}

                {/* Song Details Popup */}
                {selectedSong && <SongDetailsPopUp song={selectedSong} onClose={handleCloseSongDetails} />}
            </div>

            <Footer />
        </div>
    )
}

export default SearchPage