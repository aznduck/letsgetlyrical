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
import FriendSearchBar from "../components/FriendsSearchBar";
import FavoriteService from "../services/FavoriteService";

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



    const handleRemoveFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter((f) => f !== friend))
        setAnnounceMessage(`Removed ${friend} from selected friends`)
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

            <div className="compare-container">
                <div className="friends-search-section">
                    <FriendSearchBar onSelectFriend={(user) => {
                        if (!selectedFriends.includes(user.username)) {
                            setSelectedFriends([...selectedFriends, user.username]);
                        }
                    }}/>


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

                    {isLoading ? (
                        <div className="comparison-loading">
                            <Loader2 className="loading-spinner" size={48}/>
                            <p>Finding common songs...</p>
                        </div>
                    ) : comparisonResults.length > 0 ? (
                        <div className="comparison-results">
                            <div className="comparison-table-header">

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
                            <div className="lyrical-match-loading">
                                <Loader2 className="loading-spinner" size={48}/>
                                <h2>Your lyrical soulmate is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeSoulmatePopup}>
                                    <X size={24}/>

                                </button>
                                <h2 id="soulmate-title">Your lyrical soulmate is...</h2>
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