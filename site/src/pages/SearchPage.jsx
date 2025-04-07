import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import WordCloud from "../components/WordCloud";
import GeniusService from '../services/GeniusService';

const DEFAULT_ALBUM_COVER = "/images/placeholder.svg";

const SearchPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [numSongs, setNumSongs] = useState(10);

    const [potentialArtists, setPotentialArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const numParam = params.get('num');
        const num = Number.parseInt(numParam, 10) > 0 ? Number.parseInt(numParam, 10) : 10;

        setSearchQuery(query);
        setNumSongs(num);

        setPotentialArtists([]);
        setSelectedArtist(null);
        setSongs([]);
        setError(null);

        if (query) {
            const fetchArtists = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const artists = await GeniusService.searchArtist(query);
                    if (artists && artists.length > 0) {
                        setPotentialArtists(artists);
                    } else {
                        setError(`No artists found matching "${query}". Please try a different search term.`);
                        setPotentialArtists([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch artists:", err);
                    setError(err.message || "Failed to search for artists. Check connection or API status.");
                    setPotentialArtists([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchArtists();
        } else {
            setError(null);
            setPotentialArtists([]);
            setSelectedArtist(null);
            setSongs([]);
        }
    }, [location.search]);

    useEffect(() => {
        if (selectedArtist && selectedArtist.artist_id) {
            const fetchSongsForArtist = async () => {
                setIsLoading(true);
                setError(null);
                setSongs([]);
                try {
                    const fetchedSongs = await GeniusService.getTopSongs(selectedArtist.artist_id, numSongs);

                    if (fetchedSongs && fetchedSongs.length > 0) {
                        const formattedSongs = fetchedSongs.map((song, index) => ({
                            id: song.id || index + 1,
                            title: song.title || 'Unknown Title',
                            artist: song.primary_artist?.name || selectedArtist.artist_name || 'Unknown Artist',
                            featuring: song.featured_artists?.map(a => a.name).join(', ') || '',
                            albumCover: song.song_art_image_thumbnail_url || song.header_image_thumbnail_url || DEFAULT_ALBUM_COVER
                        }));
                        setSongs(formattedSongs);
                    } else {
                        setError(`No songs found for ${selectedArtist.artist_name}. They might not have songs listed on Genius.`);
                        setSongs([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch songs:", err);
                    setError(err.message || `Failed to fetch songs for ${selectedArtist.artist_name}.`);
                    setSongs([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSongsForArtist();
        }
    }, [selectedArtist]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleArtistSelect = useCallback((artist) => {
        if (artist && artist.artist_id) {
            setSelectedArtist(artist);
            setPotentialArtists([]);
            setError(null);
        } else {
            console.error("Invalid artist object passed to handleArtistSelect:", artist);
            setError("An error occurred selecting the artist.");
        }
    }, []);

    const handleAddToFavorites = () => {
        console.log("Add to favorites clicked. Songs:", songs);
    };

    return (
        <div className="landing-page">
            <Navbar
                onLogout={handleLogout}
                initialSearchQuery={searchQuery}
                initialNumSongs={numSongs}
            />

            <div className="search-page-content">
                {isLoading && <div className="loading-indicator">Loading...</div>}

                {error && !isLoading && <div className="error-message">Error: {error}</div>}

                {!isLoading && !error && potentialArtists.length > 0 && !selectedArtist && (
                    <div className="artist-selection-container">
                        <h2>Select an Artist:</h2>
                        <ul className="artist-list">
                            {potentialArtists.map((artist) => (
                                <li key={artist.artist_id} className="artist-list-item">
                                    <button onClick={() => handleArtistSelect(artist)}>
                                        {artist.artist_name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* --- Song Results State --- */}
                {!isLoading && !error && selectedArtist && (
                    <div className="search-results-container">
                        {/* == Song List Section == */}
                        <div className="search-results-list">
                            <h2 className="search-results-title">
                                {songs.length > 0
                                    ? `Top ${songs.length} Songs for ${selectedArtist.artist_name}`
                                    : `No songs found for ${selectedArtist.artist_name}`
                                }
                            </h2>

                            {songs.length > 0 && (
                                <div className="song-list">
                                    {songs.map((song, index) => (
                                        <div key={song.id} className="song-item">
                                            <div className="song-number">{index + 1}</div>
                                            <div className="song-cover">
                                                <img
                                                    src={song.albumCover || DEFAULT_ALBUM_COVER}
                                                    alt={`${song.title} cover`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src=DEFAULT_ALBUM_COVER; }}
                                                />
                                            </div>
                                            <div className="song-info">
                                                <div className="song-title">{song.title}</div>
                                                <div className="song-artist">
                                                    {selectedArtist.artist_name}{song.featuring ? `, feat. ${song.featuring}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {songs.length > 0 && (
                            <div className="word-cloud-section">
                                <div className="word-cloud-header">
                                    <h2>Word Cloud for {selectedArtist.artist_name}</h2>
                                    <button
                                        className="action-button add-favorites-button"
                                        onClick={handleAddToFavorites}
                                        disabled={songs.length === 0}
                                    >
                                        Add this list to favorites
                                    </button>
                                </div>
                                <WordCloud favorites={songs} />
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && !error && !searchQuery && potentialArtists.length === 0 && !selectedArtist && (
                    <div className="initial-prompt">
                        <p>Enter an artist name in the search bar above to begin.</p>
                    </div>
                )}

            </div> {/* End search-page-content */}

            <Footer />
        </div>
    );
};

export default SearchPage;