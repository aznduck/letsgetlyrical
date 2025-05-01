import { AlertCircle, CheckCircle } from "lucide-react"
import {useEffect, useRef} from "react";

export const SuccessModal = () => {
    const modalRef = useRef(null)

    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.focus()
        }

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <div className="modal-overlay"
             role="dialog"
             aria-modal="true"
             aria-labelledby="success-title"
             aria-describedby="success-description"
        >
            <div className="success-modal" ref={modalRef} tabIndex={-1}>
                <div className="success-icon" aria-hidden="true">
                    <CheckCircle size={50} />
                </div>
                <h2 id="success-title">Account Created!</h2>
                <p id="success-description">Your account has been created successfully.</p>
                <p className="redirect-text" aria-live="polite">Redirecting to login...</p>
            </div>
        </div>
    )
}

export const CancelModal = ({ onConfirm, onCancel }) => {
    const cancelButtonRef = useRef(null)

    useEffect(() => {
        if (cancelButtonRef.current) {
            cancelButtonRef.current.focus()
        }

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onCancel()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [onCancel])

    return (
        <div className="modal-overlay"
             role="dialog"
             aria-modal="true"
             aria-labelledby="cancel-title"
             aria-describedby="cancel-description"
        >
            <div className="cancel-modal">
                <div className="cancel-icon" aria-hidden="true">
                    <AlertCircle size={50} />
                </div>
                <h2 id="cancel-title">Are you sure?</h2>
                <p id="cancel-description">All info entered will be cleared.</p>
                <div className="cancel-buttons">
                    <button className="cancel-button-secondary" onClick={onCancel} ref={cancelButtonRef}>
                        No, continue
                    </button>
                    <button className="cancel-button-primary" onClick={onConfirm}>
                        Yes, cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
