import { useRef, useEffect } from "react"

/**
 * Custom hook to handle focus management for modal dialogs
 * @param {boolean} isVisible - Whether the modal is visible
 * @param {Function} onClose - Function to close the modal
 * @returns {React.RefObject} - Ref to attach to the modal container
 */
export const useModalFocus = (isVisible, onClose) => {
    const modalRef = useRef(null)
    const lastFocusedElementRef = useRef(null)

    useEffect(() => {
        if (isVisible && modalRef.current) {
            lastFocusedElementRef.current = document.activeElement

            modalRef.current.focus()

            const handleKeyDown = (e) => {
                if (e.key === "Escape") {
                    onClose()
                }
            }

            document.addEventListener("keydown", handleKeyDown)
            return () => {
                document.removeEventListener("keydown", handleKeyDown)
                if (lastFocusedElementRef.current) {
                    lastFocusedElementRef.current.focus()
                }
            }
        }
    }, [isVisible, onClose])

    return modalRef
}
