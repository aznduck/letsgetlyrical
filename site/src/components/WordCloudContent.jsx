import { useEffect, useState } from "react";
import WordCloudHeader from "../components/WordCloudHeader";
import SongList from "./SongList";
import GeniusService from '../services/GeniusService';
import "../styles/WordCloud.css";
import WordCloud from "react-d3-cloud";

const STOP_WORDS = new Set([
    "the", "and", "it", "is", "in", "of", "on", "to", "for", "a", "an", "this", "i",
    "that", "with", "as", "was", "were", "by", "are", "at", "from", "but", "be", "my",
    "has", "have", "had", "he", "she", "they", "them", "his", "her", "their", "you",
    "me", "im", "its", "its", "oh", "ooh", "yeah", "uh", "dont", "do", "not", "your",
    "we", "will", "all", "just", "like", "im", "ill", "cant", "can", "get", "go",
    "got", "know", "no", "up", "out", "if", "so", "what", "when", "why", "how",
    "lyrics",
]);

function stem(word) {
    return word
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .replace(/(ing|ed|s|es|ly|er|est)$/, "");
}

export function getFrequencies(text, maxWords = 100) {
    if (!text) return [];
    const noBrackets = text.replace(/\[.*?\]/g, "");
    const words = noBrackets.toLowerCase().match(/\b[a-z']+\b/g) || [];

    const freq = {};
    for (let word of words) {
        const cleanedWord = word.replace(/^'|'$/g, '');
        if (!STOP_WORDS.has(cleanedWord) && cleanedWord.length > 1) {
            const stemmed = stem(cleanedWord);
            if (stemmed.length > 1) {
                freq[stemmed] = (freq[stemmed] || 0) + 1;
            }
        }
    }

    return Object.entries(freq)
        .sort(([, freqA], [, freqB]) => freqB - freqA)
        .slice(0, maxWords)
        .map(([word, frequency]) => ({ word, frequency }));
}

export const getGeniusPathFromUrl = (url) => {
    try {
        if (!url) return null;
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.startsWith('/') ? parsedUrl.pathname.substring(1) : parsedUrl.pathname;
    } catch (e) {
        console.error("Error parsing URL:", url, e);
        return null;
    }
};

const WordCloudContent = ({
                       songsData = [],
                       variant = "default",
                       onAddFavorites,
                       onCompareWithFriends,
                   }) => {
    const [selectedType, setSelectedType] = useState("cloud");
    const [wordFrequencies, setWordFrequencies] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);
    const [showSongList, setShowSongList] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allLyricsText, setAllLyricsText] = useState('');

    useEffect(() => {
        if (!songsData || songsData.length === 0) {
            setWordFrequencies([]);
            setAllLyricsText('');
            setIsLoading(false);
            setError(null);
            return;
        }

        const fetchAllLyrics = async () => {
            setIsLoading(true);
            setError(null);
            setAllLyricsText('');
            setWordFrequencies([]);

            const lyricPromises = songsData
                .map(song => {
                    const geniusPath = getGeniusPathFromUrl(song.url);
                    if (geniusPath) {
                        console.log(`Workspaceing lyrics for path: ${geniusPath} (from ${song.url})`);
                        return GeniusService.getLyrics("https://genius.com/" + geniusPath)
                            .catch(err => {
                                console.error(`Failed to fetch lyrics for ${song.title} (${geniusPath}):`, err);
                                return null;
                            });
                    } else {
                        console.warn(`Could not parse Genius path from URL for song: ${song.title} (${song.url})`);
                        return Promise.resolve(null);
                    }
                })
                .filter(promise => promise !== null);

            try {
                const results = await Promise.allSettled(lyricPromises);

                let combinedLyrics = "";
                let successfulFetches = 0;
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value) {
                        combinedLyrics += result.value + "\n\n";
                        successfulFetches++;
                    }
                });

                if (successfulFetches === 0 && songsData.length > 0) {
                    setError(`Failed to fetch lyrics for all ${songsData.length} songs. Cannot generate word cloud.`);
                    setAllLyricsText('');
                } else {
                    setAllLyricsText(combinedLyrics);
                    if (successfulFetches < songsData.length) {
                        console.warn(`Successfully fetched lyrics for ${successfulFetches} out of ${songsData.length} songs.`);
                    }
                }
            } catch (err) {
                console.error("Unexpected error during lyric fetching process:", err);
                setError("An unexpected error occurred while fetching lyrics.");
                setAllLyricsText('');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllLyrics();
    }, [songsData]);

    useEffect(() => {
        if (allLyricsText && !isLoading) {
            const frequencies = getFrequencies(allLyricsText);
            console.log("Calculated Frequencies:", frequencies);
            setWordFrequencies(frequencies);
        } else {
            setWordFrequencies([]);
        }
    }, [allLyricsText, isLoading]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
        setSelectedWord(null);
        setShowSongList(false);
    };

    const handleWordClick = (word) => {
        setSelectedWord(word);
        setShowSongList(true);
        console.log(`Word clicked: ${word.word} (${word.frequency})`);
    };

    const handleCloseSongList = () => {
        setShowSongList(false);
        setSelectedWord(null);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="word-cloud-loading">Fetching lyrics and generating cloud...</div>;
        }

        if (error) {
            return <div className="word-cloud-error">Error: {error}</div>;
        }

        if (wordFrequencies.length === 0 && !isLoading) {
            if (songsData && songsData.length > 0) {
                return <div className="word-cloud-info">No significant words found or lyrics unavailable for the selected songs.</div>;
            } else {
                return null;
            }
        }

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
                                        handleWordClick(item);
                                    }
                                }}
                            >
                                <div className="frequency-column">{item.frequency}</div>
                                <div className="word-column">{item.word}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="word-cloud-container">
                    <div className="wordcloud-wrapper">
                        <WordCloud
                            data={wordFrequencies.map(({ word, frequency }) => ({
                                text: word,
                                value: frequency,
                            }))}
                            fontSizeMapper={word => Math.max(18, Math.min(70, word.value))}
                            rotate={0} // Fixed rotation to 0
                            font="Impact"
                            padding={1}
                            random={() => 0.5} // Fixed random value to prevent dynamic movement
                            onWordClick={wordObj => handleWordClick(
                                wordFrequencies.find(wf => wf.word === wordObj.text) || { word: wordObj.text, frequency: wordObj.value}
                            )}
                        />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={`word-cloud-section ${selectedType === "table" ? "word-cloud-section-table" : ""}`}>
            <WordCloudHeader
                variant={variant}
                selectedType={selectedType}
                onTypeChange={handleTypeChange}
                onAddFavorites={onAddFavorites}
                onCompareWithFriends={onCompareWithFriends}
            />

            {renderContent()}

            {showSongList && selectedWord && (
                <SongList
                    searchTerm={selectedWord.word}
                    songs={songsData}
                    onClose={handleCloseSongList}
                />
            )}
        </div>
    );
};

export default WordCloudContent;