import { Heart, MoreHorizontal, AlignJustify, Lock, Globe, SquareMinus, X , ChevronUp, ChevronDown } from "lucide-react"
import {useState} from "react";

const mockFavorites = [
    { id: 1, title: "Song Title 1", artist: "Artist Name 1", album: "Album Name 1" },
    { id: 2, title: "Song Title 2", artist: "Artist Name 2", album: "Album Name 2" },
    { id: 3, title: "Song Title 3", artist: "Artist Name 3", album: "Album Name 3" },
    { id: 4, title: "Song Title 4", artist: "Artist Name 4", album: "Album Name 4" },
    { id: 5, title: "Song Title 5", artist: "Artist Name 5", album: "Album Name 5" },
    { id: 6, title: "Song Title 6", artist: "Artist Name 6", album: "Album Name 6" },
    { id: 7, title: "Song Title 7", artist: "Artist Name 7", album: "Album Name 7" },
    { id: 8, title: "Song Title 8", artist: "Artist Name 8", album: "Album Name 8" },
    { id: 9, title: "Song Title 9", artist: "Artist Name 9", album: "Album Name 9" },
    { id: 10, title: "Song Title 10", artist: "Artist Name 10", album: "Album Name 10" },
    { id: 11, title: "Song Title 11", artist: "Artist Name 11", album: "Album Name 11" },
    { id: 12, title: "Song Title 12", artist: "Artist Name 12", album: "Album Name 12" },
    { id: 13, title: "Song Title 13", artist: "Artist Name 13", album: "Album Name 13" },
    { id: 14, title: "Song Title 14", artist: "Artist Name 14", album: "Album Name 14" },
    { id: 15, title: "Song Title 15", artist: "Artist Name 15", album: "Album Name 15" },
    { id: 16, title: "Song Title longer with a much longer name", artist: "Artist Name 16", album: "Album Name 16" },
]

function Favorites() {
    const [showMenu, setShowMenu] = useState(false)
    const [isPrivate, setIsPrivate] = useState(true)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [favorites, setFavorites] = useState(mockFavorites)
    const [selectedSong, setSelectedSong] = useState(null)
    const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 })
    const [showActionMenu, setShowActionMenu] = useState(false)
    const [selectedSongIndex, setSelectedSongIndex] = useState(null)

    const toggleMenu = () => {
        setShowMenu(!showMenu)
    }

    const setPrivateMode = () => {
        setIsPrivate(true)
    }

    const setPublicMode = () => {
        setIsPrivate(false)
    }

    const handleDeleteClick = () => {
        setShowMenu(false)
        setShowDeleteConfirmation(true)
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false)
    }

    const handleConfirmDelete = () => {
        setFavorites([])
        setShowDeleteConfirmation(false)
    }

    const handleSongClick = (song) => {
        setSelectedSong(song)
    }

    const closeSongDetails = () => {
        setSelectedSong(null)
    }

    const handleActionButtonClick = (e, index) => {
        e.stopPropagation()

        // Get the position of the clicked button
        const rect = e.currentTarget.getBoundingClientRect()

        // Position the menu to the left of the button
        setActionMenuPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX - 200, // Position to the left
        })

        setSelectedSongIndex(index)
        setShowActionMenu(true)
    }

    const closeActionMenu = () => {
        setShowActionMenu(false)
        setSelectedSongIndex(null)
    }

    const moveSongUp = () => {
        if (selectedSongIndex > 0) {
            const newFavorites = [...favorites]
            const temp = newFavorites[selectedSongIndex]
            newFavorites[selectedSongIndex] = newFavorites[selectedSongIndex - 1]
            newFavorites[selectedSongIndex - 1] = temp

            // Update the IDs to maintain sequential order
            newFavorites.forEach((song, index) => {
                song.id = index + 1
            })

            setFavorites(newFavorites)
        }
        closeActionMenu()
    }

    const moveSongDown = () => {
        if (selectedSongIndex < favorites.length - 1) {
            const newFavorites = [...favorites]
            const temp = newFavorites[selectedSongIndex]
            newFavorites[selectedSongIndex] = newFavorites[selectedSongIndex + 1]
            newFavorites[selectedSongIndex + 1] = temp

            // Update the IDs to maintain sequential order
            newFavorites.forEach((song, index) => {
                song.id = index + 1
            })

            setFavorites(newFavorites)
        }
        closeActionMenu()
    }

    const removeSong = () => {
        const newFavorites = favorites.filter((_, index) => index !== selectedSongIndex)

        // Update the IDs to maintain sequential order
        newFavorites.forEach((song, index) => {
            song.id = index + 1
        })

        setFavorites(newFavorites)
        closeActionMenu()
    }

    // Close menu when clicking outside
    const handleClickOutside = (e) => {
        if (!e.target.closest(".favorites-menu-button") && !e.target.closest(".favorites-popup-menu")) {
            setShowMenu(false)
        }

        if (!e.target.closest(".favorite-action-button") && !e.target.closest(".song-action-menu")) {
            closeActionMenu()
        }
    }

    // Add event listener when component mounts
    useState(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="favorites-section">

            {showDeleteConfirmation && (
                <div className="delete-modal-overlay">
                    <div className="confirmation-dialog">
                        <h2>Are you sure?</h2>
                        <p>This will delete your entire favorites list.</p>
                        <div className="confirmation-actions">
                            <button className="cancel-button" onClick={handleCancelDelete}>
                                Cancel
                            </button>
                            <button className="delete-button" onClick={handleConfirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedSong && (
                <div className="modal-overlay" onClick={closeSongDetails}>
                    <div className="song-details-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" data-testid="close-button" onClick={closeSongDetails}>
                            <X size={24} />
                        </button>
                        <div className="song-details-content">
                            <div className="album-cover">{/* Placeholder for album cover */}</div>
                            <div className="song-info">
                                <span className="album-label">Album</span>
                                <h2 className="song-title" data-testid="pop-up-song-title">{selectedSong.title}</h2>
                                <span className="artist-name">{selectedSong.artist}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showActionMenu && (
                <div
                    className="song-action-menu"
                    style={{
                        position: "absolute",
                        top: `${actionMenuPosition.top}px`,
                        left: `${actionMenuPosition.left}px`,
                    }}
                >
                    <div className="action-menu-header">
                        <span>Move song</span>
                        <div className="action-menu-buttons">
                            <button className="action-menu-button" onClick={moveSongUp}
                                    disabled={selectedSongIndex === 0}>
                                <div className="up-button">
                                    <ChevronUp size={18}/>
                                </div>
                            </button>
                            <button
                                className="action-menu-button"
                                onClick={moveSongDown}
                                disabled={selectedSongIndex === favorites.length - 1}
                            >
                                <div className="down-button">
                                    <ChevronDown size={18}/>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="action-menu-divider"></div>
                    <button className="remove-song-button" onClick={removeSong}>
                        Remove song
                    </button>
                </div>
            )}

            <div className="favorites-header">
                <div className="favorites-title">
                    <Heart size={20} />
                    <h2>Your Favorites</h2>
                </div>
                <div className="favorites-menu-container">
                    <button className="favorites-menu-button" aria-label="Favorites menu" onClick={toggleMenu}>
                        <AlignJustify size={20}/>
                    </button>

                    {showMenu && (
                        <div className="favorites-popup-menu">
                            <button className={`popup-menu-item ${isPrivate ? "selected" : ""}`} onClick={setPrivateMode}>
                                <Lock size={20} />
                                <span>Private</span>
                                {isPrivate}
                            </button>
                            <button className={`popup-menu-item ${!isPrivate ? "selected" : ""}`} onClick={setPublicMode}>
                                <Globe size={20} />
                                <span>Public</span>
                                {!isPrivate}
                            </button>
                            <div className="popup-menu-divider"></div>
                            <button className="popup-menu-item popup-menu-item-delete" onClick={handleDeleteClick}>
                                <SquareMinus size={20} />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="favorites-table-header">
                <div className="favorites-column-header">#</div>
                <div className="favorites-column-header">Song</div>
                <div className="favorites-column-header"></div>
            </div>

            <div className="favorites-list">
                {favorites.length > 0 ? (
                    favorites.map((song, index) => (                        <div key={song.id} className="favorite-item">
                            <div className="favorite-number">{song.id}</div>
                            <div className="favorite-title" onClick={() => handleSongClick(song)} data-testid="list-song-title">{song.title}</div>
                            <div className="favorite-actions">
                                <button className="favorite-action-button" onClick={(e) => handleActionButtonClick(e, index)}>
                                    <MoreHorizontal size={16}/>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-favorites">
                        <p>No favorites yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Favorites