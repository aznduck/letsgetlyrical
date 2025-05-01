import { Heart, MoreHorizontal, AlignJustify, Lock, Globe, SquareMinus , ChevronUp, ChevronDown } from "lucide-react"
import {useEffect, useRef, useState} from "react";
import SongDetailsPopUp from "./SongDetailsPopUp"
import "../styles/Favorites.css"
import FavoriteService from "../services/FavoriteService"

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

function Favorites({ initialFavorites = null }) {
    const [showMenu, setShowMenu] = useState(false)
    const [isPrivate, setIsPrivate] = useState(true)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [favorites, setFavorites] = useState(initialFavorites || mockFavorites)
    const [selectedSong, setSelectedSong] = useState(null)
    const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 })
    const [showActionMenu, setShowActionMenu] = useState(false)
    const [selectedSongIndex, setSelectedSongIndex] = useState(null)
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
    const [songToRemove, setSongToRemove] = useState(null)

    const timerRef = useRef(null)

    useEffect(() => {
        if (!initialFavorites) {
            const fetchFavorites = async () => {
                try {
                    const user = JSON.parse(localStorage.getItem("user"));
                    const response = await FavoriteService.fetchFavorites(user.username);

                    const data = await response.json();
                    console.log(JSON.stringify(data));

                    const favoritesArray = data.favorites || [];

                    if (Array.isArray(favoritesArray)) {
                        const withIds = favoritesArray.map((song, idx) => ({
                            ...song
                        }));
                        setFavorites(withIds);
                    } else {
                        console.warn("Unexpected data format:", data);
                    }
                }
                catch(error) {
                    console.error("Failed to retrieve favorites: ", error);
                }
            };

            fetchFavorites();
        }
    }, [initialFavorites]);

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

    const handleSongHover = (e, index) => {
        // Get the position of the hovered song title
        const rect = e.currentTarget.getBoundingClientRect()

        // Position the menu to the left of the song title
        setActionMenuPosition({
            top: rect.top + window.scrollY + 25,
            left: rect.left + window.scrollX - 20,
        })

        setSelectedSongIndex(index)
        setShowActionMenu(true)

        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            closeActionMenu()
        }, 5000) // 5 seconds
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
        setSongToRemove(favorites[selectedSongIndex])
        setShowRemoveConfirmation(true)
        closeActionMenu()
    }

    const handleConfirmRemoveSong = () => {
        const newFavorites = favorites.filter(
            (_, index) => index !== favorites.findIndex((song) => song.id === songToRemove.id),
        )

        // Update the IDs to maintain sequential order
        newFavorites.forEach((song, index) => {
            song.id = index + 1
        })

        setFavorites(newFavorites)
        setShowRemoveConfirmation(false)
        setSongToRemove(null)
    }

    const handleCancelRemoveSong = () => {
        setShowRemoveConfirmation(false)
        setSongToRemove(null)
    }


    // Close menu when clicking outside
    const handleClickOutside = (e) => {
        if (!e.target.closest(".favorites-menu-button") && !e.target.closest(".favorites-popup-menu")) {
            setShowMenu(false)
        }
    }

    // Add event listener when component mounts
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
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

            {showRemoveConfirmation && (
                <div className="delete-modal-overlay">
                    <div className="confirmation-dialog">
                        <h2>Remove Song</h2>
                        <p>Are you sure you want to remove "{songToRemove?.title}" from your favorites?</p>
                        <div className="confirmation-actions">
                            <button className="cancel-button" onClick={handleCancelRemoveSong}>
                                Cancel
                            </button>
                            <button className="delete-button" onClick={handleConfirmRemoveSong}>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Song Details Popup */}
            {selectedSong && <SongDetailsPopUp song={selectedSong} onClose={closeSongDetails} />}

            {showActionMenu && (
                <div
                    className="song-action-menu"
                    style={{
                        position: "absolute",
                        top: `${actionMenuPosition.top}px`,
                        left: `${actionMenuPosition.left}px`,
                    }}
                    onMouseEnter={() => {
                        // Clear the timer when mouse enters the menu
                        if (timerRef.current) {
                            clearTimeout(timerRef.current)
                            timerRef.current = null
                        }
                    }}
                    onMouseLeave={closeActionMenu}
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
                    favorites.map((song, index) => (
                        <div key={song.id} className="favorite-item">
                            <div className="favorite-number">{song.id}</div>
                            <div
                                className="favorite-title"
                                onClick={() => handleSongClick(song)}
                                onMouseEnter={(e) => handleSongHover(e, index)}
                                data-testid="list-song-title">
                                {song.title}
                            </div>
                            <div className="favorite-actions">
                                <button className="favorite-action-button" onClick={() => handleSongHover(song)}>
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