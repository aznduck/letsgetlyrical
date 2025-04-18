import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import SearchPage from "./SearchPage"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../App"
import GeniusService from "../services/GeniusService"

import { testLogoutButtonClick } from "../utils/testUtils"

// Mock dependencies
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
}))

jest.mock("../App", () => ({
    useAuth: jest.fn(),
}))

jest.mock("../services/GeniusService", () => ({
    searchArtist: jest.fn(),
    getTopSongs: jest.fn(),
}))

// Mock child components
jest.mock("../components/NavBar", () => {
    return function MockNavBar({ onLogout, initialSearchQuery, initialNumSongs }) {
        return (
            <div data-testid="navbar">
                <span data-testid="search-query">{initialSearchQuery}</span>
                <span data-testid="num-songs">{initialNumSongs}</span>
                <button onClick={onLogout} data-testid="logout-button">
                    Logout
                </button>
            </div>
        )
    }
})

jest.mock("../components/Footer", () => {
    return function MockFooter() {
        return <div data-testid="footer"></div>
    }
})

jest.mock("../components/WordCloud", () => {
    return function MockWordCloud({ favorites, onAddFavorites }) {
        return (
            <div data-testid="word-cloud">
                <span data-testid="favorites-count">Favorites Count: {favorites.length}</span>
                <button onClick={onAddFavorites} data-testid="add-favorites-button">
                    Add Favorites
                </button>
            </div>
        )
    }
})

jest.mock("../components/SongDetailsPopUp", () => {
    return function MockSongDetailsPopUp({ song, onClose }) {
        return song ? (
            <div data-testid="song-details-popup">
                <span data-testid="popup-song-title">{song.title}</span>
                <button onClick={onClose} data-testid="close-popup-button">
                    Close
                </button>
            </div>
        ) : null
    }
})

describe("SearchPage Component", () => {
    const mockNavigate = jest.fn()
    const mockLogout = jest.fn()
    const mockUser = { id: "1", name: "Test User" }

    // Spy on console methods
    const consoleSpy = jest.spyOn(console, "log").mockImplementation()
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()

    // Mock data
    const mockArtists = [
        { artist_id: "1", artist_name: "Test Artist 1" },
        { artist_id: "2", artist_name: "Test Artist 2" },
    ]

    const mockSongs = [
        {
            id: 1,
            title: "Test Song 1",
            primary_artist: { name: "Test Artist 1" },
            featured_artists: [{ name: "Featured Artist" }],
            song_art_image_thumbnail_url: "test-image-url-1.jpg",
        },
        {
            id: 2,
            title: "Test Song 2",
            primary_artist: { name: "Test Artist 1" },
            featured_artists: [],
            song_art_image_thumbnail_url: "test-image-url-2.jpg",
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations
        useNavigate.mockReturnValue(mockNavigate)
        useAuth.mockReturnValue({ user: mockUser, logout: mockLogout })
        useLocation.mockReturnValue({ search: "" })

        GeniusService.searchArtist.mockResolvedValue(mockArtists)
        GeniusService.getTopSongs.mockResolvedValue(mockSongs)
    })

    afterAll(() => {
        consoleSpy.mockRestore()
        consoleErrorSpy.mockRestore()
    })

    test("renders initial state correctly", () => {
        const { container } = render(<SearchPage />)

        // Check for navbar and footer
        expect(screen.getByTestId("navbar")).toBeInTheDocument()
        expect(screen.getByTestId("footer")).toBeInTheDocument()

        // Check for initial prompt
        expect(screen.getByText("Enter an artist name in the search bar above to begin.")).toBeInTheDocument()

        // No error message should be displayed
        expect(container.querySelector(".search-error-message")).not.toBeInTheDocument()
    })

    //
    // test("handles logout button click", () => {
    //     render(<SearchPage />)
    //
    //     // Click logout button
    //     fireEvent.click(screen.getByTestId("logout-button"))
    //
    //     // Check that logout was called
    //     expect(mockLogout).toHaveBeenCalled()
    //
    //     // Check that navigate was called with correct path
    //     expect(mockNavigate).toHaveBeenCalledWith("/login")
    // })
    //
    // test("parses URL parameters correctly", () => {
    //     // Test with valid parameters
    //     useLocation.mockReturnValue({ search: "?q=artist&num=15" })
    //     const { unmount } = render(<SearchPage />)
    //     expect(screen.getAllByTestId("search-query")[0].textContent).toBe("artist")
    //     expect(screen.getAllByTestId("num-songs")[0].textContent).toBe("15")
    //
    //     // Clean up the first render
    //     unmount()
    //
    //     // Test with invalid num parameter
    //     useLocation.mockReturnValue({ search: "?q=artist&num=invalid" })
    //     const { container } = render(<SearchPage />)
    //     expect(screen.getAllByTestId("search-query")[0].textContent).toBe("artist")
    //     expect(screen.getAllByTestId("num-songs")[0].textContent).toBe("10") // Should default to 10
    // })
    //
    // test("fetches artists when search query is provided", async () => {
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Check that searchArtist was called with correct query
    //     expect(GeniusService.searchArtist).toHaveBeenCalledWith("test")
    //
    //     // Wait for artist popup to appear
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //
    //     // Check that artist options are displayed
    //     expect(screen.getByText("Test Artist 1")).toBeInTheDocument()
    //     expect(screen.getByText("Test Artist 2")).toBeInTheDocument()
    // })
    //
    // test("selects artist and fetches songs", async () => {
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Wait for artist popup to appear
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //
    //     // Select an artist
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Check that getTopSongs was called with correct artist ID and num
    //     expect(GeniusService.getTopSongs).toHaveBeenCalledWith("1", 10)
    //
    //     // Wait for songs to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Top 2 Songs")).toBeInTheDocument()
    //     })
    //
    //     // Check that songs are displayed
    //     expect(screen.getByText("Test Song 1")).toBeInTheDocument()
    //     expect(screen.getByText("Test Song 2")).toBeInTheDocument()
    //
    //     // Check that word cloud is displayed
    //     expect(screen.getByTestId("word-cloud")).toBeInTheDocument()
    //     expect(screen.getByTestId("favorites-count")).toHaveTextContent("Favorites Count: 2")
    // })
    //
    // test("handles song click to show details popup", async () => {
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Wait for artist popup and select artist
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Wait for songs to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Test Song 1")).toBeInTheDocument()
    //     })
    //
    //     // Click on a song
    //     fireEvent.click(screen.getByText("Test Song 1"))
    //
    //     // Check that popup is displayed
    //     expect(screen.getByTestId("song-details-popup")).toBeInTheDocument()
    //     expect(screen.getByTestId("popup-song-title")).toHaveTextContent("Test Song 1")
    //
    //     // Close popup
    //     fireEvent.click(screen.getByTestId("close-popup-button"))
    //
    //     // Check that popup is closed
    //     expect(screen.queryByTestId("song-details-popup")).not.toBeInTheDocument()
    // })
    //
    // test("handles add favorites button click", async () => {
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Wait for artist popup and select artist
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Wait for songs to load
    //     await waitFor(() => {
    //         expect(screen.getByTestId("word-cloud")).toBeInTheDocument()
    //     })
    //
    //     // Click add favorites button
    //     fireEvent.click(screen.getByTestId("add-favorites-button"))
    //
    //     // Check that console.log was called
    //     expect(consoleSpy).toHaveBeenCalledWith("Added favorites list to word cloud.", expect.any(Array))
    // })
    //
    // test("handles empty artist search results", async () => {
    //     GeniusService.searchArtist.mockResolvedValue([])
    //
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=empty&num=10" })
    //
    //     const { container } = render(<SearchPage />)
    //
    //     // Check that searchArtist was called
    //     expect(GeniusService.searchArtist).toHaveBeenCalledWith("empty")
    //
    //     // Wait for error message
    //     await waitFor(() => {
    //         const errorElement = container.querySelector(".search-error-message")
    //         expect(errorElement).toBeInTheDocument()
    //         expect(errorElement.textContent).toContain('No artists found matching "empty"')
    //     })
    // })
    //
    // test("handles artist search API error", async () => {
    //     GeniusService.searchArtist.mockRejectedValue(new Error("API Error"))
    //
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=error&num=10" })
    //
    //     const { container } = render(<SearchPage />)
    //
    //     // Check that searchArtist was called
    //     expect(GeniusService.searchArtist).toHaveBeenCalledWith("error")
    //
    //     // Wait for error message
    //     await waitFor(() => {
    //         const errorElement = container.querySelector(".search-error-message")
    //         expect(errorElement).toBeInTheDocument()
    //         expect(errorElement.textContent).toContain("Error:")
    //     })
    //
    //     // Check that console.error was called
    //     expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch artists:", expect.any(Error))
    // })
    //
    // test("handles empty songs search results", async () => {
    //     // Mock empty songs results
    //     GeniusService.getTopSongs.mockResolvedValue([])
    //
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     const { container } = render(<SearchPage />)
    //
    //     // Wait for artist popup and select artist
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Check that getTopSongs was called
    //     expect(GeniusService.getTopSongs).toHaveBeenCalledWith("1", 10)
    //
    //     // Wait for error message
    //     await waitFor(() => {
    //         const errorElement = container.querySelector(".search-error-message")
    //         expect(errorElement).toBeInTheDocument()
    //         expect(errorElement.textContent).toContain("No songs found for Test Artist 1")
    //     })
    // })
    //
    // test("handles songs search API error", async () => {
    //     // Mock API error for songs
    //     GeniusService.getTopSongs.mockRejectedValue(new Error("Songs API Error"))
    //
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     const { container } = render(<SearchPage />)
    //
    //     // Wait for artist popup and select artist
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Check that getTopSongs was called
    //     expect(GeniusService.getTopSongs).toHaveBeenCalledWith("1", 10)
    //
    //     // Wait for error message
    //     await waitFor(() => {
    //         const errorElement = container.querySelector(".search-error-message")
    //         expect(errorElement).toBeInTheDocument()
    //         expect(errorElement.textContent).toContain("Songs API Error")
    //     })
    //
    //     // Check that console.error was called
    //     expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch songs:", expect.any(Error))
    // })
    //
    // test("handles image load errors", async () => {
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Wait for artist popup and select artist
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Wait for songs to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Test Song 1")).toBeInTheDocument()
    //     })
    //
    //     // Find song images
    //     const songImages = screen.getAllByAltText(/cover$/)
    //     expect(songImages.length).toBeGreaterThan(0)
    //
    //     // Simulate image load error
    //     fireEvent.error(songImages[0])
    //
    //     // Check that src was changed to default
    //     expect(songImages[0].src).toContain("/images/placeholder.svg")
    // })
    //
    // test("handles invalid artist selection", async () => {
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     // Mock getTopSongs to throw an error when called with invalid ID
    //     GeniusService.getTopSongs.mockImplementation((artistId) => {
    //         if (artistId === "invalid") {
    //             throw new Error("Invalid artist ID")
    //         }
    //         return Promise.resolve(mockSongs)
    //     })
    //
    //     // Create a spy specifically for this test
    //     const errorSpy = jest.spyOn(console, "error").mockImplementation()
    //
    //     render(<SearchPage />)
    //
    //     // Wait for artist popup
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //
    //     // Force an error by directly calling getTopSongs with an invalid ID
    //     try {
    //         await GeniusService.getTopSongs("invalid", 10)
    //     } catch (error) {
    //         // This should trigger the error handling in the component
    //         console.error("Error selecting artist:", error)
    //     }
    //
    //     // Verify the error was logged
    //     expect(errorSpy).toHaveBeenCalled()
    //
    //     // Clean up
    //     errorSpy.mockRestore()
    // })
    //
    // test("shows loading indicator when fetching data", async () => {
    //     // Make the API call take longer
    //     let resolveArtists
    //     GeniusService.searchArtist.mockImplementation(
    //         () =>
    //             new Promise((resolve) => {
    //                 resolveArtists = () => resolve(mockArtists)
    //             }),
    //     )
    //
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Check that loading indicator is shown
    //     const loadingElements = screen.getAllByText("Loading...")
    //     expect(loadingElements.length).toBeGreaterThan(0)
    //
    //     // Resolve the promise
    //     resolveArtists()
    //
    //     // Wait for loading to finish
    //     await waitFor(() => {
    //         expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    //     })
    // })
    //
    // test("handles songs with missing data", async () => {
    //     // Mock songs with missing data
    //     const incompleteDataSongs = [
    //         {
    //             // Missing id
    //             title: undefined, // Missing title
    //             primary_artist: undefined, // Missing artist
    //             featured_artists: undefined, // Missing featured artists
    //             // Missing album cover
    //         },
    //     ]
    //
    //     GeniusService.getTopSongs.mockResolvedValue(incompleteDataSongs)
    //
    //     // Set location search
    //     useLocation.mockReturnValue({ search: "?q=test&num=10" })
    //
    //     render(<SearchPage />)
    //
    //     // Wait for artist popup and select artist
    //     await waitFor(() => {
    //         expect(screen.getByText("Please pick an artist:")).toBeInTheDocument()
    //     })
    //     fireEvent.click(screen.getByText("Test Artist 1"))
    //
    //     // Wait for songs to load
    //     await waitFor(() => {
    //         expect(screen.getByText("Top 1 Songs")).toBeInTheDocument()
    //     })
    //
    //     // Check that default values are used
    //     expect(screen.getByText("Unknown Title")).toBeInTheDocument()
    //     expect(screen.getByText("Test Artist 1")).toBeInTheDocument()
    //
    //     // Check that image has default src
    //     const songImages = screen.getAllByAltText(/cover$/)
    //     expect(songImages[0].src).toContain("/images/placeholder.svg")
    // })
    //
    // test("handles no search query", () => {
    //     // Set empty location search
    //     useLocation.mockReturnValue({ search: "" })
    //
    //     render(<SearchPage />)
    //
    //     // Check that initial prompt is shown
    //     expect(screen.getByText("Enter an artist name in the search bar above to begin.")).toBeInTheDocument()
    //
    //     // Check that API was not called
    //     expect(GeniusService.searchArtist).not.toHaveBeenCalled()
    // })

})
