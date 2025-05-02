import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, ChevronUp, ChevronDown, Heart, Angry, Loader2 } from "lucide-react"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import SongDetailsPopup from "../components/SongDetailsPopUp"
import Favorites from "../components/Favorites"
import SkipLink from "../components/SkipLink"
import { useAuth } from "../App"
import { useModalFocus } from "../hooks/UseModalFocus"
import FriendSearchBar from "../components/FriendsSearchBar"
import FavoriteService from "../services/FavoriteService"
import "../styles/ComparePage.css"
import "../styles/SongDetailsPopUp.css"

function ComparePage() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const [selectedFriends, setSelectedFriends] = useState([])
    const [comparisonResults, setComparisonResults] = useState([])
    const [sortOrder, setSortOrder] = useState("desc")
    const [selectedSong, setSelectedSong] = useState(null)
    const [hoverSong, setHoverSong] = useState(null)
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
    const [showSoulmatePopup, setShowSoulmatePopup] = useState(false)
    const [showEnemyPopup, setShowEnemyPopup] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [soulmateResult, setSoulmateResult] = useState(null)
    const [enemyResult, setEnemyResult] = useState(null)
    const [announceMessage, setAnnounceMessage] = useState("")

    const soulmateModalRef = useModalFocus(showSoulmatePopup, () => setShowSoulmatePopup(false))
    const enemyModalRef = useModalFocus(showEnemyPopup, () => setShowEnemyPopup(false))

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const handleRemoveFriend = (friend) => {
        setSelectedFriends(selectedFriends.filter((f) => f !== friend))
        setAnnounceMessage(`Removed ${friend} from selected friends`)
    }

    const handleFindSoulmate = () => {
        console.log("Finding lyrical soulmate")
        setShowSoulmatePopup(true)
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setSoulmateResult("maliahotan")
        }, 2000)
    }

    const handleFindEnemy = () => {
        console.log("Finding lyrical enemy")
        setShowEnemyPopup(true)
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setEnemyResult("maliahotan")
        }, 2000)
    }

    const handleSongClick = (song) => setSelectedSong(song)
    const closeSongDetails = () => setSelectedSong(null)

    const toggleSortOrder = () => {
        const newSortOrder = sortOrder === "desc" ? "asc" : "desc"
        setSortOrder(newSortOrder)
        const sortedResults = [...comparisonResults].sort((a, b) =>
            newSortOrder === "desc" ? b.frequency - a.frequency : a.frequency - b.frequency
        )
        setComparisonResults(sortedResults)
        setAnnounceMessage(`Sorted by frequency ${newSortOrder}`)
    }

    const handleSongMouseEnter = (e, song) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoverPosition({ x: rect.right + 20, y: rect.top })
        setHoverSong(song)
    }

    const handleSongMouseLeave = () => setHoverSong(null)

    const handleCompare = async () => {
        if (selectedFriends.length === 0) return
        setIsLoading(true)

        try {
            const allFavorites = (await Promise.all(selectedFriends.map(async (username) => {
                const res = await FavoriteService.fetchFavorites(username)
                const data = await res.json()
                return (data.favorites || []).map(song => ({
                    ...song,
                    user: username,
                    albumCover: "/placeholder.svg"
                }))
            }))).flat()

            const songMap = new Map()
            for (const song of allFavorites) {
                const key = `${song.title}-${song.artist}`.toLowerCase()
                if (!songMap.has(key)) {
                    songMap.set(key, { ...song, frequency: 1, users: [song.user] })
                } else {
                    const existing = songMap.get(key)
                    if (!existing.users.includes(song.user)) {
                        existing.frequency++
                        existing.users.push(song.user)
                    }
                }
            }

            const sortedResults = Array.from(songMap.values()).sort((a, b) =>
                sortOrder === "desc" ? b.frequency - a.frequency : a.frequency - b.frequency
            )

            setComparisonResults(sortedResults)
        } catch (err) {
            console.error(err)
            setComparisonResults([])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="compare-page">
            <SkipLink />
            <Navbar onLogout={handleLogout} />

            <main id="main-content" className="compare-container">
                <section className="friends-search-section" aria-labelledby="search-heading">
                    <h2 id="search-heading" className="sr-only">
                        Search for Friends
                    </h2>

                    <FriendSearchBar onSelectFriend={(user) => {
                        if (!selectedFriends.includes(user.username)) {
                            setSelectedFriends([...selectedFriends, user.username])
                        }
                    }}/>

                    <div className="selected-friends-list" role="list" aria-label="Selected friends">
                        {selectedFriends.map((friend, index) => (
                            <div key={index} className="selected-friend" role="listitem">
                                <span>{friend}</span>
                                <button
                                    className="remove-friend-button"
                                    onClick={() => handleRemoveFriend(friend)}
                                    aria-label={`Remove ${friend}`}
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        ))}
                        {selectedFriends.length === 0 && (
                            <div className="no-friends-message">No friends selected</div>
                        )}
                    </div>

                    <div className="friends-search-actions">
                        <button
                            className="compare-button"
                            onClick={handleCompare}
                            disabled={selectedFriends.length === 0}
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
                        <div className="comparison-results" role="region" aria-label="Comparison results">
                            <div className="comparison-table-header" role="rowheader">
                                <div className="common-songs-header">Common Songs</div>
                                <button onClick={toggleSortOrder}>
                                    Frequency {sortOrder === "desc" ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
                                </button>
                            </div>
                            <div className="comparison-results-list">
                                {comparisonResults.map(result => (
                                    <div
                                        key={result.id}
                                        className="comparison-result-item"
                                        onClick={() => handleSongClick(result)}
                                        onMouseEnter={(e) => handleSongMouseEnter(e, result)}
                                        onMouseLeave={handleSongMouseLeave}
                                    >
                                        <div className="compare-song-info">
                                            <div className="song-thumbnail"
                                                 style={{backgroundImage: `url(${result.albumCover})`}}/>
                                            <div className="song-details">
                                                <div className="song-title">{result.title}</div>
                                                <div className="song-artist">{result.artist}</div>
                                            </div>
                                        </div>
                                        <div className="song-frequency">{result.frequency}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>No common songs found. Try adding friends and comparing again.</p>
                    )}

                    <div className="comparison-actions">
                        <button
                            className="find-soulmate-button"
                            onClick={handleFindSoulmate}
                            aria-label="Find your lyrical soulmate"
                        >
                            Find Lyrical Soulmate
                        </button>
                        <button className="find-enemy-button" onClick={handleFindEnemy}
                                aria-label="Find your lyrical enemy">
                            Find Lyrical Enemy
                        </button>
                    </div>
                </section>

                <section className="favorites-container">
                    <Favorites/>
                </section>
            </main>


            {selectedSong && <SongDetailsPopup song={selectedSong} onClose={closeSongDetails}/>}

            {hoverSong && (
                <div
                    id={`users-for-song-${hoverSong.id}`}
                    className="users-with-song-popup"
                    style={{top: `${hoverPosition.y}px`, left: `${hoverPosition.x}px`}}
                    role="dialog"
                    aria-label={`Users who have ${hoverSong.title} in their favorites`}>
                    <h3 className="users-popup-title">Users with Song</h3>
                    <ul className="users-list" role="list">
                        {hoverSong.users.map((user, idx) => (
                            <li key={idx}>{user}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showSoulmatePopup && (
                <div className="lyrical-match-overlay" role="dialog" aria-modal="true" aria-labelledby="soulmate-title">
                    <div className="lyrical-match-popup" ref={soulmateModalRef} tabIndex="-1">
                        {isLoading ? (
                            <div className="lyrical-match-loading" role="status" aria-live="polite">
                                <Loader2 className="loading-spinner" size={48} aria-hidden="true"/>
                                <h2 id="soulmate-title">Your lyrical soulmate is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeSoulmatePopup}
                                        aria-label="Close dialog">
                                    <X size={24} aria-hidden="true"/>
                                </button>
                                <h2 id="soulmate-title">Your lyrical soulmate is...</h2>
                                <h1 className="match-username">{soulmateResult}</h1>
                                <div className="match-icon-container" aria-hidden="true">
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
                                <Loader2 className="loading-spinner" size={48} aria-hidden="true"/>
                                <h2 id="enemy-title">Your lyrical enemy is...</h2>
                            </div>
                        ) : (
                            <div className="lyrical-match-result">
                                <button className="close-match-button" onClick={closeEnemyPopup}
                                        aria-label="Close dialog">
                                    <X size={24} aria-hidden="true"/>
                                </button>
                                <h2 id="enemy-title">Your lyrical enemy is...</h2>
                                <h1 className="match-username">{enemyResult}</h1>
                                <div className="match-icon-container" aria-hidden="true">
                                    <div className="match-icon enemy-icon">
                                        <Angry className="match-icon enemy-icon" size={120}/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer/>
        </div>
    )
}

export default ComparePage