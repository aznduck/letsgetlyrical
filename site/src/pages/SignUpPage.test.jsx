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
        const [passwordToggle, confirmPasswordToggle] = screen.getAllByRole("button", { name: /Show/i });

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

    test("registering with valid username and valid password yields success and redirects", async () => {
        jest.useFakeTimers();
        global.fetch.mockResolvedValueOnce({ ok: true });

        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "ValidUser" } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1" } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password1" } });

        fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

        await waitFor(() => {
            expect(screen.getByText(/success/i)).toBeInTheDocument();
        });

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(useNavigate()).toHaveBeenCalledWith("/login");

        jest.useRealTimers();
    });


    test("registering with invalid username and valid password yields failure and displays error", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Username already exists" }),
        });

        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser1" } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1" } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password1" } });

        fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

        expect(await screen.findByText(/username already exists/i)).toBeInTheDocument();
    });


    test("registering with valid username and invalid password yields failure and displays error", async () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "ValidUser" } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password" } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password" } });

        fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

        expect(screen.getByText(/must contain at least 1 uppercase/i)).toBeInTheDocument();
    });

    test("dismisses cancel confirmation modal when Cancel is clicked", () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /No, continue/i }));

        expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });

    test("shows error when passwords do not match", () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "TestUser" } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password1" } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "DifferentPass1" } });

        fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    test("displays fallback error when fetch fails", async () => {
        global.fetch.mockRejectedValueOnce(new Error("Network error"));

        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: "TestUser" },
        });
        fireEvent.change(screen.getByLabelText(/^password$/i), {
            target: { value: "Password1" },
        });
        fireEvent.change(screen.getByLabelText(/confirm password/i), {
            target: { value: "Password1" },
        });

        fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

        expect(
            await screen.findByText("Registration failed. Please try again.")
        ).toBeInTheDocument();
    });


});
