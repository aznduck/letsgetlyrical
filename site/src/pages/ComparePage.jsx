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
import FriendSearchBar from "../components/FriendsSearchBar";
import FavoriteService from "../services/FavoriteService";


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



    const handleRemoveFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter((f) => f !== friend))
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


    const handleCompare = async () => {
        if (selectedFriends.length === 0) return;

        setIsLoading(true);

        try {
            // Fetch favorites for all selected friends using your existing service
            const allFavoritePromises = selectedFriends.map(async username => {
                try {
                    const response = await FavoriteService.fetchFavorites(username);

                    if (!response.ok) {
                        console.error(`Failed to fetch favorites for ${username}: ${response.status}`);
                        return [];
                    }

                    // Parse the response
                    const responseData = await response.json();
                    console.log(`Data for ${username}:`, responseData);

                    // Extract the favorites array from the response
                    const favorites = responseData.favorites || [];

                    // Map each song to include the username of who favorited it
                    return favorites.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artist,
                        albumCover: "/placeholder.svg", // You'll need to add album artwork
                        album: song.album,
                        user: username
                    }));
                } catch (error) {
                    console.error(`Error fetching favorites for ${username}:`, error);
                    return [];
                }
            });

            const allFavoritesArrays = await Promise.all(allFavoritePromises);
            const allFavorites = allFavoritesArrays.flat();

            console.log("All favorites:", allFavorites);

            if (allFavorites.length === 0) {
                setComparisonResults([]);
                setIsLoading(false);
                return;
            }

            // Create song frequency map
            const songMap = new Map();

            allFavorites.forEach(song => {
                // Create a unique key based on title and artist
                const songKey = `${song.title || ''}-${song.artist || ''}`.toLowerCase();

                if (!songMap.has(songKey)) {
                    songMap.set(songKey, {
                        id: song.id || Math.random().toString(36).substr(2, 9),
                        title: song.title || 'Unknown Title',
                        artist: song.artist || 'Unknown Artist',
                        albumCover: song.albumCover || "/placeholder.svg",
                        album: song.album || "",
                        frequency: 1,
                        users: [song.user]
                    });
                } else {
                    const existingSong = songMap.get(songKey);
                    // Only count each user once per song
                    if (!existingSong.users.includes(song.user)) {
                        existingSong.frequency += 1;
                        existingSong.users.push(song.user);
                    }
                }
            });

            // Convert map to array and sort by frequency
            const sortedResults = Array.from(songMap.values())
                .sort((a, b) => {
                    return sortOrder === "desc" ?
                        b.frequency - a.frequency :
                        a.frequency - b.frequency;
                });

            setComparisonResults(sortedResults);
        } catch (error) {
            console.error("Error comparing favorites:", error);
            setComparisonResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="compare-page">
            <Navbar onLogout={handleLogout} />

            <div className="compare-container">
                <div className="friends-search-section">
                    <FriendSearchBar onSelectFriend={(user) => {
                        if (!selectedFriends.includes(user.username)) {
                            setSelectedFriends([...selectedFriends, user.username]);
                        }
                    }}/>

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

                    {isLoading ? (
                        <div className="comparison-loading">
                            <Loader2 className="loading-spinner" size={48}/>
                            <p>Finding common songs...</p>
                        </div>
                    ) : comparisonResults.length > 0 ? (
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
                                            <div className="song-thumbnail"
                                                 style={{backgroundImage: `url(${result.albumCover})`}}></div>
                                            <div className="song-details">
                                                <div className="song-title">{result.title}</div>
                                                <div className="song-artist">{result.artist}</div>
                                            </div>
                                        </div>
                                        <div className="song-frequency"
                                             onMouseEnter={(e) => handleSongMouseEnter(e, result)}
                                             onMouseLeave={handleSongMouseLeave}>
                                            {result.frequency}
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
                                <Loader2 className="loading-spinner" size={48}/>
                                <h2>Your lyrical soulmate is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeSoulmatePopup}>
                                    <X size={24}/>
                                </button>
                                <h2>Your lyrical soulmate is...</h2>
                                <h1 className="match-username">{soulmateResult}</h1>
                                <div className="match-icon-container">
                                    <Heart className="match-icon soulmate-icon" size={120}/>
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