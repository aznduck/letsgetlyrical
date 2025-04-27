import { render, screen, fireEvent } from "@testing-library/react"
import LyricsPopUp from "./LyricsPopUp.jsx"

describe("LyricsPopUp Component", () => {
    const mockSong = {
        id: "1",
        title: "Test Song",
        artist: "Test Artist",
        lyrics: "Line 1\nLine 2\nLine 3",
    }

    const defaultProps = {
        song: mockSong,
        visible: true,
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("renders correctly when visible with song data", () => {
        render(<LyricsPopUp {...defaultProps} />)

        expect(screen.getByText("Test Song")).toBeInTheDocument()
        expect(screen.getByText("Test Artist")).toBeInTheDocument()
        expect(screen.getByText("Line 1")).toBeInTheDocument()
        expect(screen.getByText("Line 2")).toBeInTheDocument()
        expect(screen.getByText("Line 3")).toBeInTheDocument()
    })

    test("does not render when not visible", () => {
        render(<LyricsPopUp {...defaultProps} visible={false} />)

        expect(screen.queryByText("Test Song")).not.toBeInTheDocument()
    })

    test("does not render when no song is provided", () => {
        render(<LyricsPopUp {...defaultProps} song={null} />)

        expect(screen.queryByText("Test Song")).not.toBeInTheDocument()
    })

    test("calls onClose when backdrop is clicked", () => {
        const { container } = render(<LyricsPopUp {...defaultProps} />)

        // Using querySelector instead of getByClassName
        const backdrop = container.querySelector(".lyrics-popup-backdrop")
        fireEvent.click(backdrop)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    test("calls onClose when close button is clicked", () => {
        const { container } = render(<LyricsPopUp {...defaultProps} />)

        // Using querySelector instead of getByClassName
        const closeButton = container.querySelector(".lyrics-popup-close-button")
        fireEvent.click(closeButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
})