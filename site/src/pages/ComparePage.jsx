import React from 'react';
import { useNavigate} from "react-router-dom"
import { useAuth } from "../App"
import { useState } from "react"
import {Search, X, ChevronUp, ChevronDown, Heart, Angry, Loader2} from "lucide-react"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import SongDetailsPopup from "../components/SongDetailsPopUp"
import Favorites from "../components/Favorites"
import "../styles/ComparePage.css"
import "../styles/SongDetailsPopUp.css"


function ComparePage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleSearchClear = () => {
        setSearchQuery("")
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim() && !selectedFriends.includes(searchQuery.trim())) {
            setSelectedFriends([...selectedFriends, searchQuery.trim()])
            setSearchQuery("")
        }
    }

    const handleRemoveFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter((f) => f !== friend))
    }

    const handleCompare = () => {
        //something something compare
        // Sort
        const sortedResults = [...mockComparisonResults].sort((a, b) => {
            return sortOrder === "desc" ? b.frequency - a.frequency : a.frequency - b.frequency
        })
        setComparisonResults(sortedResults)
    }

    const handleFindSoulmate = () => {
        console.log("Finding lyrical soulmate")
        setShowSoulmatePopup(true)
        setIsLoading(true)
        //mock for now
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

    const closeSoulmatePopup = () => {
        setShowSoulmatePopup(false)
        setSoulmateResult(null)
    }

    const closeEnemyPopup = () => {
        setShowEnemyPopup(false)
        setEnemyResult(null)
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

    return (
        <div className="compare-page">
            <Navbar onLogout={handleLogout} />

            <div className="compare-container">
                <div className="friends-search-section">
                    <form onSubmit={handleSearchSubmit} className="friends-search-form">
                        <div className="friends-search-input-container">
                            <Search size={18} className="friends-search-icon"/>
                            <input
                                type="text"
                                placeholder="Enter a username"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="friends-search-input"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="friends-clear-search"
                                    onClick={handleSearchClear}
                                    aria-label="Clear search"
                                >
                                    <X size={16}/>
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="selected-friends-list">
                        {selectedFriends.map((friend, index) => (
                            <div key={index} className="selected-friend">
                                <span>{friend}</span>
                                <button className="remove-friend-button" onClick={() => handleRemoveFriend(friend)}>
                                    <X size={16}/>
                                </button>
                            </div>
                        ))}
                        {selectedFriends.length === 0 && <div className="no-friends-message">No friends selected</div>}
                    </div>

                    <div className="friends-search-actions">
                        <button className="compare-button" onClick={handleCompare}
                                disabled={selectedFriends.length === 0}>
                            Click to compare
                        </button>
                    </div>
                </div>


                <div className="comparison-section">
                    <div className="comparison-header">
                        <div className="comparison-title">
                            <div className="comparison-icon">
                                <div className="circle"></div>
                                <div className="circle overlap"></div>
                            </div>
                            <h2>Compare with Friends</h2>
                        </div>
                    </div>

                    {comparisonResults.length > 0 ? (
                        <div className="comparison-results">
                            <div className="comparison-table-header">
                                <div className="common-songs-header">Common Songs</div>
                                <button className="frequency-header-button" onClick={toggleSortOrder}>
                                    Frequency
                                    {sortOrder === "desc" ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
                                </button>
                            </div>
                            <div className="comparison-results-list">
                                {comparisonResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="comparison-result-item"
                                        onClick={() => handleSongClick(result)}
                                    >
                                        <div className="compare-song-info">
                                            <div className="song-thumbnail"></div>
                                            <div className="song-details">
                                                <div className="song-title">{result.title}</div>
                                                <div className="song-artist">{result.artist}</div>
                                            </div>
                                        </div>
                                        <div className="song-frequency"
                                             onMouseEnter={(e) => handleSongMouseEnter(e, result)}
                                             onMouseLeave={handleSongMouseLeave}>{
                                            result.frequency}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="comparison-empty-state">
                            <p>
                                Enter your friends' username to compare
                                <br/>
                                your favorite songs or chose to find
                                <br/>
                                lyrical soulmate/enemy
                            </p>
                        </div>
                    )}

                    <div className="comparison-actions">
                        <button className="find-soulmate-button" onClick={handleFindSoulmate}>
                            Find Lyrical Soulmate
                        </button>
                        <button className="find-enemy-button" onClick={handleFindEnemy}>
                            Find Lyrical Enemy
                        </button>
                    </div>
                </div>

                <div className="favorites-container">
                    <Favorites/>
                </div>
            </div>

            {selectedSong && <SongDetailsPopup song={selectedSong} onClose={closeSongDetails}/>}

            {hoverSong && (
                <div
                    className="users-with-song-popup"
                    style={{
                        top: `${hoverPosition.y}px`,
                        left: `${hoverPosition.x}px`,
                    }}
                >
                    <h3 className="users-popup-title">Users with Song</h3>
                    <div className="users-list">
                        {hoverSong.users.map((user, index) => (
                            <div key={index} className="user-item">
                                <span className="user-number">{index + 1}</span>
                                <span className="username">{user}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showSoulmatePopup && (
                <div className="lyrical-match-overlay">
                    <div className="lyrical-match-popup">
                        {isLoading ? (
                            <div className="lyrical-match-loading">
                                <Loader2 className="loading-spinner" size={48} />
                                <h2>Your lyrical soulmate is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeSoulmatePopup}>
                                    <X size={24} />
                                </button>
                                <h2>Your lyrical soulmate is...</h2>
                                <h1 className="match-username">{soulmateResult}</h1>
                                <div className="match-icon-container">
                                    <Heart className="match-icon soulmate-icon" size={120} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showEnemyPopup && (
                <div className="lyrical-match-overlay">
                    <div className="lyrical-match-popup">
                        {isLoading ? (
                            <div className="lyrical-match-loading">
                                <Loader2 className="loading-spinner" size={48} />
                                <h2>Your lyrical enemy is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeEnemyPopup}>
                                    <X size={24} />
                                </button>
                                <h2>Your lyrical enemy is...</h2>
                                <h1 className="match-username">{enemyResult}</h1>
                                <div className="match-icon-container">
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