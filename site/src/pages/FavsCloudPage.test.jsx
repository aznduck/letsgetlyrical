import { render, screen, fireEvent } from "@testing-library/react"
import FavsCloudPage from "./FavsCloudPage"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../App"

// Mock dependencies
jest.mock("react-router-dom")
jest.mock("../App")
jest.mock("../components/NavBar", () => {
    return function MockNavBar({ onLogout }) {
        return (
            <div data-testid="navbar">
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
jest.mock("../components/Favorites", () => {
    return function MockFavorites() {
        return <div data-testid="favorites"></div>
    }
})
jest.mock("../components/WordCloud", () => {
    return function MockWordCloud({ variant, isCloudGenerated, onGenerateFavorites, onCompareWithFriends }) {
        return (
            <div data-testid="word-cloud">
                <span>Variant: {variant}</span>
                <span>Is Generated: {isCloudGenerated ? "true" : "false"}</span>
                <button onClick={onGenerateFavorites} data-testid="generate-button">
                    Generate
                </button>
                <button onClick={onCompareWithFriends} data-testid="compare-button">
                    Compare
                </button>
            </div>
        )
    }
})

describe("FavsCloudPage Component", () => {
    const mockNavigate = jest.fn()
    const mockLogout = jest.fn()
    const consoleSpy = jest.spyOn(console, "log").mockImplementation()

    beforeEach(() => {
        jest.clearAllMocks()
        useNavigate.mockReturnValue(mockNavigate)
        useAuth.mockReturnValue({ user: { id: "1" }, logout: mockLogout })
        useLocation.mockReturnValue({ state: null })
    })

    afterAll(() => {
        consoleSpy.mockRestore()
    })

    test("renders favorites cloud page with all components", () => {
        render(<FavsCloudPage />)

        // Check for navbar
        expect(screen.getByTestId("navbar")).toBeInTheDocument()

        // Check for footer
        expect(screen.getByTestId("footer")).toBeInTheDocument()

        // Check for favorites
        expect(screen.getByTestId("favorites")).toBeInTheDocument()

        // Check for word cloud
        expect(screen.getByTestId("word-cloud")).toBeInTheDocument()
        expect(screen.getByText("Variant: favorites")).toBeInTheDocument()
        expect(screen.getByText("Is Generated: false")).toBeInTheDocument()
    })

    test("handles logout button click", () => {
        render(<FavsCloudPage />)

        // Click logout button
        fireEvent.click(screen.getByTestId("logout-button"))

        // Check that logout was called
        expect(mockLogout).toHaveBeenCalled()

        // Check that navigate was called with correct path
        expect(mockNavigate).toHaveBeenCalledWith("/login")
    })

    test("handles generate favorites button click", () => {
        render(<FavsCloudPage />)

        // Click generate button
        fireEvent.click(screen.getByTestId("generate-button"))

        // Check that console.log was called
        expect(consoleSpy).toHaveBeenCalledWith("Generating favorites cloud...")

        // Check that isCloudGenerated was updated
        const isGeneratedElement = screen.getByText("Is Generated: true")
        expect(isGeneratedElement).toBeInTheDocument()
    })

    test("handles compare with friends button click", () => {
        render(<FavsCloudPage />)

        // Click compare button
        fireEvent.click(screen.getByTestId("compare-button"))

        // Check that console.log was called
        expect(consoleSpy).toHaveBeenCalledWith("Comparing with friends...")

        // Check that navigate was called with correct path
        expect(mockNavigate).toHaveBeenCalledWith("/compare")
    })

    test("auto-generates cloud when state.generateCloud is true", () => {
        // Set location state
        useLocation.mockReturnValue({ state: { generateCloud: true } })

        render(<FavsCloudPage />)

        // Check that console.log was called
        expect(consoleSpy).toHaveBeenCalledWith("Auto-generating favorites cloud...")

        // Check that isCloudGenerated was set to true
        const isGeneratedElement = screen.getByText("Is Generated: true")
        expect(isGeneratedElement).toBeInTheDocument()
    })
})
