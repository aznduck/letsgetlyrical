import React, {useCallback, useEffect, useState} from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AuthContext, useAuth, ProtectedRoute } from './App';

// Mock the Navigate component from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: () => <div data-testid="navigate-mock">Navigate Mock</div>
}));

// Mock the child components
jest.mock('./pages/LoginPage', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('./pages/SignUpPage', () => () => <div data-testid="signup-page">Signup Page</div>);
jest.mock('./pages/LandingPage', () => () => <div data-testid="landing-page">Landing Page</div>);

describe('App Component', () => {
    test('renders login page at /login route', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('renders signup page at /signup route', () => {
        render(
            <MemoryRouter initialEntries={['/signup']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    });

    test('redirects to login from root path', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
    });
});

// Test ProtectedRoute component separately
describe('ProtectedRoute Component', () => {
    test('renders children when user is logged in', () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={{ user: { username: 'test' } }}>
                    <ProtectedRoute>
                        <div data-testid="protected-content">Protected Content</div>
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('redirects to login when user is not logged in', () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={{ user: null }}>
                    <ProtectedRoute>
                        <div data-testid="protected-content">Protected Content</div>
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );

        // Should render the Navigate component (which we've mocked)
        expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
        // Protected content should not be rendered
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
});

// Test for useAuth hook
describe('useAuth Hook', () => {
    // Create a wrapper component that provides the AuthContext
    const AuthProvider = ({ children }) => {
        const [user, setUser] = React.useState(null);

        const authValue = {
            user,
            login: (userData) => setUser(userData),
            logout: () => setUser(null)
        };

        return (
            <AuthContext.Provider value={authValue}>
                {children}
            </AuthContext.Provider>
        );
    };

    test('useAuth hook works within AuthContext', () => {
        const TestComponent = () => {
            const auth = useAuth();
            return (
                <div>
                    <div data-testid="user-status">{auth.user ? 'Logged in' : 'Not logged in'}</div>
                </div>
            );
        };

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    test('shows loading indicator when isLoading is true', () => {
        render(
            <MemoryRouter>
                <AuthContext.Provider value={{ user: null, isLoading: true }}>
                    <ProtectedRoute>
                        <div data-testid="protected-content">Protected Content</div>
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });




    test('removes invalid stored user from localStorage', () => {
        localStorage.setItem('user', '{bad json');

        const removeItemSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <MemoryRouter>
                <AuthContext.Provider value={{}}>
                    <App />
                </AuthContext.Provider>
            </MemoryRouter>
        );

        expect(removeItemSpy).toHaveBeenCalledWith('user');
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        removeItemSpy.mockRestore();
    });



    test('calls setLastActivity when user is active', () => {
        const dateNowSpy = jest.spyOn(Date, 'now');
        const fakeUser = { username: 'testuser' };

        localStorage.setItem('user', JSON.stringify(fakeUser));

        render(
            <MemoryRouter initialEntries={['/landing']}>
                <App />
            </MemoryRouter>
        );

        act(() => {
            fireEvent.mouseMove(window);
        });

        expect(dateNowSpy).toHaveBeenCalled();

        dateNowSpy.mockRestore();
    });


    test('logs out user after inactivity timeout', () => {
        jest.useFakeTimers();
        jest.spyOn(console, 'log').mockImplementation(() => {});

        const fakeUser = { username: 'inactiveUser' };
        localStorage.setItem('user', JSON.stringify(fakeUser));

        render(
            <MemoryRouter initialEntries={['/landing']}>
                <App />
            </MemoryRouter>
        );

        act(() => {
            jest.advanceTimersByTime(70000);
        });

        expect(localStorage.getItem('user')).toBeNull();
        expect(screen.queryByText('inactiveUser')).not.toBeInTheDocument();

        jest.useRealTimers();
    });












});