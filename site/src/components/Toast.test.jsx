import { render, screen, fireEvent, act } from "@testing-library/react"
import Toast from "./Toast.jsx"

describe("Toast Component", () => {
    const defaultProps = {
        message: "Test message",
        type: "success",
        visible: true,
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test("renders correctly when visible with success type", () => {
        render(<Toast {...defaultProps} />)

        expect(screen.getByText("Test message")).toBeInTheDocument()
        expect(screen.getByText("✓")).toBeInTheDocument()
        expect(screen.getByText("Test message").parentElement).toHaveClass("toast-success")
    })

    test("renders correctly when visible with error type", () => {
        render(<Toast {...defaultProps} type="error" />)

        expect(screen.getByText("Test message")).toBeInTheDocument()
        expect(screen.getByText("✕")).toBeInTheDocument()
        expect(screen.getByText("Test message").parentElement).toHaveClass("toast-error")
    })

    test("does not render when not visible", () => {
        render(<Toast {...defaultProps} visible={false} />)

        expect(screen.queryByText("Test message")).not.toBeInTheDocument()
    })

    test("calls onClose when clicked", () => {
        render(<Toast {...defaultProps} />)

        fireEvent.click(screen.getByText("Test message"))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    test("calls onClose after timeout", () => {
        render(<Toast {...defaultProps} />)

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    test("clears timeout when unmounted", () => {
        const { unmount } = render(<Toast {...defaultProps} />)

        // Unmount component
        unmount()

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // onClose should not be called after unmount
        expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    test("clears timeout when visibility changes", () => {
        const { rerender } = render(<Toast {...defaultProps} />)

        // Change visibility
        rerender(<Toast {...defaultProps} visible={false} />)

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(2000)
        })

        // onClose should not be called after visibility change
        expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
})
