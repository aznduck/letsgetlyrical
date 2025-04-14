import {useEffect, useState} from "react"
import WordCloudHeader from "../components/WordCloudHeader"
import "../styles/WordCloud.css"

const WordCloud = ({
                       words = ["test", "test2"],
                       variant = "default",
                       isCloudGenerated = false,
                       onAddFavorites,
                       onGenerateFavorites,
                       onCompareWithFriends,
                   }) => {
    const [selectedType, setSelectedType] = useState("cloud")
    const [wordFrequencies, setWordFrequencies] = useState([])
    const [selectedWord, setSelectedWord] = useState(null)
    const [cloudGenerated, setCloudGenerated] = useState(isCloudGenerated)

    useEffect(() => {
        setCloudGenerated(isCloudGenerated)
    }, [isCloudGenerated])

    useEffect(() => {
        if (words.length > 0) {
            const mockWordFrequencies = [
                { word: "BABY", frequency: 30 },
                { word: "BIEBER", frequency: 25 },
                { word: "JUSTIN", frequency: 25 },
                { word: "NEVER", frequency: 25 },
                { word: "PICK", frequency: 24 },
                { word: "LIKE", frequency: 22 },
                { word: "SAY", frequency: 20 },
                { word: "UH-HUH", frequency: 16 },
                { word: "MINE", frequency: 13 },
                { word: "THOUGHT", frequency: 10 },
                { word: "CAUSE", frequency: 9 },
                { word: "GONE", frequency: 9 },
                { word: "NE-NEVER", frequency: 9 },
                { word: "BEAUTY", frequency: 8 },
                { word: "EVER", frequency: 7 },
                { word: "FIGHT", frequency: 7 },
                { word: "MAKE", frequency: 7 },
                { word: "NOW", frequency: 7 },
                { word: "ALWAYS", frequency: 6 },
                { word: "CAN", frequency: 6 },
                { word: "GIRL", frequency: 6 },
                { word: "LOVE", frequency: 6 },
            ]
            setWordFrequencies(mockWordFrequencies)
        } else {
            setWordFrequencies([{ word: "CLOUD", frequency: 1 }])
        }
    }, [words])

    const handleTypeChange = (type) => {
        setSelectedType(type)
    }

    const handleWordClick = (word) => {
        setSelectedWord(word)
        console.log(`Word clicked: ${word.word} (${word.frequency})`)
        //additional functionality when a word is clicked
    }

    const handleGenerateFavorites = () => {
        setCloudGenerated(true)
        if (onGenerateFavorites) {
            onGenerateFavorites()
        }
    }

    const renderContent = () => {
        if (selectedType === "table") {
            return (
                <div className="word-table-container">
                    <div className="word-table-header">
                        <div className="frequency-column">Frequency</div>
                        <div className="word-column">Word</div>
                    </div>
                    <div className="word-table-body">
                        {wordFrequencies.map((item, index) => (
                            <div
                                key={`${item.word}-${index}`}
                                className={`word-table-row ${selectedWord?.word === item.word ? "selected" : ""}`}
                                onClick={() => handleWordClick(item)}
                                role="button"
                                tabIndex={0}
                                aria-label={`${item.word}: ${item.frequency} occurrences`}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleWordClick(item)
                                    }
                                }}
                            >
                                <div className="frequency-column">{item.frequency}</div>
                                <div className="word-column">{item.word}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="word-cloud-container">
                    <div className={`simple-cloud ${isCloudGenerated ? "generated" : ""}`}>
                        <span className="cloud-text">CLOUD</span>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className={`word-cloud-section ${selectedType === "table" ? "word-cloud-section-table" : ""}`}>
            <WordCloudHeader
                variant={variant}
                selectedType={selectedType}
                isCloudGenerated={cloudGenerated}
                onTypeChange={handleTypeChange}
                onAddFavorites={onAddFavorites}
                onGenerateFavorites={handleGenerateFavorites}
                onCompareWithFriends={onCompareWithFriends}
            />

            {renderContent()}
        </div>
    )
}

export default WordCloud