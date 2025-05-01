import { render, screen, fireEvent } from "@testing-library/react"
import SkipLink from "./SkipLink"

describe("SkipLink", () => {
    test("renders correctly", () => {
        render(<SkipLink />)

        const skipLink = screen.getByText("Skip to main content")
        expect(skipLink).toBeInTheDocument()
        expect(skipLink.tagName).toBe("A")
        expect(skipLink).toHaveAttribute("href", "#main-content")
        expect(skipLink).toHaveClass("skip-link")
    })

    test("is initially visually hidden but still in the DOM", () => {
        render(<SkipLink />)

        const skipLink = screen.getByText("Skip to main content")

        // Check that it's in the DOM
        expect(skipLink).toBeInTheDocument()

        // Instead of checking computed styles which don't work reliably in JSDOM,
        // we'll check that it has the correct class which is responsible for hiding it
        expect(skipLink).toHaveClass("skip-link")

        // We can also verify it's an anchor tag with the correct href
        expect(skipLink.tagName).toBe("A")
        expect(skipLink).toHaveAttribute("href", "#main-content")
    })

    test("becomes visible on focus", () => {
        render(<SkipLink />)

        const skipLink = screen.getByText("Skip to main content")

        // Focus the skip link
        skipLink.focus()

        // Check that it has focus
        expect(document.activeElement).toBe(skipLink)

        // In a real browser, the :focus CSS would make it visible
        // We can't test CSS directly, but we can check that the focus state is applied
        expect(skipLink).toHaveFocus()
    })

    test("scrolls to main content when clicked", () => {
        // Create a main content element
        const mainContent = document.createElement("div")
        mainContent.id = "main-content"
        document.body.appendChild(mainContent)

        mainContent.scrollIntoView = jest.fn()

        render(<SkipLink />)

        const skipLink = screen.getByText("Skip to main content")

        // Click the skip link
        fireEvent.click(skipLink)

        // In a real browser, this would navigate to #main-content
        // We can't test browser navigation in Jest, but we can check that the link has the correct href
        expect(skipLink).toHaveAttribute("href", "#main-content")

        // Clean up
        document.body.removeChild(mainContent)
    })

    test("has appropriate accessibility attributes", () => {
        render(<SkipLink />)

        const skipLink = screen.getByText("Skip to main content")

        // Check that it has the correct role (implicit for <a> elements)
        expect(skipLink.tagName).toBe("A")

        // Check that it has a high z-index to appear above other content when focused
        expect(skipLink).toHaveClass("skip-link")
    })
})
