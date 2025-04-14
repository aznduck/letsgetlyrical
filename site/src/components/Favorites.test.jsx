import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import Favorites from "./Favorites"

// Mock the Lucide React icons
jest.mock("lucide-react", () => ({
    Heart: () => <div data-testid="heart-icon" />,
    MoreHorizontal: () => <div data-testid="more-icon" />,
    AlignJustify: () => <div data-testid="menu-icon" />,
    Lock: () => <div data-testid="lock-icon" />,
    Globe: () => <div data-testid="globe-icon" />,
    SquareMinus: () => <div data-testid="minus-icon" />,
    ChevronUp: () => <div data-testid="up-icon" />,
    ChevronDown: () => <div data-testid="down-icon" />,
}))

// Mock SongDetailsPopup
jest.mock("./SongDetailsPopup", () => ({
    __esModule: true,
    default: ({ song, onClose }) => (
        <div data-testid="song-details-popup">
            <button onClick={onClose} data-testid="close-popup-button">
                Close
            </button>
            <div data-testid="popup-song-title">{song?.title}</div>
        </div>
    ),
}))

beforeAll(() => {
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            let el = this
            do {
                if (el.matches(s)) return el
                el = el.parentElement || el.parentNode
            } while (el !== null && el.nodeType === 1)
            return null
        }
    }

    // Extend the document object to handle closest calls
    if (!document.closest) {
        document.closest = () => null
    }
})

describe("Favorites Component", () => {
    // Test data with guaranteed unique IDs
    const testFavorites = [
        { id: 101, title: "Test Song 1", artist: "Test Artist 1", album: "Test Album 1" },
        { id: 102, title: "Test Song 2", artist: "Test Artist 2", album: "Test Album 2" },
        { id: 103, title: "Test Song 3", artist: "Test Artist 3", album: "Test Album 3" },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("renders favorites list correctly", () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Check if the favorites title is rendered
        expect(screen.getByText("Your Favorites")).toBeInTheDocument()

        // Check if test songs are rendered
        expect(screen.getByText("Test Song 1")).toBeInTheDocument()
        expect(screen.getByText("Test Song 2")).toBeInTheDocument()
        expect(screen.getByText("Test Song 3")).toBeInTheDocument()
    })

    test("toggles menu when menu button is clicked", () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Menu should not be visible initially
        expect(screen.queryByText("Private")).not.toBeInTheDocument()

        // Click the menu button
        fireEvent.click(screen.getByLabelText("Favorites menu"))

        // Menu should now be visible
        expect(screen.getByText("Private")).toBeInTheDocument()
        expect(screen.getByText("Public")).toBeInTheDocument()
        expect(screen.getByText("Delete")).toBeInTheDocument()

        // Click outside the menu
        fireEvent.mouseDown(document)

        // Menu should be hidden again
        expect(screen.queryByText("Private")).not.toBeInTheDocument()
    })

    test("shows delete confirmation when delete button is clicked", () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Open the menu
        fireEvent.click(screen.getByLabelText("Favorites menu"))

        // Click the delete button
        fireEvent.click(screen.getByText("Delete"))

        // Confirmation dialog should be visible
        expect(screen.getByText("Are you sure?")).toBeInTheDocument()
        expect(screen.getByText("This will delete your entire favorites list.")).toBeInTheDocument()

        // Cancel the deletion
        fireEvent.click(screen.getByText("Cancel"))

        // Confirmation dialog should be hidden
        expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument()
    })

    test("shows song details when a song is clicked", () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Click on a song title
        const songTitles = screen.getAllByTestId("list-song-title")
        fireEvent.click(songTitles[0]) // Click the first song

        // Song details popup should be visible
        expect(screen.getByTestId("song-details-popup")).toBeInTheDocument()
        expect(screen.getByTestId("popup-song-title")).toHaveTextContent("Test Song 1")

        // Close the popup
        fireEvent.click(screen.getByTestId("close-popup-button"))

        // Popup should be hidden
        expect(screen.queryByTestId("song-details-popup")).not.toBeInTheDocument()
    })

    test("shows action menu when hovering over a song", async () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Hover over a song title
        fireEvent.mouseEnter(screen.getAllByTestId("list-song-title")[0])

        // Action menu should be visible
        await waitFor(() => {
            expect(screen.getByText("Move song")).toBeInTheDocument()
            expect(screen.getByText("Remove song")).toBeInTheDocument()
        })
    })

    test("toggles between private and public mode", () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Open the popup menu
        fireEvent.click(screen.getByLabelText("Favorites menu"))

        // Check that Private and Public options are visible
        expect(screen.getByText("Private")).toBeInTheDocument()
        expect(screen.getByText("Public")).toBeInTheDocument()

        // Initially Private should be selected (default state)
        const privateButton = screen.getByText("Private").closest("button")
        expect(privateButton.className).toContain("selected")

        // Click the Public button
        const publicButton = screen.getByText("Public").closest("button")
        fireEvent.click(publicButton)


        // Now Public should be selected
        const updatedPublicButton = screen.getByText("Public").closest("button")
        expect(updatedPublicButton.className).toContain("selected")
    })


    test("confirms and deletes all favorites", () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Open the menu
        fireEvent.click(screen.getByLabelText("Favorites menu"))

        // Click the delete button
        fireEvent.click(screen.getByText("Delete"))

        // Confirm deletion
        fireEvent.click(screen.getByText("Delete", { selector: ".delete-button" }))

        // Check that the empty state is shown
        expect(screen.getByText("No favorites yet")).toBeInTheDocument()
    })

    test("handles song removal", async () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Hover over a song title to show action menu
        fireEvent.mouseEnter(screen.getAllByTestId("list-song-title")[0])

        // Click remove song button
        await waitFor(() => {
            fireEvent.click(screen.getByText("Remove song"))
        })

        // Confirmation dialog should be visible
        expect(screen.getByText("Remove Song")).toBeInTheDocument()
        expect(screen.getByText(/Are you sure you want to remove "Test Song 1"/)).toBeInTheDocument()

        // Confirm removal
        fireEvent.click(screen.getByText("Remove", { selector: ".delete-button" }))

        // Check that the song is removed
        expect(screen.queryByText("Test Song 1")).not.toBeInTheDocument()
        expect(screen.getByText("Test Song 2")).toBeInTheDocument()
        expect(screen.getByText("Test Song 3")).toBeInTheDocument()
    })

    test("cancels song removal", async () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Hover over a song title to show action menu
        fireEvent.mouseEnter(screen.getAllByTestId("list-song-title")[0])

        // Click remove song button
        await waitFor(() => {
            fireEvent.click(screen.getByText("Remove song"))
        })

        // Cancel removal
        fireEvent.click(screen.getByText("Cancel", { selector: ".cancel-button" }))

        // Check that the song is still there
        expect(screen.getByText("Test Song 1")).toBeInTheDocument()
    })

    test("moves song up in the list", async () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Hover over the second song to show action menu
        fireEvent.mouseEnter(screen.getAllByTestId("list-song-title")[1])

        // Click the up button
        await waitFor(() => {
            fireEvent.click(screen.getByTestId("up-icon").closest("button"))
        })

        // Check the new order (this is a bit tricky since we're not checking DOM order)
        // We'll rely on the fact that the component updates IDs sequentially
        const favoriteItems = screen.getAllByTestId("list-song-title")
        expect(favoriteItems[0]).toHaveTextContent("Test Song 2")
        expect(favoriteItems[1]).toHaveTextContent("Test Song 1")
    })

    test("moves song down in the list", async () => {
        render(<Favorites initialFavorites={testFavorites} />)

        // Hover over the first song to show action menu
        fireEvent.mouseEnter(screen.getAllByTestId("list-song-title")[0])

        // Click the down button
        await waitFor(() => {
            fireEvent.click(screen.getByTestId("down-icon").closest("button"))
        })

        // Check the new order
        const favoriteItems = screen.getAllByTestId("list-song-title")
        expect(favoriteItems[0]).toHaveTextContent("Test Song 2")
        expect(favoriteItems[1]).toHaveTextContent("Test Song 1")
    })
})
