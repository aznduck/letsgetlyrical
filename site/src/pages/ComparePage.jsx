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

            <div className="compare-container">
                <div className="friends-search-section">
                    <FriendSearchBar onSelectFriend={(user) => {
                        if (!selectedFriends.includes(user.username)) {
                            setSelectedFriends([...selectedFriends, user.username])
                        }
                    }} />

                    <div className="selected-friends-list" role="list" aria-label="Selected friends">
                        {selectedFriends.map((friend, index) => (
                            <div key={index} className="selected-friend" role="listitem">
                                <span>{friend}</span>
                                <button
                                    className="remove-friend-button"
                                    onClick={() => handleRemoveFriend(friend)}
                                    aria-label={`Remove ${friend}`}
                                >
                                    <X size={16} />
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
                </div>

                <main>
                    <section className="comparison-section">
                        <div className="comparison-header">
                            <h2>Compare with Friends</h2>
                        </div>

                        {isLoading ? (
                            <div className="comparison-loading">
                                <Loader2 className="loading-spinner" size={48} />
                                <p>Finding common songs...</p>
                            </div>
                        ) : comparisonResults.length > 0 ? (
                            <div className="comparison-results">
                                <div className="comparison-table-header">
                                    <div className="common-songs-header">Common Songs</div>
                                    <button onClick={toggleSortOrder}>
                                        Frequency {sortOrder === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
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
                                                <div className="song-thumbnail" style={{ backgroundImage: `url(${result.albumCover})` }} />
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
                            <button onClick={handleFindSoulmate}>Find Lyrical Soulmate</button>
                            <button onClick={handleFindEnemy}>Find Lyrical Enemy</button>
                        </div>
                    </section>

                    <section className="favorites-container">
                        <Favorites />
                    </section>
                </main>
            </div>

            {selectedSong && <SongDetailsPopup song={selectedSong} onClose={closeSongDetails} />}

            {hoverSong && (
                <div className="users-with-song-popup" style={{ top: `${hoverPosition.y}px`, left: `${hoverPosition.x}px` }}>
                    <h3>Users with Song</h3>
                    <ul>
                        {hoverSong.users.map((user, idx) => (
                            <li key={idx}>{user}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showSoulmatePopup && (
                <div className="lyrical-match-overlay">
                    <div className="lyrical-match-popup" ref={soulmateModalRef}>
                        {isLoading ? (
                            <Loader2 size={48} />
                        ) : (
                            <>
                                <button onClick={() => setShowSoulmatePopup(false)}><X size={24} /></button>
                                <h2>Your lyrical soulmate is...</h2>
                                <h1>{soulmateResult}</h1>
                                <Heart size={120} />
                            </>
                        )}
                    </div>
                </div>
            )}

            {showEnemyPopup && (
                <div className="lyrical-match-overlay">
                    <div className="lyrical-match-popup" ref={enemyModalRef}>
                        {isLoading ? (
                            <Loader2 size={48} />
                        ) : (
                            <>
                                <button onClick={() => setShowEnemyPopup(false)}><X size={24} /></button>
                                <h2>Your lyrical enemy is...</h2>
                                <h1>{enemyResult}</h1>
                                <Angry size={120} />
                            </>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default ComparePage