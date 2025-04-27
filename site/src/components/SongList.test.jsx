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
        { id: 1, title: "Song 1", artist: "Artist 1", year: 2020 },
        { id: 2, title: "Song 2", artist: "Artist 2", year: 2021 },
        { url: "song3-url", title: "Song 3", artist: "Artist 3", year: 2022 } // Added song with url instead of id
    ]

    // Mock lyrics map
    const mockLyricsMap = new Map([
        [1, "Lyrics for Song 1"],
        [2, "Lyrics for Song 2"],
        ["song3-url", "Lyrics for Song 3"]
    ]);

    const defaultProps = {
        searchTerm: "test",
        songs: mockSongs,
        onClose: jest.fn(),
        lyricsMap: mockLyricsMap
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, "log").mockImplementation(() => {})
    })

    test("renders with correct title and search term", () => {
        render(<SongList {...defaultProps} />)
        expect(screen.getByText("Songs potentially containing 'test'")).toBeInTheDocument()
    })

    test("renders only songs with available lyrics", () => {
        // Create a map with empty string and null lyrics
        const partialLyricsMap = new Map([
            [1, "Lyrics for Song 1"],
            [2, ""], // Empty lyrics
            ["song3-url", null] // Null lyrics
        ]);

        render(<SongList {...defaultProps} lyricsMap={partialLyricsMap} />)

        const rows = screen.getAllByRole("row")
        expect(rows.length).toBe(1 + 1)

        expect(screen.getByText("Song 1")).toBeInTheDocument()
        expect(screen.queryByText("Song 2")).not.toBeInTheDocument()
        expect(screen.queryByText("Song 3")).not.toBeInTheDocument()
    })

    test("renders the correct number of songs when all have lyrics", () => {
        render(<SongList {...defaultProps} />)
        const rows = screen.getAllByRole("row")
        expect(rows.length).toBe(mockSongs.length + 1)
    })

    test("displays song details correctly", () => {
        render(<SongList {...defaultProps} />)
        expect(screen.getByText("Song 1")).toBeInTheDocument()
        expect(screen.getByText("Artist 1")).toBeInTheDocument()
        expect(screen.getByText("2020")).toBeInTheDocument()
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

    test("shows lyrics popup with correct data when lyrics button is clicked", () => {
        render(<SongList {...defaultProps} />)
        const lyricsButtons = screen.getAllByText("Lyrics")
        fireEvent.click(lyricsButtons[0])

        expect(LyricsPopup).toHaveBeenCalledWith(
            expect.objectContaining({
                song: {
                    ...mockSongs[0],
                    lyrics: "Lyrics for Song 1"
                },
                visible: true,
            }),
            expect.anything(),
        )
    })

    test("handles songs with url instead of id", () => {
        render(<SongList {...defaultProps} />)
        const lyricsButtons = screen.getAllByText("Lyrics")
        fireEvent.click(lyricsButtons[2])

        expect(LyricsPopup).toHaveBeenCalledWith(
            expect.objectContaining({
                song: {
                    ...mockSongs[2],
                    lyrics: "Lyrics for Song 3"
                },
                visible: true,
            }),
            expect.anything(),
        )
    })

    test("shows add to favorites button on hover", () => {
        render(<SongList {...defaultProps} />)
        const songRow = screen.getByText("Song 1").closest("tr")

        fireEvent.mouseEnter(songRow)

        expect(screen.getByText("+ Add to favorites")).toBeInTheDocument()

        fireEvent.mouseLeave(songRow)

        expect(screen.queryByText("+ Add to favorites")).not.toBeInTheDocument()
    })

    test("adds song to favorites when add to favorites button is clicked", async () => {
        render(<SongList {...defaultProps} />)
        const songRow = screen.getByText("Song 1").closest("tr")

        fireEvent.mouseEnter(songRow)

        const addButton = screen.getByText("+ Add to favorites")

        act(() => {
            fireEvent.click(addButton)
        })

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

        fireEvent.mouseEnter(songRow)
        const addButton = screen.getByText("+ Add to favorites")

        act(() => {
            fireEvent.click(addButton)
        })

        act(() => {
            fireEvent.click(addButton)
        })

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

        const { onClose } = LyricsPopup.mock.calls[0][0]

        // Call onClose
        act(() => {
            onClose()
        })

        expect(LyricsPopup).toHaveBeenLastCalledWith(
            expect.objectContaining({
                visible: false,
            }),
            expect.anything(),
        )
    })

    test("closes toast notification", () => {
        render(<SongList {...defaultProps} />)

        Toast.mockClear()

        const songRow = screen.getByText("Song 1").closest("tr")
        fireEvent.mouseEnter(songRow)

        act(() => {
            fireEvent.click(screen.getByText("+ Add to favorites"))
        })

        expect(Toast).toHaveBeenCalled()

        // Get the most recent call to Toast
        const mostRecentCall = Toast.mock.calls[Toast.mock.calls.length - 1][0]
        expect(mostRecentCall.visible).toBe(true)
        expect(mostRecentCall.type).toBe("success")

        const { onClose } = mostRecentCall

        act(() => {
            onClose()
        })

        // Check that the toast was closed
        const callsAfterClose = Toast.mock.calls.slice(-1)[0][0]
        expect(callsAfterClose.visible).toBe(false)
    })

    test("shows message when no songs with lyrics are found", () => {
        const emptyLyricsMap = new Map();

        render(<SongList {...defaultProps} lyricsMap={emptyLyricsMap} />)

        expect(screen.getByText("No songs found with available lyrics matching the criteria.")).toBeInTheDocument()
    })
})