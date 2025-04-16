import { useRef, useEffect } from "react"
import "../styles/SongList.css"

const LyricsPopUp = ({ song, onClose, visible }) => {
    if (!visible || !song) return null

    return (
        <div className="lyrics-popup-overlay">
            <div className="lyrics-popup-backdrop" onClick={onClose}></div>
            <div className="lyrics-popup-container">
                <button className="lyrics-popup-close-button" onClick={onClose}>
                    ✕
                </button>

                <div className="lyrics-popup-content">
                    <div className="lyrics-popup-header">
                        <div className="lyrics-popup-album-art"></div>
                        <div className="lyrics-popup-song-info">
                            <h2 className="lyrics-popup-title">{song.title}</h2>
                            <p className="lyrics-popup-artist">{song.artist}</p>
                        </div>
                    </div>

                    <div className="lyrics-popup-lyrics">
                        {song.lyrics.split("\n").map((line, index) => (
                            <p key={index} className="lyrics-popup-line">
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default LyricsPopUp