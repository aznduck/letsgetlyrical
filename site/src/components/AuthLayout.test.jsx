import { render, screen } from "@testing-library/react"
import { AuthLayout } from "./AuthLayout"

describe("AuthLayout Component", () => {
    test("renders children correctly", () => {
        render(
            <AuthLayout>
                <div data-testid="test-child">Test Child</div>
            </AuthLayout>,
        )

        expect(screen.getByTestId("test-child")).toBeInTheDocument()
        expect(screen.getByText("Test Child")).toBeInTheDocument()
    })

    test("renders logo and team label", () => {
        render(
            <AuthLayout>
                <div>Test Child</div>
            </AuthLayout>,
        )

        const logo = screen.getByAltText("Let's get lyrical!")
        const teamLabel = screen.getByAltText("Team 23")

        expect(logo).toBeInTheDocument()
        expect(teamLabel).toBeInTheDocument()

        expect(logo).toHaveAttribute("src", "/images/logo_xL_64.png")
        expect(teamLabel).toHaveAttribute("src", "/images/TeamLabel_L.png")
    })
})
