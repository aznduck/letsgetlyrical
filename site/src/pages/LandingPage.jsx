import { useNavigate } from "react-router-dom"
import { useAuth } from "../App"
import Navbar from "../components/NavBar"
import Footer from "../components/Footer"
import Favorites from "../components/Favorites"
import SkipLink from "../components/SkipLink"

const LandingPage = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const handleGenerateCloud = () => {
        navigate("/favscloud", { state: { generateCloud: true } })
    }

    const handleCompareWithFriends = () => {
        navigate("/compare")
    }

    return (
        <div className="landing-page">
            {/* Place SkipLink as the very first element */}
            <SkipLink />
            <Navbar onLogout={handleLogout} />

            <main id="main-content" className="landing-content">
                <h1 className="sr-only">Welcome to Let's Get Lyrical</h1>

                <section className="main-content" aria-labelledby="actions-heading">
                    <h2 id="actions-heading" className="sr-only">
                        Quick Actions
                    </h2>
                    <div className="cloud-graphic-container">
                        <div className="action-buttons" role="group" aria-label="Main actions">
                            <button
                                className="action-button"
                                onClick={handleGenerateCloud}
                                aria-label="Generate word cloud from your favorite songs"
                            >
                                Generate favorites cloud
                            </button>
                            <button
                                className="action-button"
                                onClick={handleCompareWithFriends}
                                aria-label="Compare your music taste with friends"
                            >
                                Compare with friends!
                            </button>
                        </div>
                        <img
                            src="/images/welcome_graphic.png"
                            alt="Welcome back graphic with decorative word cloud"
                            className="cloud-graphic"
                        />
                    </div>
                </section>

                <section className="favorites-container" aria-label="Your favorites">
                    <Favorites />
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default LandingPage
