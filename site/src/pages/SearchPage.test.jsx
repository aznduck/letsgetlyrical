import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from './SearchPage';
import { AuthContext } from '../App';

// Mock the components used in SearchPage
jest.mock('../components/NavBar', () => ({ onLogout, initialSearchQuery, initialNumSongs }) => (
    <div data-testid="navbar">
        <div>Search Query: {initialSearchQuery}</div>
        <div>Num Songs: {initialNumSongs}</div>
        <button onClick={onLogout} data-testid="logout-button">Logout</button>
    </div>
));

jest.mock('../components/Footer', () => () => <div data-testid="footer">Footer</div>);

jest.mock('../components/WordCloud', () => ({ favorites }) => (
    <div data-testid="word-cloud">
        Word Cloud with {favorites.length} favorites
    </div>
));

// Mock useNavigate and useLocation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => ({
        search: '?q=Justin%20Bieber&num=10'
    }),
    BrowserRouter: ({ children }) => <div>{children}</div>
}));

describe('SearchPage Component', () => {
    const mockLogout = jest.fn();
    const mockUser = { username: 'testuser' };

    beforeEach(() => {
        // Reset mocks
        mockNavigate.mockClear();
        mockLogout.mockClear();

        render(
            <BrowserRouter>
                <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
                    <SearchPage />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    });

    test('renders all components', () => {
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('word-cloud')).toBeInTheDocument();
        expect(screen.getByText('Top 10 Songs')).toBeInTheDocument();
        expect(screen.getByText('Your Word Cloud')).toBeInTheDocument();
    });

    test('displays search results based on URL parameters', () => {
        expect(screen.getByText('Search Query: Justin Bieber')).toBeInTheDocument();
        expect(screen.getByText('Num Songs: 10')).toBeInTheDocument();

        // Check if we have 10 song items
        const songItems = screen.getAllByText(/Baby/);
        expect(songItems).toHaveLength(10);
    });

    test('logs out user when logout is clicked', () => {
        const logoutButton = screen.getByTestId('logout-button');
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('handles add to favorites button click', () => {
        const addButton = screen.getByText('Add your favorites list');
        fireEvent.click(addButton);

        // In the current implementation, this just logs to console
        // We could enhance this test if the function does more in the future
    });
});