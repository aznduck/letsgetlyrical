import { AlertCircle, CheckCircle } from "lucide-react"

export const SuccessModal = () => {
    return (
        <div className="modal-overlay">
            <div className="success-modal">
                <div className="success-icon">
                    <CheckCircle size={50} />
                </div>
                <h2>Account Created!</h2>
                <p>Your account has been created successfully.</p>
                <p className="redirect-text">Redirecting to login...</p>
            </div>
        </div>
    )
}

export const CancelModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="cancel-modal">
                <div className="cancel-icon">
                    <AlertCircle size={50} />
                </div>
                <h2>Are you sure?</h2>
                <p>All info entered will be cleared.</p>
                <div className="cancel-buttons">
                    <button className="cancel-button-secondary" onClick={onCancel}>
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
