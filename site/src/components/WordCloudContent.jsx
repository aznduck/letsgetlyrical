import { useEffect, useState, useCallback } from "react";
import { stemmer } from 'porter-stemmer';
import WordCloudHeader from "../components/WordCloudHeader";
import SongList from "./SongList";
import GeniusService from '../services/GeniusService';
import "../styles/WordCloud.css";
import Cloud from "react-d3-cloud";

const STOP_WORDS = new Set(["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
    "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which",
    "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or",
    "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off",
    "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any",
    "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
    "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]);


function getFrequencies(text, maxWords = 100) {
    if (!text) return [];
    const noBrackets = text.replace(/\[.*?\]/g, "");
    const words = noBrackets.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const freq = {};
    for (let word of words) {
        const cleanedWord = word.replace(/^'|'$/g, '');
        if (!STOP_WORDS.has(cleanedWord) && cleanedWord.length > 1) {
            const stemmed = stemmer(cleanedWord);
            if (stemmed && stemmed.length > 1) {
                freq[stemmed] = (freq[stemmed] || 0) + 1;
            }
        }
    }
    return Object.entries(freq)
        .sort(([, freqA], [, freqB]) => freqB - freqA)
        .slice(0, maxWords)
        .map(([word, frequency]) => ({ word, frequency }));
}

const getGeniusPathFromUrl = (url) => {
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
    const [lyricsMap, setLyricsMap] = useState(new Map());

    useEffect(() => {
        if (!songsData || songsData.length === 0) {
            setWordFrequencies([]);
            setAllLyricsText('');
            setLyricsMap(new Map());
            setIsLoading(false);
            setError(null);
            return;
        }

        const fetchAllLyrics = async () => {
            setIsLoading(true);
            setError(null);
            setAllLyricsText('');
            setWordFrequencies([]);
            const newLyricsMap = new Map();

            const lyricPromises = songsData.map(async (song) => {
                const songId = song.id || song.url;
                if (!song.id) {
                    console.warn(`Song missing 'id' property, using URL as key: ${song.title || song.url}`);
                }
                const geniusPath = getGeniusPathFromUrl(song.url);
                if (geniusPath) {
                    try {
                        const lyrics = await GeniusService.getLyrics("https://genius.com/" + geniusPath);
                        return { songId, lyrics, error: null };
                    } catch (err) {
                        console.error(`Failed to fetch lyrics for ${song.title || 'Unknown Title'} (ID: ${songId}):`, err);
                        return { songId, lyrics: null, error: err };
                    }
                } else {
                    return { songId, lyrics: null, error: new Error('Invalid Genius URL') };
                }
            });

            try {
                const results = await Promise.all(lyricPromises);
                let combinedLyrics = "";
                let successfulFetches = 0;
                results.forEach(result => {
                    if (result.lyrics) {
                        combinedLyrics += result.lyrics + "\n\n";
                        newLyricsMap.set(result.songId, result.lyrics);
                        successfulFetches++;
                    } else {
                        newLyricsMap.set(result.songId, null);
                    }
                });
                setLyricsMap(newLyricsMap);
                setAllLyricsText(combinedLyrics);
                if (successfulFetches === 0 && songsData.length > 0) {
                    setError(`Failed to fetch lyrics for all ${songsData.length} songs.`);
                } else if (successfulFetches < songsData.length) {
                    setError(`Warning: Fetched lyrics for ${successfulFetches} out of ${songsData.length} songs.`);
                } else { setError(null); }
            } catch (err) {
                console.error("Unexpected error during lyric fetching:", err);
                setError("An unexpected error occurred while fetching lyrics.");
                setLyricsMap(new Map()); setAllLyricsText('');
            } finally { setIsLoading(false); }
        };
        fetchAllLyrics();
    }, [songsData]);

    useEffect(() => {
        if (allLyricsText && !isLoading) {
            const frequencies = getFrequencies(allLyricsText);
            setWordFrequencies(frequencies);
        } else if (!isLoading) {
            setWordFrequencies([]);
        }
    }, [allLyricsText, isLoading]);

    const handleTypeChange = useCallback((type) => {
        setSelectedType(type);
        setSelectedWord(null);
        setShowSongList(false);
    }, []);

    const handleWordClick = useCallback((wordData) => {
        if (!wordData) return;
        setSelectedWord(wordData);
        setShowSongList(true);
    }, []);

    const handleCloseSongList = useCallback(() => {
        setShowSongList(false);
        setSelectedWord(null);
    }, []);


    const renderContent = () => {
        if (isLoading) return <div className="word-cloud-loading">Fetching lyrics and generating cloud...</div>;
        if (error && wordFrequencies.length === 0) return <div className="word-cloud-error">Error: {error}</div>;
        if (wordFrequencies.length === 0 && !isLoading) {
            if (songsData && songsData.length > 0) {
                if (!error) return <div className="word-cloud-info">No significant words found or lyrics unavailable.</div>;
                else return null;
            } else return <div className="word-cloud-info">No songs to generate a word cloud.</div>;
        }

        if (selectedType === "table") {
            return (
                <div className="word-table-container">
                    {error && <div className="word-cloud-warning">Warning: {error}</div>}
                    <div className="word-table-header">/* ... */</div>
                    <div className="word-table-body">
                        {wordFrequencies.map((item, index) => (
                            <div key={`${item.word}-${index}`} /* ... */ onClick={() => handleWordClick(item)}>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        else {
            const cloudData = wordFrequencies.map(({ word, frequency }) => ({
                text: word, value: frequency,
            }));
            const rotate = 0;
            const random = () => 0.5;

            return (
                <div className="word-cloud-container">
                    {error && <div className="word-cloud-warning">Warning: {error}</div>}
                    <div className="wordcloud-wrapper" style={{ height: '100%', width: '100%' }}>
                        <Cloud
                            data={cloudData}
                            fontSizeMapper={word => Math.max(18, Math.min(70, word.value))}
                            rotate={rotate}
                            font="Inter"
                            padding={2}
                            random={random}
                            fill={(d, i) => {
                                // Cycle through pink, light blue, and white
                                const colorIndex = i % 3
                                if (colorIndex === 0) return "#f8c8dc" // Pink
                                if (colorIndex === 1) return "#6ecad6" // Light blue
                                return "#ffffff" // White
                            }}
                            onWordClick={(wordObj) => {
                                const originalWordData = wordFrequencies.find(wf => wf.word === wordObj.text);
                                handleWordClick(originalWordData || { word: wordObj.text, frequency: wordObj.value });
                            }}
                            width={500} height={400}
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