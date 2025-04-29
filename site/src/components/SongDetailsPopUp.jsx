import { X } from "lucide-react"
import "../styles/SongDetailsPopUp.css"

const SongDetailsPopup = ({ song, onClose }) => {
    if (!song) return null

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="song-details-popup">
                <button className="close-button" onClick={onClose} aria-label="Close">
                    <X size={20}/>
                </button>

                <div className="song-details-content" onClick={(e) => e.stopPropagation()}>
                    <div className="album-cover">
                        <img
                            src={song.albumCover || "/placeholder.svg"}
                            alt={`${song.title} album art`}
                            onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder.svg"
                            }}
                        />
                    </div>

                    <div className="popup-song-info">
                        <span className="album-label">Album</span>
                        <h2 className="song-title" data-testid="pop-up-song-title">
                            {song.title}
                        </h2>
                        <span className="artist-name">{song.artist}</span>
                        {song.featuring && <span className="artist-name featuring">feat. {song.featuring}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SongDetailsPopup
