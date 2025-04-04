import React from 'react';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import {useAuth} from "../App";
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();
import { BrowserRouter } from "react-router-dom";
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const mockNavigate = jest.fn();
const mockLogin = jest.fn();

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        Link: ({ children, to }) => <a href={to}>{children}</a>,
        useNavigate: () => mockNavigate
    };
});


jest.mock('../App', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null
    })
}));

jest.mock('lucide-react', () => ({
    Eye: () => <div data-testid="eye-icon">Eye</div>,
    EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>
}));

describe('LoginPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    test('renders login form', () => {
        render(<LoginPage />);

        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('allows entering username and password', async () => {
        render(<LoginPage />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await act(async () => {
            await userEvent.type(usernameInput, 'testuser');
            await userEvent.type(passwordInput, 'password123');
        });

        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('password123');
    });

    test('toggles password visibility when hide button is clicked', async () => {
        render(<LoginPage />);

        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByText(/hide/i);

        expect(passwordInput).toHaveAttribute('type', 'password');


        await act(async () => {
            await userEvent.click(toggleButton);
        });

        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test("handles non-existent username submission", async () => {
        const mockResponseData = { username: "User not found" };

        fetchMock.mockResponseOnce(
            JSON.stringify(mockResponseData),
            { status: 404 }
        );

        render(<LoginPage/>);
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/username/i), "baduser1");
            await userEvent.type(screen.getByLabelText(/password/i), "Password0");
            await userEvent.click(screen.getByRole("button", {name: /sign in/i}));
        });

        await waitFor(() => {
            const errorMessage = screen.getByText(/user not found/i);
            expect(errorMessage).toBeInTheDocument();
        });

        expect(fetchMock).toHaveBeenCalledWith("api/login/login", expect.anything());
    });

    test("handles wrong password submission", async () => {
        const mockResponseData = { username: "Invalid password" };

        fetchMock.mockResponseOnce(
            JSON.stringify(mockResponseData),
            { status: 401 }
        );

        render(<LoginPage/>);
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/username/i), "existinguser");
            await userEvent.type(screen.getByLabelText(/password/i), "badPass0");
            await userEvent.click(screen.getByRole("button", {name: /sign in/i}));
        });

        await waitFor(() => {
            const errorMessage = screen.getByText(/invalid password/i);
            expect(errorMessage).toBeInTheDocument();
        });

        expect(fetchMock).toHaveBeenCalledWith("api/login/login", expect.anything());
    });

    test("lockout after three failed password attempts", async() => {
        fetchMock.mockResponses(
            [JSON.stringify({ username: "Invalid password" }), { status: 401 }],
            [JSON.stringify({ username: "Invalid password" }), { status: 401 }],
            [JSON.stringify({ username: "Invalid password" }), { status: 401 }]
        );

        render(<LoginPage />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole("button", { name: /sign in/i });

        // repeat invalid password three times
        for (let i = 0; i < 3; i++) {
            await act(async () => {
                await userEvent.clear(usernameInput);
                await userEvent.clear(passwordInput);
                await userEvent.type(usernameInput, "existinguser");
                await userEvent.type(passwordInput, "badPass0");
                await userEvent.click(submitButton);
            });

            if(i === 2) {
                const errorMessage = screen.getByText(/account locked/i);
                expect(errorMessage).toBeInTheDocument();
            }
            else {
                await waitFor(() => {
                    const errorMessage = screen.getByText(/invalid password/i);
                    expect(errorMessage).toBeInTheDocument();
                });
            }
        }


        const lockoutEnd = localStorage.getItem("lockoutEnd");
        expect(lockoutEnd).toBeTruthy();
        expect(Number(lockoutEnd)).toBeGreaterThan(Date.now());

        localStorage.removeItem(("lockoutEnd")); // for the future!
    });

    test("test for non-valid response", async () => {
        const mockResponseData = { username: "Invalid input" };

        fetchMock.mockResponseOnce(
            JSON.stringify(mockResponseData),
            { status: 400 }
        );

        render(<LoginPage/>);
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/username/i), "baduser");
            await userEvent.type(screen.getByLabelText(/password/i), "Password0");
            await userEvent.click(screen.getByRole("button", {name: /sign in/i}));
        });

        await waitFor(() => {
            const errorMessage = screen.getByText(/invalid input/i);
            expect(errorMessage).toBeInTheDocument();
        });

        expect(fetchMock).toHaveBeenCalledWith("api/login/login", expect.anything());
    });

    test("removes failed login attempts older than 60 seconds", async () => {
        jest.useFakeTimers();
        const now = Date.now();
        jest.setSystemTime(now);

        const removedAttempt = now;
        const remainingAttempt = now + 30000;

        localStorage.setItem("failedAttempts", JSON.stringify([removedAttempt, remainingAttempt]));

        render(<LoginPage />);

        jest.advanceTimersByTime(60000);

        await waitFor(() => {
            const updatedAttempts = JSON.parse(localStorage.getItem("failedAttempts"));
            expect(updatedAttempts).toEqual([remainingAttempt]);
        });

        jest.useRealTimers();
    });

    test("failedAttempts is empty", async () => {
        jest.useFakeTimers();
        const now = Date.now();
        jest.setSystemTime(now);

        const removedAttempt = now;
        const remainingAttempt = now + 30000;

        localStorage.removeItem("failedAttempts");

        render(<LoginPage />);

        jest.advanceTimersByTime(60000);

        await waitFor(() => {
            const updatedAttempts = JSON.parse(localStorage.getItem("failedAttempts"));
            expect(updatedAttempts).toEqual([]);
        });

        jest.useRealTimers();
    });

    test('signup link points to the signup page', () => {
        render(<LoginPage />);

        const signupLink = screen.getByText(/sign up/i);
        expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });



    test("tests for valid form submission and returns with a successful redirect", async () => {
        const mockResponseData = { username: "Successfully logged in" };

        fetchMock.mockResponseOnce(
            JSON.stringify(mockResponseData),
            { status: 200 }
        );

        render(<LoginPage/>);
        await act(async () => {
            await userEvent.type(screen.getByLabelText(/username/i), "baduser1");
            await userEvent.type(screen.getByLabelText(/password/i), "Password0");
            await userEvent.click(screen.getByRole("button", {name: /sign in/i}));
        });

        await waitFor(() => {
            const errorMessage = screen.getByText(/Successfully logged in/i);
            expect(errorMessage).toBeInTheDocument();
        });

        expect(fetchMock).toHaveBeenCalledWith("api/login/login", expect.anything());
    });

    test("successful login", async () => {
        const mockResponseData = { username: "Successfully logged in" }
        fetchMock.mockResponseOnce(JSON.stringify(mockResponseData), { status: 200 })

        render(<LoginPage />)

        await userEvent.type(screen.getByLabelText(/username/i), "gooduser")
        await userEvent.type(screen.getByLabelText(/password/i), "Password0")
        await act(async () => {
            await userEvent.click(screen.getByRole("button", { name: /sign in/i }))
        })

        await waitFor(() => {
            expect(screen.getByText(/successfully logged in/i)).toBeInTheDocument()
            expect(mockLogin).toHaveBeenCalledWith({ username: "gooduser" })
        })
    });



});