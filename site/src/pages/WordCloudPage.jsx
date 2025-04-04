import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import Favorites from "../components/Favorites";
import WordCloud from "../components/WordCloud";

const WordCloudPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const mockFavorites = [
        { id: 1, title: "Song Title 1", artist: "Artist Name 1", album: "Album Name 1" },
        { id: 2, title: "Song Title 2", artist: "Artist Name 2", album: "Album Name 2" },
        // Add more mock favorites as needed
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleBackToLanding = () => {
        navigate("/landing");
    };

    return (
        <div className="landing-page">
            <Navbar onLogout={handleLogout} />

            <div className="landing-content">
                <div className="main-content">
                    <div className="word-cloud-section">
                        <div className="word-cloud-header">
                            <h2>Your Favorites Word Cloud</h2>
                        </div>
                        <WordCloud favorites={mockFavorites} />
                    </div>
                </div>

                <Favorites />
            </div>

            <Footer />
        </div>
    );
};

export default WordCloudPage;