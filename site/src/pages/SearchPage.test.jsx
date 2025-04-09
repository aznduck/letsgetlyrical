import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import SearchPage from './SearchPage';
import GeniusService from '../services/GeniusService';
// Removed direct import of useAuth here, as we mock the module '../App' entirely

// --- Mocks ---

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
let mockLocation = { search: '', pathname: '/search' };
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

// Mock useAuth hook by mocking the entire '../App' module
// different mocklogout implementation than wordcloudpage
const mockLogout = jest.fn(); // Define mockLogout separately to check calls
jest.mock('../App', () => {
    // Capture the actual AuthContext if needed, though likely not for these tests
    const actualApp = jest.requireActual('../App');
    return {
        __esModule: true, // Indicates that this is an ES Module
        ...actualApp, // Keep other exports from App.jsx if any (like AuthContext itself)
        // --- HERE is the corrected mock for useAuth ---
        useAuth: jest.fn(() => ({         // Directly define the mock implementation
            user: { name: 'Test User' },  // Provide the expected user object
            isLoading: false,             // Add isLoading based on your App.jsx context value
            logout: mockLogout,           // Use the mockLogout function
            login: jest.fn(),             // Add a mock for login if needed
        })),
    };
});


// Mock GeniusService
jest.mock('../services/GeniusService');
const mockSearchArtist = GeniusService.searchArtist;
const mockGetTopSongs = GeniusService.getTopSongs;

// Mock Child Components
jest.mock('../components/NavBar', () => ({ initialSearchQuery, initialNumSongs, onLogout }) => (
    <div data-testid="navbar">
        Mock Navbar - Query: {initialSearchQuery} - Songs: {initialNumSongs}
        <button onClick={onLogout}>Mock Logout Button</button>
    </div>
));
jest.mock('../components/Footer', () => () => <div data-testid="footer">Mock Footer</div>);
jest.mock('../components/WordCloud', () => ({ favorites }) => (
    <div data-testid="wordcloud">
        Mock WordCloud - Songs: {favorites ? favorites.length : 0}
    </div>
));

// Spies for console methods
let consoleLogSpy;
let consoleErrorSpy;


describe('<SearchPage />', () => {
    const renderComponent = (initialEntries = ['/search']) => {
        const entry = initialEntries[0];
        mockLocation = { ...mockLocation, search: entry.includes('?') ? entry.substring(entry.indexOf('?')) : '' };

        // Important: Ensure the mocked useAuth implementation is fresh for each render if needed,
        // although the below setup usually works across tests due to beforeEach cleanup.
        // If state across tests becomes an issue, reset the mock implementation here:
        // require('../App').useAuth.mockImplementation(() => ({ ... }));

        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    {/* Wrap tested route in ProtectedRoute to mimic App structure if necessary,
                OR test SearchPage directly assuming auth context is provided */}
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clears call history etc. for ALL mocks
        mockSearchArtist.mockReset();
        mockGetTopSongs.mockReset();

        // Explicitly reset the useAuth mock implementation IF needed between tests
        // This ensures each test starts with the defined mock state
        // Often `jest.clearAllMocks` is sufficient, but being explicit can help debugging
        require('../App').useAuth.mockImplementation(() => ({
            user: { name: 'Test User' },
            isLoading: false,
            logout: mockLogout,
            login: jest.fn(),
        }));


        mockLocation = { search: '', pathname: '/search' };
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    })

    // ----- ALL THE 'it(...)' TEST CASES REMAIN THE SAME -----
    // ... (Keep all your existing test cases below)

    it('renders initial state without search query', () => {
        renderComponent();

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByText(/Enter an artist name in the search bar/i)).toBeInTheDocument();
        expect(mockSearchArtist).not.toHaveBeenCalled();
        expect(mockGetTopSongs).not.toHaveBeenCalled();
        expect(screen.queryByTestId('wordcloud')).not.toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('initiates artist search when query parameter exists', async () => {
        const searchQuery = 'Queen';
        mockSearchArtist.mockResolvedValue([]);
        renderComponent([`/search?q=${searchQuery}&num=15`]);

        expect(screen.getByTestId('navbar')).toHaveTextContent(`Query: ${searchQuery}`);
        expect(screen.getByTestId('navbar')).toHaveTextContent(`Songs: 15`);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockSearchArtist).toHaveBeenCalledTimes(1);
            expect(mockSearchArtist).toHaveBeenCalledWith(searchQuery);
        });
    });

    it('displays potential artists when search is successful', async () => {
        const searchQuery = 'Muse';
        const mockArtists = [
            { artist_id: 103, artist_name: 'Muse' },
            { artist_id: 500, artist_name: 'Museum' },
        ];
        mockSearchArtist.mockResolvedValue(mockArtists);
        renderComponent([`/search?q=${searchQuery}`]);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            expect(screen.getByText('Select an Artist:')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: 'Muse' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Museum' })).toBeInTheDocument();
        expect(mockGetTopSongs).not.toHaveBeenCalled();
    });

    it('displays "no artists found" message when search returns empty', async () => {
        const searchQuery = 'NonExistentArtist123';
        mockSearchArtist.mockResolvedValue([]);
        renderComponent([`/search?q=${searchQuery}`]);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const expectedErrorMessage = `Error: No artists found matching "${searchQuery}". Please try a different search term.`;
        expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();

        expect(screen.queryByText('Select an Artist:')).not.toBeInTheDocument();
    });

    it('displays error message when artist search fails', async () => {
        const searchQuery = 'ErrorProne';
        const errorMessage = 'Network Error';
        mockSearchArtist.mockRejectedValue(new Error(errorMessage));
        renderComponent([`/search?q=${searchQuery}`]);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch artists:", expect.any(Error));
    });


    it('fetches and displays songs when an artist is selected', async () => {
        const searchQuery = 'Radiohead';
        const artistId = 70;
        const numSongs = 5;
        const mockArtists = [{ artist_id: artistId, artist_name: 'Radiohead' }];
        const mockSongsRaw = [
            { id: 101, title: 'Creep', primary_artist: { name: 'Radiohead' }, song_art_image_thumbnail_url: 'creep.jpg' },
            { id: 102, title: 'Karma Police', primary_artist: { name: 'Radiohead' }, header_image_thumbnail_url: 'karma.jpg' },
            { id: 103, title: 'No Surprises (Remastered)', primary_artist: { name: 'Radiohead' }, featured_artists: [{ name: 'Strings Section' }] },
        ];
        mockSearchArtist.mockResolvedValue(mockArtists);
        mockGetTopSongs.mockResolvedValue(mockSongsRaw);

        renderComponent([`/search?q=${searchQuery}&num=${numSongs}`]);

        const artistButton = await screen.findByRole('button', { name: 'Radiohead' });
        fireEvent.click(artistButton);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(mockGetTopSongs).toHaveBeenCalledTimes(1);
            expect(mockGetTopSongs).toHaveBeenCalledWith(artistId, numSongs);
        });

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            expect(screen.getByText(`Top ${mockSongsRaw.length} Songs for Radiohead`)).toBeInTheDocument();
        });

        expect(screen.getByText('Creep')).toBeInTheDocument();
        expect(screen.getByAltText('Creep cover')).toHaveAttribute('src', 'creep.jpg');
        expect(screen.getByText('Karma Police')).toBeInTheDocument();
        expect(screen.getByAltText('Karma Police cover')).toHaveAttribute('src', 'karma.jpg');
        expect(screen.getByText('No Surprises (Remastered)')).toBeInTheDocument();
        expect(screen.getByText(/Radiohead, feat\. Strings Section/i)).toBeInTheDocument();
        expect(screen.getByAltText('No Surprises (Remastered) cover')).toHaveAttribute('src', '/images/placeholder.svg');


        expect(screen.getByTestId('wordcloud')).toBeInTheDocument();
        expect(screen.getByTestId('wordcloud')).toHaveTextContent(`Songs: ${mockSongsRaw.length}`);
        expect(screen.getByRole('button', { name: /add this list to favorites/i })).toBeInTheDocument();
    });

    it('displays "no songs found" message when song fetch returns empty', async () => {
        const searchQuery = 'SoloProject';
        const artistId = 88;
        const numSongs = 10;
        const mockArtists = [{ artist_id: artistId, artist_name: 'SoloProject' }];

        mockSearchArtist.mockResolvedValue(mockArtists);
        mockGetTopSongs.mockResolvedValue([]);

        renderComponent([`/search?q=${searchQuery}&num=${numSongs}`]);

        const artistButton = await screen.findByRole('button', { name: 'SoloProject' });
        fireEvent.click(artistButton);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(mockGetTopSongs).toHaveBeenCalledWith(artistId, numSongs);
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.getByText(`Error: No songs found for SoloProject. They might not have songs listed on Genius.`)).toBeInTheDocument();
        expect(screen.queryByText(/Top \d+ Songs for/i)).not.toBeInTheDocument();
        expect(screen.queryByTestId('wordcloud')).not.toBeInTheDocument();
    });

    it('displays error message when song fetch fails', async () => {
        const searchQuery = 'BrokenAPIArtist';
        const artistId = 99;
        const numSongs = 20;
        const mockArtists = [{ artist_id: artistId, artist_name: 'BrokenAPIArtist' }];
        const errorMessage = 'Server timed out';

        mockSearchArtist.mockResolvedValue(mockArtists);
        mockGetTopSongs.mockRejectedValue(new Error(errorMessage));

        renderComponent([`/search?q=${searchQuery}&num=${numSongs}`]);

        const artistButton = await screen.findByRole('button', { name: 'BrokenAPIArtist' });
        fireEvent.click(artistButton);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(mockGetTopSongs).toHaveBeenCalledWith(artistId, numSongs);
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch songs:", expect.any(Error));
    });


    it('calls logout and navigates to /login when logout button is clicked', async () => {
        renderComponent();

        const logoutButton = screen.getByRole('button', { name: /mock logout button/i });
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        })
    });

    it('logs songs when "Add to Favorites" is clicked', async () => {
        const searchQuery = 'FavoriteArtist';
        const artistId = 123;
        const numSongs = 3;
        const mockArtists = [{ artist_id: artistId, artist_name: 'FavoriteArtist' }];
        const mockSongsRaw = [
            { id: 201, title: 'Hit Song 1', primary_artist: { name: 'FavoriteArtist' }, song_art_image_thumbnail_url: 'fav1.jpg' },
            { id: 202, title: 'Hit Song 2', primary_artist: { name: 'FavoriteArtist' }, song_art_image_thumbnail_url: 'fav2.jpg' },
        ];
        mockSearchArtist.mockResolvedValue(mockArtists);
        mockGetTopSongs.mockResolvedValue(mockSongsRaw);

        renderComponent([`/search?q=${searchQuery}&num=${numSongs}`]);

        const artistButton = await screen.findByRole('button', { name: 'FavoriteArtist' });
        fireEvent.click(artistButton);

        const favoritesButton = await screen.findByRole('button', { name: /add this list to favorites/i });

        fireEvent.click(favoritesButton);

        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith(
            "Add to favorites clicked. Songs:",
            expect.arrayContaining([
                expect.objectContaining({ title: 'Hit Song 1', artist: 'FavoriteArtist' }),
                expect.objectContaining({ title: 'Hit Song 2', artist: 'FavoriteArtist' })
            ])
        );
    });

    it('handles image loading errors by falling back to default', async () => {
        const searchQuery = 'ImageErrorArtist';
        const artistId = 456;
        const mockArtists = [{ artist_id: artistId, artist_name: 'ImageErrorArtist' }];
        const mockSongsRaw = [
            { id: 301, title: 'Song With Bad Image', primary_artist: { name: 'ImageErrorArtist' }, song_art_image_thumbnail_url: 'bad-image.jpg' }
        ];
        mockSearchArtist.mockResolvedValue(mockArtists);
        mockGetTopSongs.mockResolvedValue(mockSongsRaw);

        renderComponent([`/search?q=${searchQuery}`]);

        const artistButton = await screen.findByRole('button', { name: 'ImageErrorArtist' });
        fireEvent.click(artistButton);

        const image = await screen.findByAltText('Song With Bad Image cover');
        expect(image).toHaveAttribute('src', 'bad-image.jpg');

        fireEvent.error(image);

        expect(image).toHaveAttribute('src', '/images/placeholder.svg');
    });


});