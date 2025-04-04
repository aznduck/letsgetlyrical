import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import WordCloud from "../components/WordCloud";

const SearchPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [numSongs, setNumSongs] = useState(10);

    // Parse search parameters from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const num = params.get('num') || 10;

        setSearchQuery(query);
        setNumSongs(Number(num));
    }, [location.search]);

    // Generate mock search results based on the query
    const searchResults = Array.from({ length: numSongs }, (_, i) => ({
        id: i + 1,
        title: 'Baby',
        artist: 'Justin Bieber',
        featuring: 'Ludacris',
        albumCover: "/images/Rectangle-19/png"
    }));

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleAddToFavorites = () => {
        // Future implementation
        console.log("Add to favorites clicked");
    };

    return (
        <div className="landing-page">
            <Navbar
                onLogout={handleLogout}
                initialSearchQuery={searchQuery}
                initialNumSongs={numSongs}
            />

            <div className="search-page-content">
                <div className="search-results-container">
                    <div className="search-results-list">
                        <h2 className="search-results-title">Top {numSongs} Songs</h2>

                        <div className="song-list">
                            {searchResults.map((song) => (
                                <div key={song.id} className="song-item">
                                    <div className="song-number">{song.id}</div>
                                    <div className="song-cover">
                                        <img src={song.albumCover || "/placeholder.svg"} alt={`${song.title} cover`} />
                                    </div>
                                    <div className="song-info">
                                        <div className="song-title">{song.title}</div>
                                        <div className="song-artist">
                                            {song.artist}{song.featuring ? `, ${song.featuring}` : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="word-cloud-section">
                        <div className="word-cloud-header">
                            <h2>Your Word Cloud</h2>
                            <button
                                className="action-button add-favorites-button"
                                onClick={handleAddToFavorites}
                            >
                                Add your favorites list
                            </button>
                        </div>
                        <WordCloud favorites={searchResults} />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SearchPage;