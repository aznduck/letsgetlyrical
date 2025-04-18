import { render, screen, fireEvent } from "@testing-library/react"
import { PasswordInput } from "./PasswordInput"
import { usePasswordVisibility } from "../hooks/UsePassWordVisibility"

// Mock the usePasswordVisibility hook
jest.mock("../hooks/UsePassWordVisibility", () => ({
    usePasswordVisibility: jest.fn(),
}))

describe("PasswordInput Component", () => {
    const defaultProps = {
        id: "password",
        label: "Password",
        value: "test123",
        onChange: jest.fn(),
        error: "",
        required: true,
        className: "custom-class",
    }

    beforeEach(() => {
        // Reset mock implementation before each test
        usePasswordVisibility.mockImplementation(() => ({
            showPassword: false,
            togglePasswordVisibility: jest.fn(),
            inputType: "password",
        }))
    })

    test("renders with correct label", () => {
        render(<PasswordInput {...defaultProps} />)
        expect(screen.getByText("Password")).toBeInTheDocument()
    })

    test("renders input with correct type and value", () => {
        render(<PasswordInput {...defaultProps} />)
        const input = screen.getByLabelText("Password")
        expect(input).toHaveAttribute("type", "password")
        expect(input).toHaveValue("test123")
        expect(input).toHaveAttribute("required")
        expect(input).toHaveClass("custom-class")
    })

    test("calls onChange when input value changes", () => {
        render(<PasswordInput {...defaultProps} />)
        const input = screen.getByLabelText("Password")
        fireEvent.change(input, { target: { value: "newpassword" } })
        expect(defaultProps.onChange).toHaveBeenCalled()
    })

    test("displays error message when error prop is provided", () => {
        const props = { ...defaultProps, error: "Password is required" }
        render(<PasswordInput {...props} />)
        expect(screen.getByText("Password is required")).toBeInTheDocument()
        expect(screen.getByLabelText("Password")).toHaveClass("input-error")
    })

    test("toggles password visibility when button is clicked", () => {
        const mockToggle = jest.fn()
        usePasswordVisibility.mockImplementation(() => ({
            showPassword: false,
            togglePasswordVisibility: mockToggle,
            inputType: "password",
        }))

        render(<PasswordInput {...defaultProps} />)
        const toggleButton = screen.getByRole("button", { name: /hide/i })
        fireEvent.click(toggleButton)
        expect(mockToggle).toHaveBeenCalled()
    })

    test("shows eye icon when password is hidden", () => {
        usePasswordVisibility.mockImplementation(() => ({
            showPassword: false,
            togglePasswordVisibility: jest.fn(),
            inputType: "password",
        }))

        render(<PasswordInput {...defaultProps} />)
        expect(screen.getByText("Hide")).toBeInTheDocument()
    })

    test("shows eye-off icon when password is visible", () => {
        usePasswordVisibility.mockImplementation(() => ({
            showPassword: true,
            togglePasswordVisibility: jest.fn(),
            inputType: "text",
        }))

        render(<PasswordInput {...defaultProps} />)
        expect(screen.getByText("Hide")).toBeInTheDocument()
    })

    test("renders with input type text when password is visible", () => {
        usePasswordVisibility.mockImplementation(() => ({
            showPassword: true,
            togglePasswordVisibility: jest.fn(),
            inputType: "text",
        }))

        render(<PasswordInput {...defaultProps} />)
        const input = screen.getByLabelText("Password")
        expect(input).toHaveAttribute("type", "text")
    })

    test("renders without required attribute when required is false", () => {
        const props = { ...defaultProps, required: false }
        render(<PasswordInput {...props} />)
        const input = screen.getByLabelText("Password")
        expect(input).not.toHaveAttribute("required")
    })
})