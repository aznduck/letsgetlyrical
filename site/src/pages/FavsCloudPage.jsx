import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import { useAuth } from "../App";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import Favorites from "../components/Favorites";
import WordCloud from "../components/WordCloud";
import "../styles/LandingPage.css"


const FavsCloudPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation()

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const shouldGenerateCloud = location.state?.generateCloud || false

    const [isCloudGenerated, setIsCloudGenerated] = useState(shouldGenerateCloud)

    useEffect(() => {
        if (shouldGenerateCloud) {
            console.log("Auto-generating favorites cloud...")
            setIsCloudGenerated(true)
        }
    }, [shouldGenerateCloud])

    const handleGenerateFavorites = () => {
        console.log("Generating favorites cloud...")
        setIsCloudGenerated(true)
    }

    const handleCompareWithFriends = () => {
        console.log("Comparing with friends...")
        navigate("/compare")
    }

    return (
        <div className="landing-page">
            <Navbar onLogout={handleLogout} />

            <div className="landing-content">
                <div className="main-content">
                        <WordCloud variant="favorites"
                                   isCloudGenerated={isCloudGenerated}
                                   onGenerateFavorites={handleGenerateFavorites}
                                   onCompareWithFriends={handleCompareWithFriends} />
                </div>

                <Favorites />
            </div>

            <Footer />
        </div>
    );
};

export default FavsCloudPage;