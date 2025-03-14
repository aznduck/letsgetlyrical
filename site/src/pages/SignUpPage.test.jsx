import React from "react";
import {render, screen, fireEvent, act} from "@testing-library/react";
import SignUpPage from "./SignUpPage";
import {MemoryRouter} from "react-router-dom";
import {useNavigate} from "react-router-dom";
// import userEvent from "@testing-library/user-event/index";

// jest.mock("../App", () => ({
//     useAuth: jest.fn(),
// }));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock('lucide-react', () => ({
    Eye: () => <div data-testid="eye-icon">Eye</div>,
    EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>
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

    test("handleSubmit() and redirects to login", () => {
        render(
            <MemoryRouter>
                <SignUpPage/>
            </MemoryRouter>);

        fireEvent.change(screen.getByLabelText("Username"), {target: {value: "testUsername"}});
        fireEvent.change(screen.getByLabelText("Password"), {target: {value: "testPass1"}});
        fireEvent.change(screen.getByLabelText("Confirm Password"), {target: {value: "testPass1"}});
        fireEvent.submit(screen.getByRole("button", {name: /create an account/i}));

        expect(mockNavigation).toHaveBeenCalledWith("/login");
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

    test("pressing cancel redirects to login", () => {
        render(
            <MemoryRouter>
                <SignUpPage/>
            </MemoryRouter>);

        fireEvent.click(screen.getByRole("button", {name: /cancel/i}));
        expect(mockNavigation).toHaveBeenCalledWith("/login");
    });

    test("registering with valid username and valid password yields success and redirects", () => {});
    test("registering with invalid username and valid password yields failure and displays error", () => {});
    test("registering with valid username and invalid password yields failure and displays error", () => {});

});