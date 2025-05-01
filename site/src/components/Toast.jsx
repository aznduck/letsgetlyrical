import { useEffect, useState } from "react"
import "../styles/SongList.css"

function Toast({ message, type, visible, onClose }) {
    // Add console logs to debug
    console.log("Toast rendered with visible:", visible)

    // Simple effect to close the toast after 3 seconds
    useEffect(() => {
        console.log("Toast useEffect triggered, visible:", visible)

        // Only set the timer if the toast is visible
        if (visible) {
            console.log("Setting timer to close toast in 3 seconds")

            // Set a timeout to close the toast after 3 seconds
            const timer = setTimeout(() => {
                console.log("Timer expired, calling onClose")
                onClose()
            }, 2000)

            // Clean up the timer when the component unmounts or when dependencies change
            return () => {
                console.log("Cleaning up timer")
                clearTimeout(timer)
            }
        }
    }, [visible, onClose])

    // Don't render anything if not visible
    if (!visible) return null

    return (
        <div
            className={`toast-container ${type === "success" ? "toast-success" : "toast-error"}`}
            onClick={onClose} // Add click handler to close on click anywhere on the toast
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            tabIndex={-1}
        >
            <span className="toast-icon" aria-hidden="true">{type === "success" ? "✓" : "✕"}</span>
            <span className="toast-message">{message}</span>
        </div>
    )
}

export default Toast
