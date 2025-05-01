import { useRef, useState, useEffect } from "react"
import { Edit, Check } from "lucide-react"
import "../styles/WordCloud.css"

const WordCloudHeader = ({
                             title = "Your Word Cloud",
                             variant = "default",
                             selectedType = "cloud",
                             isCloudGenerated = false,
                             onTypeChange,
                             onAddFavorites,
                             onGenerateFavorites,
                             onCompareWithFriends,
                         }) => {
    const [showTypeSelector, setShowTypeSelector] = useState(false)
    const editButtonRef = useRef(null)
    const typeSelectorRef = useRef(null)
    const firstOptionRef = useRef(null)
    const lastOptionRef = useRef(null)

    const handleEditClick = () => {
        setShowTypeSelector(!showTypeSelector)
    }

    const handleTypeSelect = (type) => {
        if (onTypeChange) {
            onTypeChange(type)
        }
        setShowTypeSelector(false)
        // Return focus to the edit button after selection
        editButtonRef.current?.focus()
    }

    // Close the type selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showTypeSelector &&
                typeSelectorRef.current &&
                !typeSelectorRef.current.contains(event.target) &&
                !editButtonRef.current.contains(event.target)
            ) {
                setShowTypeSelector(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showTypeSelector])

    // Handle keyboard navigation in dropdown
    useEffect(() => {
        if (showTypeSelector) {
            // Focus the first option when dropdown opens
            firstOptionRef.current?.focus()

            const handleKeyDown = (e) => {
                switch (e.key) {
                    case "Escape":
                        setShowTypeSelector(false)
                        editButtonRef.current?.focus()
                        break
                    case "ArrowDown":
                        e.preventDefault()
                        if (document.activeElement === firstOptionRef.current) {
                            lastOptionRef.current?.focus()
                        } else {
                            firstOptionRef.current?.focus()
                        }
                        break
                    case "ArrowUp":
                        e.preventDefault()
                        if (document.activeElement === lastOptionRef.current) {
                            firstOptionRef.current?.focus()
                        } else {
                            lastOptionRef.current?.focus()
                        }
                        break
                    default:
                        break
                }
            }

            document.addEventListener("keydown", handleKeyDown)
            return () => {
                document.removeEventListener("keydown", handleKeyDown)
            }
        }
    }, [showTypeSelector])

    // Determine the title based on the effective variant
    let headerTitle = "Your Word Cloud" // Default title

    if (variant === "favorites" && selectedType === "cloud") {
        headerTitle = "Your Favorites Word Cloud"
    } else if (variant === "favorites" && selectedType === "table") {
        headerTitle = "Your Favorites Word Table"
    } else if (variant === "default" && selectedType === "table") {
        headerTitle = "Your Word Table"
    }

    return (
        <div
            className={`word-cloud-header word-cloud-header-${variant} 
            ${selectedType === "table" ? "word-cloud-header-table" : ""}`}
            role="region"
            aria-labelledby="word-cloud-title"
        >
            <div className="word-cloud-title-container">
                <h2 id="word-cloud-title">{headerTitle}</h2>
                <div className="edit-button-container">
                    <button
                        ref={editButtonRef}
                        className="edit-button"
                        onClick={handleEditClick}
                        aria-label="Edit word cloud type"
                        aria-expanded={showTypeSelector}
                        aria-haspopup="listbox"
                    >
                        <Edit size={20} aria-hidden="true" />
                        <span className="sr-only">Change view type</span>
                    </button>

                    {showTypeSelector && (
                        <div
                            ref={typeSelectorRef}
                            className="type-selector-dropdown"
                            role="listbox"
                            aria-label="Select view type"
                            tabIndex={-1}
                        >
                            <button
                                ref={firstOptionRef}
                                className={`type-option ${selectedType === "cloud" ? "selected" : ""}`}
                                onClick={() => handleTypeSelect("cloud")}
                                role="option"
                                aria-selected={selectedType === "cloud"}
                                tabIndex={0}
                            >
                                Cloud {selectedType === "cloud" && <Check size={20} aria-hidden="true" />}
                            </button>
                            <button
                                ref={lastOptionRef}
                                className={`type-option ${selectedType === "table" ? "selected" : ""}`}
                                onClick={() => handleTypeSelect("table")}
                                role="option"
                                aria-selected={selectedType === "table"}
                                tabIndex={0}
                            >
                                Table {selectedType === "table" && <Check size={20} aria-hidden="true" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="word-cloud-actions">
                {variant === "default" && onAddFavorites && (
                    <button className="add-favorites-button" onClick={onAddFavorites} aria-label="Add your favorites list">
                        Add your favorites list
                    </button>
                )}

                {variant === "favorites" && (
                    <>
                        {onGenerateFavorites && (
                            <button
                                className={`generate-favorites-button ${isCloudGenerated ? "selected" : ""}`}
                                onClick={onGenerateFavorites}
                                disabled={isCloudGenerated}
                                aria-pressed={isCloudGenerated}
                                aria-label={isCloudGenerated ? "Favorites cloud generated" : "Generate favorites cloud"}
                            >
                                Generate favorites cloud
                            </button>
                        )}
                        {onCompareWithFriends && (
                            <button
                                className="compare-friends-button"
                                onClick={onCompareWithFriends}
                                aria-label="Compare with friends"
                            >
                                Compare with friends!
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default WordCloudHeader
