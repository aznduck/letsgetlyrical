import React from 'react';
import { render, screen, fireEvent } from "@testing-library/react"
import SongDetailsPopUp from "./SongDetailsPopUp"

describe("SongDetailsPopUp Component", () => {
    const mockSong = {
        id: 1,
        title: "Test Song",
        artist: "Test Artist",
        featuring: "Featured Artist",
        albumCover: "test-album-cover.jpg",
    }

    const mockOnClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("renders song details correctly", () => {
        render(<SongDetailsPopUp song={mockSong} onClose={mockOnClose} />)

        // Check for song title
        expect(screen.getByTestId("pop-up-song-title")).toHaveTextContent("Test Song")

        // Check for artist name
        expect(screen.getByText("Test Artist")).toBeInTheDocument()

        // Check for featuring artists
        expect(screen.getByText("feat. Featured Artist")).toBeInTheDocument()

        // Check for album cover
        const albumCover = screen.getByAltText("Test Song album art")
        expect(albumCover).toBeInTheDocument()
        expect(albumCover.src).toContain("test-album-cover.jpg")
    })

    test("renders without featuring artists when not provided", () => {
        const songWithoutFeaturing = { ...mockSong, featuring: "" }
        render(<SongDetailsPopUp song={songWithoutFeaturing} onClose={mockOnClose} />)

        // Check that featuring text is not present
        const featuringElements = screen.queryAllByText(/feat\./)
        expect(featuringElements.length).toBe(0)
    })

    test("handles close button click", () => {
        render(<SongDetailsPopUp song={mockSong} onClose={mockOnClose} />)

        // Click close button
        const closeButton = screen.getByLabelText("Close")
        fireEvent.click(closeButton)

        // Check if onClose was called
        expect(mockOnClose).toHaveBeenCalled()
    })

    test("handles overlay click to close", () => {
        render(<SongDetailsPopUp song={mockSong} onClose={mockOnClose} />)

        // Click overlay (not the popup content)
        const overlay = screen.getByRole("dialog", { hidden: true })
        fireEvent.click(overlay)

        // Check if onClose was called
        expect(mockOnClose).toHaveBeenCalled()
    })

    test("does not close when clicking inside popup content", () => {
        const { container } = render(<SongDetailsPopUp song={mockSong} onClose={mockOnClose} />)

        // Find the song-details-content element
        const popupContent = container.querySelector(".song-details-content")
        expect(popupContent).toBeInTheDocument()

        // Instead of testing stopPropagation directly, we'll test the end result:
        // Clicking on the content should not trigger onClose
        fireEvent.click(popupContent)

        // Check that onClose was not called
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    test("handles image load error", () => {
        render(<SongDetailsPopUp song={mockSong} onClose={mockOnClose} />)

        // Simulate image load error
        const albumCover = screen.getByAltText("Test Song album art")
        fireEvent.error(albumCover)

        // Check that src was changed to placeholder
        expect(albumCover.src).toContain("/placeholder.svg")
    })

    test("returns null when no song is provided", () => {
        const { container } = render(<SongDetailsPopUp song={null} onClose={mockOnClose} />)

        // Check that nothing was rendered
        expect(container.firstChild).toBeNull()
    })
})
