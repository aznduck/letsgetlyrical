import "../styles/SongList.css";
import {useModalFocus} from "../hooks/UseModalFocus";

const LyricsPopUp = ({ song, onClose, visible }) => {
    const popupRef = useModalFocus(visible, onClose)

    if (!visible || !song) return null;

    const lyricsLines = typeof song.lyrics === 'string'
        ? song.lyrics.split("\n")
        : [song.lyrics || ""];

    return (
        <div className="lyrics-popup-overlay"
             role="dialog" aria-modal="true" aria-labelledby="lyrics-title">
            <div className="lyrics-popup-backdrop" onClick={onClose} aria-hidden="true"></div>
            <div className="lyrics-popup-container" ref={popupRef} tabIndex={-1}>
                <button className="lyrics-popup-close-button" onClick={onClose} aria-label="Close lyrics">
                    ✕
                </button>

                <div className="lyrics-popup-content">
                    <div className="lyrics-popup-header">
                        <div className="lyrics-popup-album-art" aria-hidden="true">
                        </div>
                        <div className="lyrics-popup-song-info">
                            <h2 className="lyrics-popup-title" id="lyrics-title">
                                {song.title || "Unknown Title"}</h2>
                            <p className="lyrics-popup-artist">
                                {song.artist || "Unknown Artist"}</p>
                        </div>
                    </div>

                    <div className="lyrics-popup-lyrics" aria-label="Song lyrics">
                        {lyricsLines.length > 0 && lyricsLines[0] !== "" ? (
                            lyricsLines.map((line, index) => (
                                <p key={index} className="lyrics-popup-line">
                                    {line || <br />}
                                </p>
                            ))
                        ) : (
                            <p className="lyrics-popup-line">Lyrics not available or empty.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LyricsPopUp;