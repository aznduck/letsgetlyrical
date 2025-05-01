import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import ComparePage from "./ComparePage"
import { useAuth } from "../App"
import { useNavigate } from "react-router-dom"
import { testLogoutButtonClick } from "../utils/testUtils"

// Mock the dependencies
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}))

jest.mock("../App", () => ({
    useAuth: jest.fn(),
}))

jest.mock("../components/NavBar", () => {
    return function MockNavbar({ onLogout }) {
        return (
            <div data-testid="navbar">
                <button data-testid="logout-button" onClick={onLogout}>
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

jest.mock("../components/SongDetailsPopUp", () => {
    return function MockSongDetailsPopup({ song, onClose }) {
        return song ? (
            <div data-testid="song-details-popup">
                <button data-testid="close-popup" onClick={onClose}>
                    Close
                </button>
                <div data-testid="song-title">{song.title}</div>
                <div data-testid="song-details-content" onClick={(e) => e.stopPropagation()}>
                    Content
                </div>
            </div>
        ) : null
    }
})

jest.mock("../components/Favorites", () => {
    return function MockFavorites() {
        return <div data-testid="favorites"></div>
    }
})

// Mock console.log to test logging
const originalConsoleLog = console.log
beforeAll(() => {
    console.log = jest.fn()
})

afterAll(() => {
    console.log = originalConsoleLog
})

// Mock timers for setTimeout
jest.useFakeTimers()

describe("ComparePage Component", () => {
    const mockLogout = jest.fn()
    const mockNavigate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useAuth.mockReturnValue({ logout: mockLogout })
        useNavigate.mockReturnValue(mockNavigate)
    })


    test("renders ComparePage with initial empty state", () => {
        render(<ComparePage />)

        // Check if main components are rendered
        expect(screen.getByTestId("navbar")).toBeInTheDocument()
        expect(screen.getByTestId("footer")).toBeInTheDocument()
        expect(screen.getByTestId("favorites")).toBeInTheDocument()

        expect(screen.getByText(/Enter your friends' username to compare/i)).toBeInTheDocument()

        expect(screen.getByText("No friends selected")).toBeInTheDocument()

        expect(screen.getByText("Find Lyrical Soulmate")).toBeInTheDocument()
        expect(screen.getByText("Find Lyrical Enemy")).toBeInTheDocument()

        const compareButton = screen.getByText("Click to compare")
        expect(compareButton).toBeDisabled()
    })

    test("handles logout button click", () => {
        testLogoutButtonClick(() => render(<ComparePage />), mockLogout, mockNavigate)
    })

    // Search functionality tests
    test("handles search input change", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")

        // Change search input value
        fireEvent.change(searchInput, { target: { value: "testuser" } })

        // Check if search input value was updated
        expect(searchInput.value).toBe("testuser")
    })

    test("handles search clear button", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")

        // Change search input value
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        expect(searchInput.value).toBe("testuser")

        // Clear search input
        const clearButton = screen.getByRole("button", { name: /Clear search/i })
        fireEvent.click(clearButton)

        // Check if search input value was cleared
        expect(searchInput.value).toBe("")
    })

    test("handles search submit and adds friend", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")

        // Change search input value and submit form
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        // Check if friend was added to the list
        expect(screen.getByText("testuser")).toBeInTheDocument()

        // Check if search input was cleared
        expect(searchInput.value).toBe("")
    })

    test("does not add empty or duplicate friends", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")

        // Try to submit empty search
        fireEvent.submit(searchForm)
        expect(screen.getByText("No friends selected")).toBeInTheDocument()

        // Add a friend
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)
        expect(screen.getByText("testuser")).toBeInTheDocument()

        // Try to add the same friend again
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        // Should still only have one instance of the friend
        const friendElements = screen.getAllByText("testuser")
        expect(friendElements.length).toBe(1)
    })

    test("handles search submit with whitespace", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")

        // Change search input value with whitespace and submit form
        fireEvent.change(searchInput, { target: { value: "  testuser  " } })
        fireEvent.submit(searchForm)

        // Check if friend was added to the list with trimmed whitespace
        expect(screen.getByText("testuser")).toBeInTheDocument()
    })

    test("handles whitespace-only search query submission", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")

        // Submit form with whitespace-only search
        fireEvent.change(searchInput, { target: { value: "   " } })
        fireEvent.submit(searchForm)

        // Check if "No friends selected" message is still displayed
        expect(screen.getByText("No friends selected")).toBeInTheDocument()
    })

    // Friend management tests
    test("handles remove friend", () => {
        render(<ComparePage />)

        // Add a friend
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        // Check if friend was added
        expect(screen.getByText("testuser")).toBeInTheDocument()

        // Remove the friend
        const removeButton = screen.getByRole("button", { name: "Remove testuser from selected friends" }) // The X button has no text
        fireEvent.click(removeButton)

        // Check if friend was removed
        expect(screen.queryByText("testuser")).not.toBeInTheDocument()
        expect(screen.getByText("No friends selected")).toBeInTheDocument()
    })

    test("handles multiple friends and comparison", () => {
        render(<ComparePage />)

        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")

        // Add first friend
        fireEvent.change(searchInput, { target: { value: "friend1" } })
        fireEvent.submit(searchForm)

        // Add second friend
        fireEvent.change(searchInput, { target: { value: "friend2" } })
        fireEvent.submit(searchForm)

        // Check if both friends are in the list
        expect(screen.getByText("friend1")).toBeInTheDocument()
        expect(screen.getByText("friend2")).toBeInTheDocument()

        // Click compare button
        const compareButton = screen.getByText("Click to compare")
        fireEvent.click(compareButton)

        // Check if comparison results are displayed
        expect(screen.getByText("Common Songs")).toBeInTheDocument()
    })

    // Comparison functionality tests
    test("handles compare button click", () => {
        render(<ComparePage />)

        // Add a friend
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        // Click compare button
        const compareButton = screen.getByText("Click to compare")
        fireEvent.click(compareButton)

        // Check if comparison results are displayed
        expect(screen.getByText("Common Songs")).toBeInTheDocument()
        expect(screen.getByText("Frequency")).toBeInTheDocument()

        // Check if at least one song is displayed
        expect(screen.getAllByText("Baby")[0]).toBeInTheDocument()
    })

    test("compare button is disabled when no friends are selected", () => {
        render(<ComparePage />)

        // Check if compare button is disabled
        const compareButton = screen.getByText("Click to compare")
        expect(compareButton).toBeDisabled()

        // Add a friend
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        // Check if compare button is enabled
        expect(compareButton).not.toBeDisabled()
    })

    test("handles toggle sort order", () => {
        render(<ComparePage />)

        // Add a friend and compare
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        const compareButton = screen.getByText("Click to compare")
        fireEvent.click(compareButton)

        // Check initial sort order (should be descending)
        const sortButton = screen.getByText("Frequency")

        // Toggle sort order to ascending
        fireEvent.click(sortButton)

        // Toggle sort order back to descending
        fireEvent.click(sortButton)
    })

    // Song interaction tests
    test("handles song click and shows song details popup", () => {
        render(<ComparePage />)

        // Add a friend and compare
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        const compareButton = screen.getByText("Click to compare")
        fireEvent.click(compareButton)

        // Click on a song
        const songItems = screen.getAllByText("Baby")
        fireEvent.click(songItems[0])

        // Check if song details popup is displayed
        expect(screen.getByTestId("song-details-popup")).toBeInTheDocument()

        // Close the popup
        fireEvent.click(screen.getByTestId("close-popup"))

        // Check if popup was closed
        expect(screen.queryByTestId("song-details-popup")).not.toBeInTheDocument()
    })

    test("handles song mouse enter and leave", () => {
        render(<ComparePage />)

        // Add a friend and compare
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        const compareButton = screen.getByText("Click to compare")
        fireEvent.click(compareButton)

        // Find all frequency elements
        const frequencyElements = screen.getAllByText("5")

        // Simulate mouse enter on a frequency element
        fireEvent.mouseEnter(frequencyElements[0], {
            currentTarget: {
                getBoundingClientRect: () => ({
                    right: 100,
                    top: 100,
                }),
            },
        })

        // Check if users popup is displayed
        expect(screen.getByText("Users with Song")).toBeInTheDocument()

        // Simulate mouse leave
        fireEvent.mouseLeave(frequencyElements[0])

        // Check if users popup is hidden
        expect(screen.queryByText("Users with Song")).not.toBeInTheDocument()
    })

    test("handles song mouse enter with different frequency values", () => {
        render(<ComparePage />)

        // Add a friend and compare
        const searchInput = screen.getByPlaceholderText("Enter a username")
        const searchForm = searchInput.closest("form")
        fireEvent.change(searchInput, { target: { value: "testuser" } })
        fireEvent.submit(searchForm)

        const compareButton = screen.getByText("Click to compare")
        fireEvent.click(compareButton)

        // Find frequency elements with different values
        const frequencyElements = [
            ...screen.getAllByText("5"),
            ...screen.getAllByText("4"),
            ...screen.getAllByText("3"),
            ...screen.getAllByText("2"),
            ...screen.getAllByText("1"),
        ]

        // Test each frequency value
        frequencyElements.forEach((element) => {
            // Simulate mouse enter
            fireEvent.mouseEnter(element, {
                currentTarget: {
                    getBoundingClientRect: () => ({
                        right: 100,
                        top: 100,
                    }),
                },
            })

            // Check if users popup is displayed
            expect(screen.getByText("Users with Song")).toBeInTheDocument()

            // Simulate mouse leave
            fireEvent.mouseLeave(element)

            // Check if users popup is hidden
            expect(screen.queryByText("Users with Song")).not.toBeInTheDocument()
        })
    })


    // Soulmate/Enemy popup tests
    test("handles find soulmate button click", () => {
        render(<ComparePage />)

        // Click find soulmate button
        const soulmateButton = screen.getByText("Find Lyrical Soulmate")
        fireEvent.click(soulmateButton)

        // Check if loading state is displayed
        expect(screen.getByText("Your lyrical soulmate is...")).toBeInTheDocument()

        // Check if console.log was called
        expect(console.log).toHaveBeenCalledWith("Finding lyrical soulmate")

        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Check if result is displayed
        expect(screen.getByText("maliahotan")).toBeInTheDocument()

        // Close the popup
        const closeButton = screen.getByRole("button", { name: "Close dialog" }) // The X button
        fireEvent.click(closeButton)

        // Check if popup was closed
        expect(screen.queryByText("maliahotan")).not.toBeInTheDocument()
    })

    test("handles find enemy button click", () => {
        render(<ComparePage />)

        // Click find enemy button
        const enemyButton = screen.getByText("Find Lyrical Enemy")
        fireEvent.click(enemyButton)

        // Check if loading state is displayed
        expect(screen.getByText("Your lyrical enemy is...")).toBeInTheDocument()

        // Check if console.log was called
        expect(console.log).toHaveBeenCalledWith("Finding lyrical enemy")

        // Fast-forward timers
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Check if result is displayed
        expect(screen.getByText("maliahotan")).toBeInTheDocument()

        // Close the popup
        const closeButton = screen.getByRole("button", { name: "Close dialog" }) // The X button
        fireEvent.click(closeButton)

        // Check if popup was closed
        expect(screen.queryByText("maliahotan")).not.toBeInTheDocument()
    })

    test("handles soulmate popup overlay click", () => {
        render(<ComparePage />)

        // Click find soulmate button
        const soulmateButton = screen.getByText("Find Lyrical Soulmate")
        fireEvent.click(soulmateButton)

        // Fast-forward timers to show result
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Click on the overlay (outside the popup content)
        const overlay = screen.getByText("maliahotan").closest(".lyrical-match-overlay")
        fireEvent.click(overlay)

        // Popup should still be visible (clicking overlay shouldn't close it)
        expect(screen.getByText("maliahotan")).toBeInTheDocument()

        // Click the close button to close it
        const closeButton = screen.getByRole("button", { name: "Close dialog" })
        fireEvent.click(closeButton)

        // Popup should be gone
        expect(screen.queryByText("maliahotan")).not.toBeInTheDocument()
    })

    test("handles enemy popup overlay click", () => {
        render(<ComparePage />)

        // Click find enemy button
        const enemyButton = screen.getByText("Find Lyrical Enemy")
        fireEvent.click(enemyButton)

        // Fast-forward timers to show result
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // Click on the overlay (outside the popup content)
        const overlay = screen.getByText("maliahotan").closest(".lyrical-match-overlay")
        fireEvent.click(overlay)

        // Popup should still be visible (clicking overlay shouldn't close it)
        expect(screen.getByText("maliahotan")).toBeInTheDocument()

        // Click the close button to close it
        const closeButton = screen.getByRole("button", { name: "Close dialog" })
        fireEvent.click(closeButton)

        // Popup should be gone
        expect(screen.queryByText("maliahotan")).not.toBeInTheDocument()
    })
})