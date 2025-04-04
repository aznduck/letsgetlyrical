import React from 'react';
import { render, screen } from '@testing-library/react';
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
});