import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../App"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import Favorites from "../components/Favorites"
import WordCloudContent from "../components/WordCloudContent"
import SkipLink from "../components/SkipLink"
import "../styles/LandingPage.css"

const FavsCloudPage = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const shouldGenerateCloud = location.state?.generateCloud || false

    const [isCloudGenerated, setIsCloudGenerated] = useState(shouldGenerateCloud)
    const [statusMessage, setStatusMessage] = useState("")

    useEffect(() => {
        if (shouldGenerateCloud) {
            console.log("Auto-generating favorites cloud...")
            setIsCloudGenerated(true)
            setStatusMessage("Favorites word cloud has been automatically generated")
        }
    }, [shouldGenerateCloud])

    const handleGenerateFavorites = () => {
        console.log("Generating favorites cloud...")
        setIsCloudGenerated(true)
        setStatusMessage("Favorites word cloud has been generated")
    }

    const handleCompareWithFriends = () => {
        console.log("Comparing with friends...")
        navigate("/compare")
    }

    return (
        <div className="landing-page">
            {/* Place SkipLink as the very first element */}
            <SkipLink />
            <Navbar onLogout={handleLogout} />

            {/* Screen reader announcements */}
            <div className="sr-only" aria-live="polite">
                {statusMessage}
            </div>

            <main id="main-content" className="landing-content">
                <h1 className="sr-only">Your Favorites Word Cloud</h1>

                <section className="main-content" aria-label="Word cloud visualization">
                    <WordCloudContent
                        variant="favorites"
                        isCloudGenerated={isCloudGenerated}
                        onGenerateFavorites={handleGenerateFavorites}
                        onCompareWithFriends={handleCompareWithFriends}
                    />
                </section>

                <section className="favorites-container" aria-label="Your favorites">
                    <Favorites />
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default FavsCloudPage