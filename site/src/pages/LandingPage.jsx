import React from 'react';
import { useNavigate } from "react-router-dom"
import { useAuth } from "../App"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import Favorites from "../components/Favorites"

const LandingPage = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const handleGenerateCloud = () => {
        navigate("/wordcloud");
    };

    return (
        <div className="landing-page">
            <Navbar onLogout={handleLogout} />

            <div className="landing-content">
                <div className="main-content">

                    <div className="cloud-graphic-container">
                        <div className="action-buttons">
                            <button className="action-button" onClick={handleGenerateCloud}>
                                Generate favorites cloud</button>
                            <button className="action-button">Compare with friends!</button>
                        </div>
                        <img
                            src="/images/welcome_graphic.png"
                            alt="Cloud with Welcome back text"
                            className="cloud-graphic"
                        />
                    </div>
                </div>

                <Favorites/>
            </div>

            <Footer/>
        </div>
    )
}

export default LandingPage