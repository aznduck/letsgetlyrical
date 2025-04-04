import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from './NavBar';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('NavBar Component', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        render(
            <BrowserRouter>
                <NavBar onLogout={mockLogout} />
            </BrowserRouter>
        );
        mockNavigate.mockClear();
        mockLogout.mockClear();
    });

    test('renders navbar with logo', () => {
        expect(screen.getByAltText("Let's get lyrical!")).toBeInTheDocument();
    });

    test('renders search input', () => {
        expect(screen.getByPlaceholderText('Enter an artist')).toBeInTheDocument();
    });

    test('renders num songs input', () => {
        expect(screen.getByPlaceholderText('Num Songs')).toBeInTheDocument();
    });

    test('renders logout button', () => {
        expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    test('handles search input change', () => {
        const searchInput = screen.getByPlaceholderText('Enter an artist');
        fireEvent.change(searchInput, { target: { value: 'Taylor Swift' } });
        expect(searchInput.value).toBe('Taylor Swift');
    });

    test('handles num songs input change', () => {
        const numSongsInput = screen.getByPlaceholderText('Num Songs');
        fireEvent.change(numSongsInput, { target: { value: '10' } });
        expect(numSongsInput.value).toBe('10');
    });

    test('clears search input when clear button is clicked', () => {
        const searchInput = screen.getByPlaceholderText('Enter an artist');
        fireEvent.change(searchInput, { target: { value: 'Taylor Swift' } });
        expect(searchInput.value).toBe('Taylor Swift');

        const clearButton = screen.getByTestId('clear-search-button');
        fireEvent.click(clearButton);
        expect(searchInput.value).toBe('');
    });

    test('navigates to landing page when home button is clicked', () => {
        const homeButton = screen.getByTitle('Go to Home');
        fireEvent.click(homeButton);
        expect(mockNavigate).toHaveBeenCalledWith('/landing');
    });

    test('calls logout function when logout button is clicked', () => {
        const logoutButton = screen.getByText('Log out');
        fireEvent.click(logoutButton);
        expect(mockLogout).toHaveBeenCalled();
    });

    test('filters non-numeric input in num songs field', () => {
        const numSongsInput = screen.getByPlaceholderText('Num Songs');
        fireEvent.change(numSongsInput, { target: { value: '10abc' } });
        expect(numSongsInput.value).toBe('10');
    });

    test('applies focus styling to search input', () => {
        const searchInput = screen.getByPlaceholderText('Enter an artist');
        const searchContainer = searchInput.closest('.search-input-container');

        fireEvent.focus(searchInput);
        expect(searchContainer).toHaveClass('focused');

        fireEvent.blur(searchInput);
        expect(searchContainer).not.toHaveClass('focused');
    });
});