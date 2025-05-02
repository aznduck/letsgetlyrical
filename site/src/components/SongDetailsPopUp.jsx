import { X } from "lucide-react"
import "../styles/SongDetailsPopUp.css"
import {useModalFocus} from "../hooks/UseModalFocus";

const SongDetailsPopup = ({ song, onClose }) => {
    const popupRef = useModalFocus(!!song, onClose)

    if (!song) return null

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="song-details-popup"
                 ref={popupRef} tabIndex={-1}>
                <button className="close-button" onClick={onClose} aria-label="Close song details">
                    <X size={20} aria-hidden="true"/>
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
                        <span className="album-label" id="album-label">Album</span>
                        <h2 className="song-title" id="song-details-title" data-testid="pop-up-song-title">
                            {song.title}
                        </h2>
                        <span className="artist-name" id="artist-name">{song.artist}</span>
                        {song.featuring && <span className="artist-name featuring"
                                                 id="featuring-artists">feat. {song.featuring}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SongDetailsPopup
