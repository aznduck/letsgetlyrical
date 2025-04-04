import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';
import { AuthContext } from '../App';

// Mock the child components
jest.mock('../components/NavBar', () => ({ onLogout }) => (
    <div data-testid="navbar">
        <button onClick={onLogout}>Mock Logout</button>
    </div>
));
jest.mock('../components/Footer', () => () => <div data-testid="footer">Footer</div>);
jest.mock('../components/Favorites', () => () => <div data-testid="favorites">Favorites</div>);

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('LandingPage Component', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        render(
            <BrowserRouter>
                <AuthContext.Provider value={{ user: { username: 'testuser' }, logout: mockLogout }}>
                    <LandingPage />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    });

    test('renders landing page with all components', () => {
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('favorites')).toBeInTheDocument();
    });

    test('renders cloud graphic and action buttons', () => {
        expect(screen.getByAltText('Cloud with Welcome back text')).toBeInTheDocument();
        expect(screen.getByText('Generate favorites cloud')).toBeInTheDocument();
        expect(screen.getByText('Compare with friends!')).toBeInTheDocument();
    });

    test('handles logout correctly', () => {
        const logoutButton = screen.getByText('Mock Logout');
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('action buttons are clickable', () => {
        const generateButton = screen.getByText('Generate favorites cloud');
        const compareButton = screen.getByText('Compare with friends!');

        // We can't test the actual functionality since it's not implemented in the code
        // But we can verify the buttons are not disabled
        expect(generateButton).not.toBeDisabled();
        expect(compareButton).not.toBeDisabled();
    });
});