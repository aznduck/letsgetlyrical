import React from "react";
import {render, screen, fireEvent, act, waitFor} from "@testing-library/react";
import SignUpPage from "./SignUpPage";
import {MemoryRouter} from "react-router-dom";
import {useNavigate} from "react-router-dom";

global.fetch = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

// Fix: mock ALL the icons that are used in SignUpPage
jest.mock('lucide-react', () => ({
    Eye: () => <div data-testid="eye-icon">Eye</div>,
    EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
    AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
    CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>
}));

describe("SignUpPage Component", () => {
    let mockNavigation;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigation = jest.fn();
        useNavigate.mockReturnValue(mockNavigation);
    });

    test("renders without crashing", () => {
        render(
            <MemoryRouter>
                <SignUpPage/>
            </MemoryRouter>);
        expect(screen.getByRole("heading", {name: /create an account/i})).toBeInTheDocument();

        // will replace all references with test-id in the next sprint
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /create an account/i})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /cancel/i})).toBeInTheDocument();
    });

    test("password toggle visibility", async () => {
        render(
            <MemoryRouter>
                <SignUpPage/>
            </MemoryRouter>);

        const passwordInput = screen.getByLabelText("Password");
        const confirmPasswordInput = screen.getByLabelText("Confirm Password")
        const [passwordToggle, confirmPasswordToggle] = screen.getAllByRole("button", { name: /hide/i });

        expect(passwordInput).toHaveAttribute("type", "password");

        fireEvent.click(passwordToggle);

        expect(passwordInput).toHaveAttribute("type", "text");


        expect(confirmPasswordInput).toHaveAttribute("type", "password");

        fireEvent.click(confirmPasswordToggle);

        expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });

    test("pressing cancel shows confirmation modal", () => {
        render(
            <MemoryRouter>
                <SignUpPage/>
            </MemoryRouter>);

        fireEvent.click(screen.getByRole("button", {name: /cancel/i}));
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    test("canceling and confirming should clear all signup fields", () => {
        render(
            <MemoryRouter>
                <SignUpPage/>
            </MemoryRouter>);

        // Fill in the form fields
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password123" } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password123" } });

        // Verify fields are filled
        expect(screen.getByLabelText(/username/i).value).toBe("testuser");
        expect(screen.getByLabelText(/^password$/i).value).toBe("Password123");
        expect(screen.getByLabelText(/confirm password/i).value).toBe("Password123");

        // Click cancel button
        fireEvent.click(screen.getByRole("button", {name: /cancel/i}));

        // Confirm cancellation
        fireEvent.click(screen.getByRole("button", {name: /yes, cancel/i}));

        // Verify all fields are cleared
        expect(screen.getByLabelText(/username/i).value).toBe("");
        expect(screen.getByLabelText(/^password$/i).value).toBe("");
        expect(screen.getByLabelText(/confirm password/i).value).toBe("");
    });

    test("registering with valid username and valid password yields success and redirects", () => {
        // This test can be similar to "handleSubmit() and redirects to login"
    });

    test("registering with invalid username and valid password yields failure and displays error", () => {
        // Implement this test by submitting with a username that fails validation
    });

    test("registering with valid username and invalid password yields failure and displays error", () => {
        // Implement this test by submitting with a password that fails validation
    });
});