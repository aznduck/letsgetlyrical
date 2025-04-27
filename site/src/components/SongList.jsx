import { useCallback, useState } from "react";
import LyricsPopup from "./LyricsPopUp"; // Corrected import name casing
import Toast from "./Toast";
import "../styles/SongList.css";

function SongList({ searchTerm, songs, onClose, lyricsMap }) {
    const [selectedSongData, setSelectedSongData] = useState(null);
    const [showLyrics, setShowLyrics] = useState(false);
    const [hoveredSong, setHoveredSong] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
    const [favorites, setFavorites] = useState([]);

    const handleLyricsClick = (song) => {
        const songId = song.id || song.url;
        const lyrics = lyricsMap?.get(songId);

        const songDataForPopup = {
            ...song,
            lyrics: lyrics || "Lyrics not available for this song.",
        };

        setSelectedSongData(songDataForPopup);
        setShowLyrics(true);
    };

    const closeToast = useCallback(() => {
        setToast((prevToast) => ({
            ...prevToast,
            visible: false,
        }));
    }, []);

    const handleAddToFavorites = (song) => {
        if (favorites.some((fav) => fav.id === song.id)) {
            setToast({
                visible: true,
                message: "Song is already in your favorites list.",
                type: "error",
            });
        } else {
            setFavorites((prev) => [...prev, song]);
            setToast({
                visible: true,
                message: "Song successfully added to favorites list.",
                type: "success",
            });
        }
    };


    const displaySongs = songs.filter(song => {
        const songId = song.id || song.url;
        return lyricsMap?.has(songId) && lyricsMap?.get(songId);
    });

    return (
        <>
            <div className="song-list-overlay">
                <div className="song-list-backdrop" onClick={onClose}></div>
                <div className="song-list-popup-container">
                    <button className="song-list-close-button" onClick={onClose}>
                        ✕
                    </button>

                    <div className="song-list-content">
                        <h2 className="song-list-title">Songs potentially containing '{searchTerm}'</h2>

                        {displaySongs.length === 0 && (
                            <p className="song-list-info">No songs found with available lyrics matching the criteria.</p>
                        )}

                        {displaySongs.length > 0 && (
                            <div className="song-list-table-container">
                                <table className="song-list-table">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Song</th>
                                        <th>Artist</th>
                                        <th>Year</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {displaySongs.map((song, index) => (
                                        <tr
                                            key={song.id || song.url} // Use consistent key
                                            onMouseEnter={() => setHoveredSong(song.id || song.url)}
                                            onMouseLeave={() => setHoveredSong(null)}
                                        >
                                            <td>{index + 1}</td>
                                            <td className="song-list-song-title">
                                                {song.title}
                                                {hoveredSong === (song.id || song.url) && (
                                                    <button className="song-list-add-favorite" onClick={() => handleAddToFavorites(song)}>
                                                        + Add to favorites
                                                    </button>
                                                )}
                                            </td>
                                            <td>{song.artist}</td>
                                            <td>{song.year}</td>
                                            {/*<td>{song.frequency}</td> Remove if song obj doesn't have it */}
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
                        )}
                    </div>
                </div>
            </div>

            <LyricsPopup song={selectedSongData} visible={showLyrics} onClose={() => setShowLyrics(false)} />

            <Toast
                key={`${toast.type}-${toast.message}-${toast.visible}`}
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={closeToast}
            />
        </>
    );
}

export default SongList;