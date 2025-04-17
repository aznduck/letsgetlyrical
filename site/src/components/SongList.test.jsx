import React from "react"
import {render, screen, fireEvent, waitFor, act} from "@testing-library/react"
import SongList from "./SongList"
import LyricsPopup from "./LyricsPopUp"
import Toast from "./Toast"

// Mock the child components
jest.mock("./LyricsPopUp", () => jest.fn(() => <div data-testid="lyrics-popup" />))
jest.mock("./Toast", () => {
    return jest.fn(() => <div>Mocked Toast</div>)
})

describe("SongList Component", () => {
    const mockSongs = [
        { id: 1, title: "Song 1", artist: "Artist 1", year: 2020, frequency: 5 },
        { id: 2, title: "Song 2", artist: "Artist 2", year: 2021, frequency: 3 },
    ]

    const defaultProps = {
        searchTerm: "test",
        songs: mockSongs,
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Mock console.log to prevent it from cluttering test output
        jest.spyOn(console, "log").mockImplementation(() => {})
    })

    test("renders with correct title and search term", () => {
        render(<SongList {...defaultProps} />)
        expect(screen.getByText("Songs with 'test'")).toBeInTheDocument()
    })

    test("renders the correct number of songs", () => {
        render(<SongList {...defaultProps} />)
        const rows = screen.getAllByRole("row")
        // +1 for the header row
        expect(rows.length).toBe(mockSongs.length + 1)
    })

    test("displays song details correctly", () => {
        render(<SongList {...defaultProps} />)
        expect(screen.getByText("Song 1")).toBeInTheDocument()
        expect(screen.getByText("Artist 1")).toBeInTheDocument()
        expect(screen.getByText("2020")).toBeInTheDocument()
        expect(screen.getByText("5")).toBeInTheDocument()
    })

    test("calls onClose when close button is clicked", () => {
        render(<SongList {...defaultProps} />)
        const closeButton = screen.getByRole("button", { name: "✕" })
        fireEvent.click(closeButton)
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    test("calls onClose when backdrop is clicked", () => {
        const { container } = render(<SongList {...defaultProps} />)
        const backdrop = container.querySelector(".song-list-backdrop")
        fireEvent.click(backdrop)
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    test("shows lyrics popup when lyrics button is clicked", () => {
        render(<SongList {...defaultProps} />)
        const lyricsButtons = screen.getAllByText("Lyrics")
        fireEvent.click(lyricsButtons[0])

        expect(LyricsPopup).toHaveBeenCalledWith(
            expect.objectContaining({
                song: mockSongs[0],
                visible: true,
            }),
            expect.anything(),
        )
    })

    test("shows add to favorites button on hover", () => {
        render(<SongList {...defaultProps} />)
        const songRow = screen.getByText("Song 1").closest("tr")

        // Hover over the row
        fireEvent.mouseEnter(songRow)

        expect(screen.getByText("+ Add to favorites list")).toBeInTheDocument()

        // Mouse leave
        fireEvent.mouseLeave(songRow)

        expect(screen.queryByText("+ Add to favorites list")).not.toBeInTheDocument()
    })

    test("adds song to favorites when add to favorites button is clicked", async () => {
        render(<SongList {...defaultProps} />)
        const songRow = screen.getByText("Song 1").closest("tr")

        // Hover over the row
        fireEvent.mouseEnter(songRow)

        const addButton = screen.getByText("+ Add to favorites list")

        // Use act to wrap the state update
        act(() => {
            fireEvent.click(addButton)
        })

        // Verify Toast component was called with the right props
        expect(Toast).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Song successfully added to favorites list.",
                type: "success",
                visible: true,
            }),
            expect.anything(),
        )
    })

    test("shows error toast when adding a song that is already in favorites", () => {
        render(<SongList {...defaultProps} />)
        const songRow = screen.getByText("Song 1").closest("tr")

        // Add song to favorites first time
        fireEvent.mouseEnter(songRow)
        const addButton = screen.getByText("+ Add to favorites list")

        // First click - add to favorites
        act(() => {
            fireEvent.click(addButton)
        })

        // Second click - try to add again
        act(() => {
            fireEvent.click(addButton)
        })

        // Verify Toast was last called with error message
        expect(Toast).toHaveBeenLastCalledWith(
            expect.objectContaining({
                message: "Song is already in your favorites list.",
                type: "error",
                visible: true,
            }),
            expect.anything(),
        )
    })

    test("closes lyrics popup", () => {
        render(<SongList {...defaultProps} />)

        // Open lyrics popup
        const lyricsButtons = screen.getAllByText("Lyrics")
        fireEvent.click(lyricsButtons[0])

        // Get the onClose prop from the LyricsPopup mock
        const { onClose } = LyricsPopup.mock.calls[0][0]

        // Call onClose
        act(() => {
            onClose()
        })

        // Check if LyricsPopup was called with visible: false
        expect(LyricsPopup).toHaveBeenLastCalledWith(
            expect.objectContaining({
                visible: false,
            }),
            expect.anything(),
        )
    })

    test("closes toast notification", () => {
        // Create a mock function for the closeToast callback
        const mockCloseToast = jest.fn()

        // Render the component
        render(<SongList {...defaultProps} />)

        // Reset the mock to clear any calls during rendering
        Toast.mockClear()

        // Simulate adding a song to favorites to trigger the toast
        const songRow = screen.getByText("Song 1").closest("tr")
        fireEvent.mouseEnter(songRow)

        act(() => {
            fireEvent.click(screen.getByText("+ Add to favorites list"))
        })

        // Check that Toast was called with visible: true
        expect(Toast).toHaveBeenCalled()

        // Get the most recent call to Toast
        const mostRecentCall = Toast.mock.calls[Toast.mock.calls.length - 1][0]
        expect(mostRecentCall.visible).toBe(true)
        expect(mostRecentCall.type).toBe("success")

        // Extract the onClose function from the props passed to Toast
        const { onClose } = mostRecentCall

        // Call the onClose function to simulate closing the toast
        act(() => {
            onClose()
        })

        // Check that the closeToast function in the component was called
        // This will be reflected in a subsequent render with visible: false
        const callsAfterClose = Toast.mock.calls.slice(-1)[0][0]
        expect(callsAfterClose.visible).toBe(false)
    })
})