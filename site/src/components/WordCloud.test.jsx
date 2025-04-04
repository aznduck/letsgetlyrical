import { render, screen } from "@testing-library/react"
import WordCloud from "./WordCloud"

describe("WordCloud Component", () => {
    const mockFavorites = [
        { id: 1, title: "Song 1", artist: "Artist 1" },
        { id: 2, title: "Song 2", artist: "Artist 2" },
    ]

    test("renders without crashing", () => {
        render(<WordCloud favorites={mockFavorites} />)
        // Check if the container is rendered
        expect(document.querySelector(".word-cloud-container")).toBeInTheDocument()
    })

    test("renders the word CLOUD", () => {
        render(<WordCloud favorites={mockFavorites} />)
        // Check if the word CLOUD is rendered
        expect(screen.getByText("CLOUD")).toBeInTheDocument()
    })

    test("renders with empty favorites array", () => {
        render(<WordCloud favorites={[]} />)
        // Should still render the word CLOUD
        expect(screen.getByText("CLOUD")).toBeInTheDocument()
    })
})