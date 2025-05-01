import { useCallback, useState, useEffect } from "react"; // Import useEffect
import LyricsPopup from "./LyricsPopUp";
import Toast from "./Toast";
import "../styles/SongList.css";
import FavoriteService from "../services/FavoriteService"


function SongList({ searchTerm, songs, onClose, lyricsMap }) {
    const [selectedSongData, setSelectedSongData] = useState(null);
    const [showLyrics, setShowLyrics] = useState(false);
    const [hoveredSong, setHoveredSong] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
    const [favorites, setFavorites] = useState([]);
    const [displaySongs, setDisplaySongs] = useState([]);

    useEffect(() => {
        if (!searchTerm || !songs || !lyricsMap) {
            setDisplaySongs([]);
            return;
        }

        const filteredSongs = songs.filter(song => {
            const songId = song.id || song.url;
            const lyrics = lyricsMap?.get(songId);

            if (!lyrics) {
                return false;
            }

            return lyrics.toLowerCase().includes(searchTerm.toLowerCase());

        });

        setDisplaySongs(filteredSongs);

    }, [searchTerm, songs, lyricsMap]);

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

    const handleAddToFavorites = async (song) => {
        const isFavorited = favorites.some((fav) => (fav.id || fav.url) === (song.id || song.url));

        // console.log("Poggers");
        // console.log(song);
        // console.log("Lyrics");
        // console.log(lyricsMap.get(song.id));
        // console.log(lyricsMap)

        const allData = {...song, username: localStorage.getItem("user")};
        const dataToPass = {
            username: JSON.parse(allData.username)?.username ?? allData.username,
            songId: allData.id,
            songName: allData.title,
            songArtist: allData.artist,
            // fullTitle: allData.title + (allData.featuring ? ` (feat. ${allData.featuring})` : ""),
            fullTitle: allData.fullTitle,
            dateReleased: allData.dateReleased,
            album: allData.album,
            lyrics: lyricsMap.get(allData.id)
        }
        // console.log(dataToPass)

        const response = await FavoriteService.addToFavorites(dataToPass);
        const data = await response.json();
        console.log("response:");
        console.log(JSON.stringify(data))

        if (isFavorited) {
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

    return (
        <>
            <div className="song-list-overlay">
                <div className="song-list-backdrop" onClick={onClose}></div>
                <div className="song-list-popup-container">
                    <button className="song-list-close-button" onClick={onClose}>
                        ✕
                    </button>

                    <div className="song-list-content">
                        <h2 className="song-list-title">Songs containing the word '{searchTerm}'</h2>

                        {displaySongs.length === 0 && (
                            <p className="song-list-info">No songs with available lyrics were found containing '{searchTerm}'.</p>
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
                                            key={song.id || song.url}
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