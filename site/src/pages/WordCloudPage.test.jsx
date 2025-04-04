import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WordCloudPage from './WordCloudPage';
import { AuthContext } from '../App';

// Mock the components used in WordCloudPage
jest.mock('../components/NavBar', () => ({ onLogout }) => (
    <div data-testid="navbar">
        <button onClick={onLogout} data-testid="logout-button">Logout</button>
    </div>
));

jest.mock('../components/Footer', () => () => <div data-testid="footer">Footer</div>);

jest.mock('../components/WordCloud', () => ({ favorites }) => (
    <div data-testid="word-cloud">
        Word Cloud with {favorites.length} favorites
    </div>
));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => <div>{children}</div>
}));

describe('WordCloudPage Component', () => {
    const mockLogout = jest.fn();
    const mockUser = { username: 'testuser' };

    beforeEach(() => {
        // Reset mocks
        mockNavigate.mockClear();
        mockLogout.mockClear();

        render(
            <BrowserRouter>
                <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
                    <WordCloudPage />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    });

    test('renders all components', () => {
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('word-cloud')).toBeInTheDocument();
        expect(screen.getByText('Your Favorites Word Cloud')).toBeInTheDocument();
    });


    test('logs out user when logout is clicked', () => {
        const logoutButton = screen.getByTestId('logout-button');
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});