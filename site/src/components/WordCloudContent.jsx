import {useEffect, useState, useCallback} from "react";
import {stemmer} from "porter-stemmer";
import WordCloudHeader from "../components/WordCloudHeader";
import SongList from "./SongList";
import GeniusService from "../services/GeniusService";
import "../styles/WordCloud.css";
import Cloud from "react-d3-cloud";

const STOP_WORDS = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his",
    "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what",
    "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of",
    "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to",
    "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
    "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
]);

function getFrequencies(text, maxWords = 100) {
    console.log("--- Running getFrequencies ---");
    if (!text) {
        console.log("getFrequencies: No text provided.");
        return [];
    }
    const noBrackets = text.replace(/\[.*?\]/g, "");
    const words = noBrackets.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const freq = {};

    console.log(`getFrequencies: Found ${words.length} potential words.`);

    for (let rawWord of words) {
        const cleaned = rawWord.replace(/^'|'$/g, "");

        if (!STOP_WORDS.has(cleaned) && cleaned.length > 1) {
            let stemmed = null; // Initialize stemmed to null
            try {
                stemmed = stemmer(cleaned); // Make sure 'stemmer' is the correct function call
            } catch (err) {
                console.error(`getFrequencies: Stemmer error on cleaned word "${cleaned}"`, err);
                continue; // Skip this word if stemmer fails
            }


            // *** More Robust Check ***
            // Ensure stemmed is a non-empty string and has length > 1
            if (typeof stemmed === 'string' && stemmed.trim().length > 1) {
                // Use the valid stemmed word as the key
                const key = stemmed.trim(); // Trim just in case
                freq[key] = (freq[key] || 0) + 1;
            }
        }
    }

    const freqEntries = Object.entries(freq);
    console.log(`getFrequencies: Generated ${freqEntries.length} unique stemmed words.`);

    const sortedFrequencies = freqEntries
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxWords)
        .map(([wordKey, frequency]) => {
            // *** Check HERE during mapping ***
            if (typeof wordKey !== 'string' || wordKey.trim().length === 0) {
                console.error(`!!! getFrequencies: Mapping detected invalid word key: '${wordKey}' (Type: ${typeof wordKey}) with frequency ${frequency}`);
                return { word: "INVALID_WORD", frequency }; // Assign placeholder or filter out
            }
            return { word: wordKey, frequency };
        });

    // Filter out any potential invalid entries if necessary (optional)
    const finalFrequencies = sortedFrequencies.filter(item => item.word !== "INVALID_WORD");


    console.log(`getFrequencies: Returning ${finalFrequencies.length} words.`);
    // console.log("getFrequencies final list (sample):", finalFrequencies.slice(0, 10)); // Log sample output
    console.log("--- Finished getFrequencies ---");
    return finalFrequencies;
}

const getGeniusPathFromUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
    } catch (err) {
        console.error("Error parsing URL:", url, err);
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
    const [allLyricsText, setAllLyricsText] = useState("");
    const [lyricsMap, setLyricsMap] = useState(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSongList, setShowSongList] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!songsData.length) {
            setWordFrequencies([]);
            setAllLyricsText("");
            setLyricsMap(new Map());
            setIsLoading(false);
            setError(null);
            return;
        }

        const fetchAllLyrics = async () => {
            setIsLoading(true);
            setError(null);
            setWordFrequencies([]);
            setAllLyricsText("");
            const newLyrics = new Map();

            const tasks = songsData.map(async (song) => {
                const songId = song.id || song.url;
                const path = getGeniusPathFromUrl(song.url);
                if (!path) return {songId, lyrics: null, ok: false};
                try {
                    const lyrics = await GeniusService.getLyrics(`https://genius.com/${path}`);
                    return {songId, lyrics, ok: true};
                } catch (err) {
                    console.error(`Lyric fetch failed for ${song.title ?? song.url}:`, err);
                    return {songId, lyrics: null, ok: false};
                }
            });

            try {
                const results = await Promise.all(tasks);
                let combined = "";
                let success = 0;
                results.forEach(({songId, lyrics, ok}) => {
                    newLyrics.set(songId, lyrics);
                    if (ok && lyrics) {
                        combined += `${lyrics}\n\n`;
                        success += 1;
                    }
                });
                setLyricsMap(newLyrics);
                setAllLyricsText(combined);
                if (!success) setError(`Failed to fetch lyrics for all ${songsData.length} songs.`);
                else if (success < songsData.length) setError(`Fetched lyrics for ${success}/${songsData.length} songs.`);
            } catch (err) {
                console.error("Unexpected error while fetching lyrics:", err);
                setError("Unexpected error while fetching lyrics.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllLyrics();
    }, [songsData]);

    useEffect(() => {
        if (allLyricsText && !isLoading) setWordFrequencies(getFrequencies(allLyricsText));
        else if (!isLoading) setWordFrequencies([]);
    }, [allLyricsText, isLoading]);

    const handleTypeChange = useCallback((type) => {
        setSelectedType(type);
        setSelectedWord(null);
        setShowSongList(false);
    }, []);

    // Inside WordCloud component

    const handleWordClick = useCallback((data) => {
        console.log("handleWordClick received data:", data);
        if (!data) {
            console.warn("handleWordClick received null/undefined data.");
            return;
        }

        const term = data.word ?? data.text ?? "";

        const frequency = data.frequency ?? data.value ?? 0;

        console.log(`handleWordClick extracted term: '${term}', frequency/value: ${frequency}`);

        const trimmedTerm = term.trim();
        if (trimmedTerm.length > 0) {
            setSearchTerm(trimmedTerm);
            setSelectedWord({ word: trimmedTerm, frequency: frequency });
            setShowSongList(true);
        } else {
            console.warn(`handleWordClick: Extracted term ('${term}') is empty or whitespace. SongList will not be shown.`);
        }
    }, [setSearchTerm, setSelectedWord, setShowSongList]);

    const handleCloseSongList = useCallback(() => {
        setShowSongList(false);
        setSelectedWord(null);
        setSearchTerm("");
    }, []);

    const fontSizeMapper = useCallback((w) => Math.max(18, Math.min(70, Math.log2(w.value + 1) * 8)), []);

    const renderContent = () => {
        if (isLoading) return <div className="word-cloud-loading">Fetching lyrics…</div>;
        if (error && !wordFrequencies.length) return <div className="word-cloud-error">Error: {error}</div>;
        if (!wordFrequencies.length)
            return (
                <div className="word-cloud-info">
                    {songsData.length ? "No significant words found." : "Select songs to generate a word cloud."}
                </div>
            );

        if (selectedType === "table") {
            return (
                <div className="word-table-container">
                    {error && <div className="word-cloud-warning">{error}</div>}
                    <div className="word-table-body">
                        {wordFrequencies.map((item, idx) => (
                            <div key={`${item.word}-${idx}`} onClick={() => {
                                console.log("Table Row Clicked. Item:", item);
                                handleWordClick(item)
                            }}
                                 className="word-table-row">
                                {item.word} – {item.frequency}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        const cloudData = wordFrequencies.map(({word, frequency}) => ({text: word, value: frequency}));
        return (
            <div className="word-cloud-container">
                {error && <div className="word-cloud-warning">{error}</div>}
                <div className="wordcloud-wrapper" style={{height: 400, width: "100%"}}>
                    <Cloud
                        data={cloudData}
                        fontSizeMapper={fontSizeMapper}
                        rotate={0}
                        font="Impact"
                        padding={2}
                        random={() => 0.5}
                        onWordClick={(event, wordData) => {
                            console.log("Cloud onWordClick - wordData object received:", wordData);

                            if (!wordData || typeof wordData.text === 'undefined') {
                                console.error("Cloud onWordClick: Second argument 'wordData' is missing or invalid:", wordData);
                                return;
                            }

                            console.log("Cloud passing wordData directly to handleWordClick:", wordData);
                            handleWordClick(wordData);

                        }}
                        width={500}
                        height={400}
                    />
                </div>
            </div>
        );
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
            {showSongList && (
                <SongList searchTerm={searchTerm} songs={songsData} lyricsMap={lyricsMap}
                          onClose={handleCloseSongList}/>
            )}
        </div>
    );
};

export default WordCloudContent;
