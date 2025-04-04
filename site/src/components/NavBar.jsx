import {useEffect, useState} from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Home, X, LogOut } from "lucide-react"

function Navbar({ onLogout, initialSearchQuery = "", initialNumSongs = "" }) {
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [numSongs, setNumSongs] = useState(initialNumSongs)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [isNumSongsFocused, setIsNumSongsFocused] = useState(false)
    const navigate = useNavigate()

    // Update state when props change
    useEffect(() => {
        setSearchQuery(initialSearchQuery);
        setNumSongs(initialNumSongs);
    }, [initialSearchQuery, initialNumSongs]);

    const handleSearchClear = () => {
        setSearchQuery("")
    }

    const handleNumSongsChange = (e) => {
        // Only allow numeric input
        const value = e.target.value.replace(/\D/g, "")
        setNumSongs(value === "" ? "" : Number.parseInt(value, 10))
    }

    const handleHomeClick = () => {
        navigate("/landing")
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}&num=${numSongs || 10}`);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/landing" className="logo-container">
                    <img
                        src="/images/logo_S_20.svg"
                        alt="Let's get lyrical!"
                        className="logo"
                    />
                </Link>
            </div>

            <div className="navbar-content">
                <div className="mobile-logo-container">
                    <Link to="/landing">
                        <img
                            src="/images/logo_S_20.svg"
                            alt="Let's get lyrical! (Mobile)"
                            className="mobile-logo"
                        />
                    </Link>
                </div>
                <div className="navbar-middle">
                    <div className="navbar-center">
                        <form onSubmit={handleSearchSubmit} className="search-container">
                            <button
                                type="button"
                                className="home-button"
                                onClick={handleHomeClick}
                                title="Go to Home"
                            >
                                <Home size={20}/>
                            </button>

                            <div className={`search-input-container ${isSearchFocused ? "focused" : ""}`}>
                                <Search size={18} className="search-icon"/>
                                <input
                                    type="text"
                                    placeholder="Enter an artist"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="clear-search"
                                        onClick={handleSearchClear}
                                        data-testid="clear-search-button"
                                    >
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>

                            <div className={`num-songs-container ${isNumSongsFocused ? "focused" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="Num Songs"
                                    value={numSongs}
                                    onChange={handleNumSongsChange}
                                    onFocus={() => setIsNumSongsFocused(true)}
                                    onBlur={() => setIsNumSongsFocused(false)}
                                    className="num-songs-input"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            </div>

                            <button type="submit" style={{ display: 'none' }}>Search</button>
                        </form>
                    </div>
                    <div className="navbar-right">
                        <button className="logout-button" onClick={onLogout}>
                            <LogOut size={20}/>
                            <span className="logout-text">Log out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar