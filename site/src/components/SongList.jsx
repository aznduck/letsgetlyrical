import {useCallback, useState} from "react"
import LyricsPopup from "./LyricsPopUp"
import Toast from "./Toast"
import "../styles/SongList.css"

function SongList({ searchTerm, songs, onClose }) {
    const [selectedSong, setSelectedSong] = useState(null)
    const [showLyrics, setShowLyrics] = useState(false)
    const [hoveredSong, setHoveredSong] = useState(null)
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" })
    const [favorites, setFavorites] = useState([])

    const handleLyricsClick = (song) => {
        setSelectedSong(song)
        setShowLyrics(true)
    }

    const closeToast = useCallback(() => {
        console.log("closeToast called")
        setToast((prevToast) => ({
            ...prevToast,
            visible: false,
        }))
    }, [])

    const handleAddToFavorites = (song) => {
        if (favorites.some((fav) => fav.id === song.id)) {
            setToast({
                visible: true,
                message: "Song is already in your favorites list.",
                type: "error",
            })
        } else {
            setFavorites((prev) => [...prev, song])
            setToast({
                visible: true,
                message: "Song successfully added to favorites list.",
                type: "success",
            })
        }
    }


    return (
        <>
            <div className="song-list-overlay">
                <div className="song-list-backdrop" onClick={onClose}></div>
                <div className="song-list-popup-container">
                    <button className="song-list-close-button" onClick={onClose}>
                        ✕
                    </button>

                    <div className="song-list-content">
                        <h2 className="song-list-title">Songs with '{searchTerm}'</h2>

                        <div className="song-list-table-container">
                            <table className="song-list-table">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Song</th>
                                    <th>Artist</th>
                                    <th>Year</th>
                                    <th>Frequency</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {songs.map((song, index) => (
                                    <tr
                                        key={song.id}
                                        onMouseEnter={() => setHoveredSong(song.id)}
                                        onMouseLeave={() => setHoveredSong(null)}
                                    >
                                        <td>{index + 1}</td>
                                        <td className="song-list-song-title">
                                            {song.title}
                                            {hoveredSong === song.id && (
                                                <button className="song-list-add-favorite" onClick={() => handleAddToFavorites(song)}>
                                                    +  Add to favorites list
                                                </button>
                                            )}
                                        </td>
                                        <td>{song.artist}</td>
                                        <td>{song.year}</td>
                                        <td>{song.frequency}</td>
                                        <td>
                                            <button className="song-list-lyrics-button" onClick={() => handleLyricsClick(song)}>
                                                Lyrics
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <LyricsPopup song={selectedSong} visible={showLyrics} onClose={() => setShowLyrics(false)} />

            <Toast
                key={`${toast.type}-${toast.message}-${toast.visible}`}
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={closeToast}
            />
        </>
    )
}

export default SongList