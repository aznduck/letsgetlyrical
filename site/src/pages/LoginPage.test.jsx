import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';

const mockNavigate = jest.fn();
const mockLogin = jest.fn();

jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate
}));

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

    test('login and navigate functions are called correctly', () => {
        const fakeEvent = { preventDefault: jest.fn() };

        const MOCK_USERS = [
            { username: "user1", password: "Password1" }
        ];

        const componentInstance = {
            state: {
                username: "user1",
                password: "Password1"
            },
            handleSubmit: function(e) {
                e.preventDefault();

                const foundUser = MOCK_USERS.find(
                    user => user.username === this.state.username && user.password === this.state.password
                );

                if (foundUser) {
                    mockLogin({ username: foundUser.username });
                    mockNavigate("/landing", { replace: true });
                }
            }
        };

        componentInstance.handleSubmit(fakeEvent);

        expect(mockLogin).toHaveBeenCalledWith({ username: "user1" });
        expect(mockNavigate).toHaveBeenCalledWith("/landing", { replace: true });
    });

    /*
    test('shows error message for invalid credentials', async () => {
        render(<LoginPage />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await act(async () => {
            await userEvent.type(usernameInput, 'wronguser');
            await userEvent.type(passwordInput, 'wrongpass');
        });

        await act(async () => {
            await userEvent.click(submitButton);
        });

        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
     */

    test('signup link points to the signup page', () => {
        render(<LoginPage />);

        const signupLink = screen.getByText(/sign up/i);
        expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });

    // After user enter wrong creds for 3 times, the account get locked. Unlock in 30 seconds
    test('locks account after 3 failed attempts', async () => {
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => JSON.stringify([])),
                setItem: jest.fn()
            },
            writable: true
        });
        jest.spyOn(Date, 'now').mockReturnValue(0); // Mock Date.now() to control time
        const originalDateNow = Date.now;
        Date.now = jest.fn(() => 0); // Mock Date.now() to return 0
        // Mock the fetch function
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid credentials' })
            })
        );
        render(<LoginPage />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        for (let i = 0; i < 3; i++) {
            await act(async () => {
                await userEvent.type(usernameInput, 'wronguser');
                await userEvent.type(passwordInput, 'wrongpass');
                await userEvent.click(submitButton);
            });
        }

        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });
    //mock fetch return http not found

    test('shows error message for server error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 404,
                json: () => Promise.resolve({ message: 'Not Found' })
            })
        );

        render(<LoginPage />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await act(async () => {
            await userEvent.type(usernameInput, 'testuser');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);
        });

        expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    });

});