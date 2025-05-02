import React, {useEffect, useRef, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, X, LogOut } from "lucide-react";

// Added initialSortOption prop
function Navbar({ onLogout, initialSearchQuery = "", initialNumSongs = "", initialSortOption = "popularity" }) {
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [numSongs, setNumSongs] = useState(initialNumSongs === "" ? "" : String(initialNumSongs));
    // State for the sort dropdown
    const [sortOption, setSortOption] = useState(initialSortOption);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isNumSongsFocused, setIsNumSongsFocused] = useState(false);
    const navigate = useNavigate();

    const searchInputRef = useRef(null)

    useEffect(() => {
        setSearchQuery(initialSearchQuery);
        setNumSongs(initialNumSongs === "" ? "" : String(initialNumSongs));
        // Update sort option when initial prop changes
        setSortOption(initialSortOption);
    }, [initialSearchQuery, initialNumSongs, initialSortOption]); // Added initialSortOption dependency

    const handleSearchClear = () => {
        setSearchQuery("");

        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    };

    const handleNumSongsChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Allow only digits
        setNumSongs(value);
    };

    // Handler for sort dropdown change
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleHomeClick = () => {
        navigate("/landing");
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const num = Number.parseInt(numSongs, 10) > 0 ? numSongs : '10';
            const targetUrl = `/search?q=${encodeURIComponent(searchQuery)}&num=${num}&sort=${encodeURIComponent(sortOption)}`;
            navigate(targetUrl);
        } else {
            console.log("Search query is empty");
        }
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="navbar-left">
                <Link to="/landing" className="logo-container" aria-label="Home page">
                    <img
                        src="/images/logo_S_20.svg"
                        alt="Let's get lyrical!"
                        className="logo"
                    />
                </Link>
            </div>

            <div className="navbar-content">
                <div className="mobile-logo-container">
                    <Link to="/landing" aria-label="Home page (mobile)">
                        <img
                            src="/images/logo_S_20.svg"
                            alt="Let's get lyrical! (Mobile)"
                            className="mobile-logo"
                        />
                    </Link>
                </div>
                <div className="navbar-middle">
                    <div className="navbar-center">
                        <form onSubmit={handleSearchSubmit} className="search-container" role="search">
                            <button
                                type="button"
                                className="nav-button"
                                onClick={handleHomeClick}
                                title="Go to Home"
                                aria-label="Go to home page"
                            >
                                <Home size={20} aria-hidden="true"/>
                            </button>

                            <div className={`search-input-container ${isSearchFocused ? "focused" : ""}`}>
                                <Search size={18} className="search-icon" aria-hidden="true"/>
                                <input
                                    type="text"
                                    placeholder="Enter an artist"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="search-input"
                                    aria-label="Search by artist"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="clear-search"
                                        onClick={handleSearchClear}
                                        data-testid="clear-search-button"
                                        aria-label="Clear search"
                                    >
                                        <X size={16} aria-hidden="true"/>
                                    </button>
                                )}
                            </div>

                            <div className={`num-songs-container ${isNumSongsFocused ? "focused" : ""}`}>
                                <label htmlFor="num-songs" className="sr-only">
                                    Number of songs
                                </label>
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
                                    aria-label="Number of songs"
                                />
                            </div>

                            {/* Updated Sort Selector */}
                            <div className={`sort-selector`}>
                                <select
                                    value={sortOption} // Controlled component
                                    onChange={handleSortChange} // Update state on change
                                    aria-label="Sort order"
                                >
                                    <option value={"popularity"}>Popularity</option> {/* Changed text for clarity */}
                                    <option value={"title"}>Title</option>
                                </select>
                            </div>

                            <button type="submit" className="nav-button" aria-label="Submit search">
                            <Search size={20} aria-hidden="true"/>
                            </button>
                        </form>
                    </div>
                    <div className="navbar-right">
                        <button className="logout-button" onClick={onLogout} aria-label="Log out of your account">
                            <LogOut size={20} aria-hidden="true"/>
                            <span className="logout-text">Log out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;