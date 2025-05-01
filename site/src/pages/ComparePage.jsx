import { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../App"
import { useState } from "react"
import { Search, X, ChevronUp, ChevronDown, Heart, Angry, Loader2 } from "lucide-react"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import SongDetailsPopup from "../components/SongDetailsPopUp"
import Favorites from "../components/Favorites"
import SkipLink from "../components/SkipLink"
import { useModalFocus } from "../hooks/UseModalFocus"
import "../styles/ComparePage.css"
import "../styles/SongDetailsPopUp.css"

function ComparePage() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFriends, setSelectedFriends] = useState([])
    const [comparisonResults, setComparisonResults] = useState([])
    const [sortOrder, setSortOrder] = useState("desc") // "desc" for descending, "asc" for ascending
    const [selectedSong, setSelectedSong] = useState(null)
    const [hoverSong, setHoverSong] = useState(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

    const [showSoulmatePopup, setShowSoulmatePopup] = useState(false)
    const [showEnemyPopup, setShowEnemyPopup] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [soulmateResult, setSoulmateResult] = useState(null)
    const [enemyResult, setEnemyResult] = useState(null)
    const [announceMessage, setAnnounceMessage] = useState("")

    // Refs for focus management
    const closeSoulmatePopup = () => {
        setShowSoulmatePopup(false)
        setSoulmateResult(null)
    }

    const closeEnemyPopup = () => {
        setShowEnemyPopup(false)
        setEnemyResult(null)
    }

    const soulmateModalRef = useModalFocus(showSoulmatePopup, closeSoulmatePopup)
    const enemyModalRef = useModalFocus(showEnemyPopup, closeEnemyPopup)
    const searchInputRef = useRef(null)

    const mockComparisonResults = [
        {
            id: 1,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 5,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "vitozhou", "felixchen", "johnsongao", "davidhan"],
        },
        {
            id: 2,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 5,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "vitozhou", "felixchen", "johnsongao", "davidhan"],
        },
        {
            id: 3,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 4,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "vitozhou", "felixchen", "johnsongao"],
        },
        {
            id: 4,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 4,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "vitozhou", "felixchen", "johnsongao"],
        },
        {
            id: 5,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 3,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "vitozhou", "felixchen"],
        },
        {
            id: 6,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 2,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "vitozhou"],
        },
        {
            id: 7,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 2,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "felixchen"],
        },
        {
            id: 8,
            title: "Baby",
            artist: "Justin Bieber, Ludacris",
            frequency: 2,
            albumCover: "/placeholder.svg",
            users: ["vitozhou", "johnsongao"],
        },
        {
            id: 9,
            title: "Despacito",
            artist: "Luis Fonsi, Daddy Yankee",
            frequency: 2,
            albumCover: "/placeholder.svg",
            users: ["maliahotan", "davidhan"],
        },
        {
            id: 10,
            title: "Shape of You",
            artist: "Ed Sheeran",
            frequency: 2,
            albumCover: "/placeholder.svg",
            users: ["felixchen", "johnsongao"],
        },
        {
            id: 11,
            title: "Blinding Lights",
            artist: "The Weeknd",
            frequency: 1,
            albumCover: "/placeholder.svg",
            users: ["maliahotan"],
        },
        {
            id: 12,
            title: "Dance Monkey",
            artist: "Tones and I",
            frequency: 1,
            albumCover: "/placeholder.svg",
            users: ["vitozhou"],
        },
        {
            id: 13,
            title: "Rockstar",
            artist: "Post Malone, 21 Savage",
            frequency: 1,
            albumCover: "/placeholder.svg",
            users: ["felixchen"],
        },
        {
            id: 14,
            title: "Someone You Loved",
            artist: "Lewis Capaldi",
            frequency: 1,
            albumCover: "/placeholder.svg",
            users: ["johnsongao"],
        },
        {
            id: 15,
            title: "One Dance",
            artist: "Drake, Wizkid, Kyla",
            frequency: 1,
            albumCover: "/placeholder.svg",
            users: ["davidhan"],
        },
    ]


    // Announce important changes to screen readers
    useEffect(() => {
        if (announceMessage) {
            const timer = setTimeout(() => {
                setAnnounceMessage("")
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [announceMessage])

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleSearchClear = () => {
        setSearchQuery("")
        searchInputRef.current?.focus()
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim() && !selectedFriends.includes(searchQuery.trim())) {
            setSelectedFriends([...selectedFriends, searchQuery.trim()])
            setSearchQuery("")
            setAnnounceMessage(`Added ${searchQuery.trim()} to selected friends`)
        }
    }

    const handleRemoveFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter((f) => f !== friend))
        setAnnounceMessage(`Removed ${friend} from selected friends`)
    }

    const handleCompare = () => {
        // Sort
        const sortedResults = [...mockComparisonResults].sort((a, b) => {
            return sortOrder === "desc" ? b.frequency - a.frequency : a.frequency - b.frequency
        })
        setComparisonResults(sortedResults)
        setAnnounceMessage("Comparison results loaded")
    }

    const handleFindSoulmate = () => {
        console.log("Finding lyrical soulmate")
        setShowSoulmatePopup(true)
        setIsLoading(true)
        // mock for now
        setTimeout(() => {
            setIsLoading(false)
            setSoulmateResult("maliahotan")
        }, 2000)
    }

    const handleFindEnemy = () => {
        console.log("Finding lyrical enemy")
        setShowEnemyPopup(true)
        setIsLoading(true)

        // mock for now
        setTimeout(() => {
            setIsLoading(false)
            setEnemyResult("maliahotan")
        }, 2000)
    }

    const handleSongClick = (song) => {
        setSelectedSong(song)
    }

    const closeSongDetails = () => {
        setSelectedSong(null)
    }

    const toggleSortOrder = () => {
        const newSortOrder = sortOrder === "desc" ? "asc" : "desc"
        setSortOrder(newSortOrder)

        // Re-sort the results based on the new sort order
        const sortedResults = [...comparisonResults].sort((a, b) => {
            return newSortOrder === "desc" ? b.frequency - a.frequency : a.frequency - b.frequency
        })
        setComparisonResults(sortedResults)
        setAnnounceMessage(`Sorted by frequency ${newSortOrder === "desc" ? "descending" : "ascending"}`)
    }

    const handleSongMouseEnter = (e, song) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoverPosition({
            x: rect.right + 20,
            y: rect.top,
        })
        setHoverSong(song)
    }

    const handleSongMouseLeave = () => {
        setHoverSong(null)
    }

    // Handle keyboard interaction for song items
    const handleSongKeyDown = (e, song) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleSongClick(song)
        }
    }

    // Handle keyboard interaction for hover info
    const handleFrequencyKeyDown = (e, song) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            const rect = e.currentTarget.getBoundingClientRect()
            setHoverPosition({
                x: rect.right + 20,
                y: rect.top,
            })
            setHoverSong(song)
        } else if (e.key === "Escape" && hoverSong) {
            setHoverSong(null)
        }
    }

    return (
        <div className="compare-page">
            <SkipLink />
            <Navbar onLogout={handleLogout} />

            {/* Screen reader announcements */}
            <div className="sr-only" aria-live="polite">
                {announceMessage}
            </div>

            <main id="main-content" className="compare-container">
                <section className="friends-search-section" aria-labelledby="search-heading">
                    <h2 id="search-heading" className="sr-only">
                        Search for Friends
                    </h2>
                    <form onSubmit={handleSearchSubmit} className="friends-search-form" role="search">
                        <div className="friends-search-input-container">
                            <label htmlFor="friend-search" className="sr-only">
                                Enter a username to compare with
                            </label>
                            <Search size={18} className="friends-search-icon" aria-hidden="true" />
                            <input
                                id="friend-search"
                                type="text"
                                placeholder="Enter a username"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="friends-search-input"
                                ref={searchInputRef}
                                aria-describedby="search-description"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="friends-clear-search"
                                    onClick={handleSearchClear}
                                    aria-label="Clear search"
                                >
                                    <X size={16} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                        <div id="search-description" className="sr-only">
                            Type a username and press Enter to add to your comparison list
                        </div>
                    </form>

                    <div className="selected-friends-list" role="list" aria-label="Selected friends">
                        {selectedFriends.map((friend, index) => (
                            <div key={index} className="selected-friend" role="listitem">
                                <span>{friend}</span>
                                <button
                                    className="remove-friend-button"
                                    onClick={() => handleRemoveFriend(friend)}
                                    aria-label={`Remove ${friend} from selected friends`}
                                >
                                    <X size={16} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                        {selectedFriends.length === 0 && (
                            <div className="no-friends-message" role="status">
                                No friends selected
                            </div>
                        )}
                    </div>

                    <div className="friends-search-actions">
                        <button
                            className="compare-button"
                            onClick={handleCompare}
                            disabled={selectedFriends.length === 0}
                            aria-disabled={selectedFriends.length === 0}
                        >
                            Click to compare
                        </button>
                    </div>
                </section>

                <section className="comparison-section" aria-labelledby="comparison-heading">
                    <div className="comparison-header">
                        <div className="comparison-title">
                            <div className="comparison-icon" aria-hidden="true">
                                <div className="circle"></div>
                                <div className="circle overlap"></div>
                            </div>
                            <h2 id="comparison-heading">Compare with Friends</h2>
                        </div>
                    </div>

                    {comparisonResults.length > 0 ? (
                        <div className="comparison-results" role="region" aria-label="Comparison results">
                            <div className="comparison-table-header" role="rowheader">
                                <div className="common-songs-header">Common Songs</div>
                                <button
                                    className="frequency-header-button"
                                    onClick={toggleSortOrder}
                                    aria-label={`Sort by frequency ${sortOrder === "desc" ? "ascending" : "descending"}`}
                                    aria-sort={sortOrder === "desc" ? "descending" : "ascending"}
                                >
                                    Frequency
                                    {sortOrder === "desc" ? (
                                        <ChevronDown size={16} aria-hidden="true" />
                                    ) : (
                                        <ChevronUp size={16} aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                            <div className="comparison-results-list" role="list">
                                {comparisonResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="comparison-result-item"
                                        onClick={() => handleSongClick(result)}
                                        onKeyDown={(e) => handleSongKeyDown(e, result)}
                                        tabIndex="0"
                                        role="button"
                                        aria-label={`View details for ${result.title} by ${result.artist}`}
                                    >
                                        <div className="compare-song-info">
                                            <div className="song-thumbnail" aria-hidden="true"></div>
                                            <div className="song-details">
                                                <div className="song-title">{result.title}</div>
                                                <div className="song-artist">{result.artist}</div>
                                            </div>
                                        </div>
                                        <div
                                            className="song-frequency"
                                            onMouseEnter={(e) => handleSongMouseEnter(e, result)}
                                            onMouseLeave={handleSongMouseLeave}
                                            onKeyDown={(e) => handleFrequencyKeyDown(e, result)}
                                            tabIndex="0"
                                            role="button"
                                            aria-label={`${result.frequency} users have this song. Press Enter to see who.`}
                                            aria-expanded={hoverSong === result}
                                            aria-controls={`users-for-song-${result.id}`}
                                        >
                                            {result.frequency}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="comparison-empty-state" role="status">
                            <p>
                                Enter your friends' username to compare
                                <br />
                                your favorite songs or chose to find
                                <br />
                                lyrical soulmate/enemy
                            </p>
                        </div>
                    )}

                    <div className="comparison-actions">
                        <button
                            className="find-soulmate-button"
                            onClick={handleFindSoulmate}
                            aria-label="Find your lyrical soulmate"
                        >
                            Find Lyrical Soulmate
                        </button>
                        <button className="find-enemy-button" onClick={handleFindEnemy} aria-label="Find your lyrical enemy">
                            Find Lyrical Enemy
                        </button>
                    </div>
                </section>

                <section className="favorites-container" aria-label="Your favorites">
                    <Favorites />
                </section>
            </main>

            {selectedSong && <SongDetailsPopup song={selectedSong} onClose={closeSongDetails} />}

            {hoverSong && (
                <div
                    id={`users-for-song-${hoverSong.id}`}
                    className="users-with-song-popup"
                    style={{
                        top: `${hoverPosition.y}px`,
                        left: `${hoverPosition.x}px`,
                    }}
                    role="dialog"
                    aria-label={`Users who have ${hoverSong.title} in their favorites`}
                >
                    <h3 className="users-popup-title">Users with Song</h3>
                    <div className="users-list" role="list">
                        {hoverSong.users.map((user, index) => (
                            <div key={index} className="user-item" role="listitem">
                <span className="user-number" aria-hidden="true">
                  {index + 1}
                </span>
                                <span className="username">{user}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showSoulmatePopup && (
                <div className="lyrical-match-overlay" role="dialog" aria-modal="true" aria-labelledby="soulmate-title">
                    <div className="lyrical-match-popup" ref={soulmateModalRef} tabIndex="-1">
                        {isLoading ? (
                            <div className="lyrical-match-loading" role="status" aria-live="polite">
                                <Loader2 className="loading-spinner" size={48} aria-hidden="true" />
                                <h2 id="soulmate-title">Your lyrical soulmate is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeSoulmatePopup} aria-label="Close dialog">
                                    <X size={24} aria-hidden="true" />
                                </button>
                                <h2 id="soulmate-title">Your lyrical soulmate is...</h2>
                                <h1 className="match-username">{soulmateResult}</h1>
                                <div className="match-icon-container" aria-hidden="true">
                                    <Heart className="match-icon soulmate-icon" size={120} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showEnemyPopup && (
                <div className="lyrical-match-overlay" role="dialog" aria-modal="true" aria-labelledby="enemy-title">
                    <div className="lyrical-match-popup" ref={enemyModalRef} tabIndex="-1">
                        {isLoading ? (
                            <div className="lyrical-match-loading" role="status" aria-live="polite">
                                <Loader2 className="loading-spinner" size={48} aria-hidden="true" />
                                <h2 id="enemy-title">Your lyrical enemy is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeEnemyPopup} aria-label="Close dialog">
                                    <X size={24} aria-hidden="true" />
                                </button>
                                <h2 id="enemy-title">Your lyrical enemy is...</h2>
                                <h1 className="match-username">{enemyResult}</h1>
                                <div className="match-icon-container" aria-hidden="true">
                                    <div className="match-icon enemy-icon">
                                        <Angry className="match-icon enemy-icon" size={120} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default ComparePage