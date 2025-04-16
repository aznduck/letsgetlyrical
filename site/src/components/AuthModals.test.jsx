import { render, screen, fireEvent } from "@testing-library/react"
import { SuccessModal, CancelModal } from "./AuthModals.jsx"

describe("SuccessModal Component", () => {
    test("renders correctly", () => {
        render(<SuccessModal />)

        expect(screen.getByText("Account Created!")).toBeInTheDocument()
        expect(screen.getByText("Your account has been created successfully.")).toBeInTheDocument()
        expect(screen.getByText("Redirecting to login...")).toBeInTheDocument()
    })
})

describe("CancelModal Component", () => {
    const defaultProps = {
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("renders correctly", () => {
        render(<CancelModal {...defaultProps} />)

        expect(screen.getByText("Are you sure?")).toBeInTheDocument()
        expect(screen.getByText("All info entered will be cleared.")).toBeInTheDocument()
        expect(screen.getByText("No, continue")).toBeInTheDocument()
        expect(screen.getByText("Yes, cancel")).toBeInTheDocument()
    })

    test('calls onCancel when "No, continue" is clicked', () => {
        render(<CancelModal {...defaultProps} />)

        fireEvent.click(screen.getByText("No, continue"))

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
        expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    test('calls onConfirm when "Yes, cancel" is clicked', () => {
        render(<CancelModal {...defaultProps} />)

        fireEvent.click(screen.getByText("Yes, cancel"))

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
        expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
})
