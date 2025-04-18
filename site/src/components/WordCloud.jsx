import { useEffect, useRef, useState } from "react";
import WordCloudHeader from "../components/WordCloudHeader";
import SongList from "./SongList";
import "../styles/WordCloud.css";
import ReactWordcloud from "react-d3-cloud";

const WordCloud = ({
                       words = ["test", "test2"],
                       variant = "default",
                       isCloudGenerated = false,
                       onAddFavorites,
                       onGenerateFavorites,
                       onCompareWithFriends,
                   }) => {
    const [selectedType, setSelectedType] = useState("table");
    const [wordFrequencies, setWordFrequencies] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);
    const [cloudGenerated, setCloudGenerated] = useState(isCloudGenerated);
    const [showSongList, setShowSongList] = useState(false);

    const sampleSongs = [
        {
            id: 1,
            title: "Baby",
            artist: "Justin Bieber",
            year: 2010,
            frequency: 42,
            lyrics: `Oh-ooh-whoa-oh-oh-oh-oh
Oh-ooh-whoa-oh-oh-oh-oh
Oh-ooh-whoa-oh, oh-oh-oh-oh

You know you love me (yo), I know you care (uh-huh)
Just shout whenever (yo), and I'll be there (uh-huh)
You are my love (yo), you are my heart (uh-huh)
And we will never, ever, ever be apart (yo, uh-huh)

Are we an item? (Yo), girl, quit playin' (uh-huh)
"We're just friends" (yo), what are you sayin'? (Uh-huh)
Said, "There's another" (yo), and looked right in my eyes (uh-huh)
My first love broke my heart for the first time, and I was like (yo, uh-huh)

"Baby, baby, baby, oh"
Like, "Baby, baby, baby, no"
Like, "Baby, baby, baby, oh"
I thought you'd always be mine, mine

"Baby, baby, baby, oh"
Like, "Baby, baby, baby, no"
Like, "Baby, baby, baby, oh"
I thought you'd always be mine, mine

Oh, for you, I would've done whatever (uh-huh)
And I just can't believe (yo) we ain't together (uh-huh)
And I wanna play it cool (yo), but I'm losin' you (uh-huh)
I'll buy you anything (yo), I'll buy you any ring (uh-huh)

And I'm in pieces (yo), baby, fix me (uh-huh)
And just shake me 'til you wake me from this bad dream (yo, uh-huh)
I'm goin' down (oh), down, down, down (uh-huh)
And I just can't believe, my first love won't be around, and I'm like

"Baby, baby, baby, oh"
Like, "Baby, baby, baby, no"
Like, "Baby, baby, baby, oh"
I thought you'd always be mine, mine

"Baby, baby, baby, oh"
Like, "Baby, baby, baby, no"
Like, "Baby, baby, baby, oh"
I thought you'd always be mine, mine (Luda!)`,
        },
        {
            id: 2,
            title: "Baby One More Time",
            artist: "Britney Spears",
            year: 1998,
            frequency: 36,
            lyrics: `Oh baby, baby
How was I supposed to know
That something wasn't right here?
Oh baby, baby
I shouldn't have let you go
And now you're out of sight, yeah

Show me how you want it to be
Tell me, baby, 'cause I need to know now, oh, because

My loneliness is killing me (and I)
I must confess I still believe (still believe)
When I'm not with you, I lose my mind
Give me a sign
Hit me, baby, one more time`,
        },
        {
            id: 3,
            title: "Baby Got Back",
            artist: "Sir Mix-a-Lot",
            year: 1992,
            frequency: 28,
            lyrics: `I like big butts and I cannot lie
You other brothers can't deny
That when a girl walks in with an itty-bitty waist
And a round thing in your face
You get sprung, wanna pull up tough
'Cause you notice that butt was stuffed
Deep in the jeans she's wearing
I'm hooked and I can't stop staring`,
        },
        {
            id: 4,
            title: "Baby I'm Yours",
            artist: "Arctic Monkeys",
            year: 2006,
            frequency: 2,
            lyrics: `Baby, I'm yours
And I'll be yours until the stars fall from the sky
Yours until the rivers all run dry
In other words, until I die

Baby, I'm yours
And I'll be yours until the sun no longer shines
Yours until the poets run out of rhyme
In other words, until the end of time`,
        },
    ];

    const STOP_WORDS = new Set([
        "the", "and", "it", "is", "in", "of", "on", "to", "for", "a", "an", "this",
        "that", "with", "as", "was", "were", "by", "are", "at", "from", "but", "be",
        "has", "have", "had", "he", "she", "they", "them", "his", "her", "their", "you", "i"
    ]);

    const songs = sampleSongs.map(song => song.lyrics).join(" ");

    function stem(word) {
        return word
            .replace(/[^a-z]/g, "")
            .replace(/(ing|ed|s)$/, "");
    }

    function getFrequencies(text, maxWords = 20) {
        const noBrackets = text.replace(/\[.*?\]/g, "");
        const words = noBrackets.toLowerCase().match(/\b\w+\b/g) || [];

        const freq = {};
        for (let word of words) {
            if (!STOP_WORDS.has(word)) {
                const stemmed = stem(word);
                if (stemmed.length > 1) {
                    freq[stemmed] = (freq[stemmed] || 0) + 1;
                }
            }
        }

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxWords)
            .map(([word, frequency]) => ({ word, frequency }));
    }

    useEffect(() => {
        setCloudGenerated(isCloudGenerated);
    }, [isCloudGenerated]);

    useEffect(() => {
        const wordFrequencies = getFrequencies(songs);
        setWordFrequencies(wordFrequencies);
    }, [songs]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const handleWordClick = (word) => {
        setSelectedWord(word);
        setShowSongList(true);
        console.log(`Word clicked: ${word.word} (${word.frequency})`);
    };

    const handleGenerateFavorites = () => {
        setCloudGenerated(true);
        if (onGenerateFavorites) {
            onGenerateFavorites();
        }
    };

    const handleCloseSongList = () => {
        setShowSongList(false);
    };

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
                        <ReactWordcloud
                            words={wordFrequencies.map(({ word, frequency }) => ({
                                text: word,
                                value: frequency,
                            }))}
                            callbacks={{
                                onWordClick: word => handleWordClick({ word: word.text, frequency: word.value }),
                            }}
                            options={{
                                fontSizes: [20, 60],
                                fontFamily: "Impact",
                                rotations: 2,
                                rotationAngles: [0, 90],
                                padding: 2,
                            }}
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
                isCloudGenerated={cloudGenerated}
                onTypeChange={handleTypeChange}
                onAddFavorites={onAddFavorites}
                onGenerateFavorites={handleGenerateFavorites}
                onCompareWithFriends={onCompareWithFriends}
            />

            {renderContent()}

            {showSongList && selectedWord && (
                <SongList searchTerm={selectedWord.word} songs={sampleSongs} onClose={handleCloseSongList} />
            )}
        </div>
    );
};

export default WordCloud;
