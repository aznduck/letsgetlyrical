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

    const handleEditClick = () => {
        setShowTypeSelector(!showTypeSelector)
    }

    const handleTypeSelect = (type) => {
        if (onTypeChange) {
            onTypeChange(type)
        }
        setShowTypeSelector(false)
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
        <div className={`word-cloud-header word-cloud-header-${variant} 
            ${selectedType === "table" ? "word-cloud-header-table" : ""}`}>
            <div className="word-cloud-title-container">
                <h2>{headerTitle}</h2>
                <div className="edit-button-container">
                    <button
                        ref={editButtonRef}
                        className="edit-button"
                        onClick={handleEditClick}
                        aria-label="Edit word cloud type"
                        aria-expanded={showTypeSelector}
                    >
                        <Edit size={20} />
                    </button>

                    {showTypeSelector && (
                        <div ref={typeSelectorRef} className="type-selector-dropdown">
                            <button
                                className={`type-option ${selectedType === "cloud" ? "selected" : ""}`}
                                onClick={() => handleTypeSelect("cloud")}
                            >
                                Cloud {selectedType === "cloud" && <Check size={20} />}
                            </button>
                            <button
                                className={`type-option ${selectedType === "table" ? "selected" : ""}`}
                                onClick={() => handleTypeSelect("table")}
                            >
                                Table {selectedType === "table" && <Check size={20} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="word-cloud-actions">
                {variant === "default" && onAddFavorites && (
                    <button className="add-favorites-button" onClick={onAddFavorites}>
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
                            >
                                Generate favorites cloud
                            </button>
                        )}
                        {onCompareWithFriends && (
                            <button className="compare-friends-button" onClick={onCompareWithFriends}>
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
