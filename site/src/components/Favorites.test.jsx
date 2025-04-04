import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Favorites from './Favorites';

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
    Heart: () => <div data-testid="heart-icon" />,
    MoreHorizontal: () => <div data-testid="more-icon" />,
    AlignJustify: () => <div data-testid="align-icon" />,
    Lock: () => <div data-testid="lock-icon" />,
    Globe: () => <div data-testid="globe-icon" />,
    SquareMinus: () => <div data-testid="minus-icon" />,
    X: () => <div data-testid="x-icon" />,
    ChevronUp: () => <div data-testid="up-icon" />,
    ChevronDown: () => <div data-testid="down-icon" />
}));

describe('Favorites Component', () => {
    beforeEach(() => {
        render(<Favorites />);
    });

    test('renders favorites section with title', () => {
        expect(screen.getByText('Your Favorites')).toBeInTheDocument();
        expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    test('renders favorites list with items', () => {
        expect(screen.getByText('Song Title 1')).toBeInTheDocument();
        expect(screen.getByText('Song Title 2')).toBeInTheDocument();
        // Check for the number indicators
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('opens menu when menu button is clicked', () => {
        const menuButton = screen.getByRole('button', { name: /favorites menu/i });
        fireEvent.click(menuButton);

        expect(screen.getByText('Private')).toBeInTheDocument();
        expect(screen.getByText('Public')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('toggles between private and public mode', () => {
        // Open menu
        const menuButton = screen.getByRole('button', { name: /favorites menu/i });
        fireEvent.click(menuButton);

        // Initially in private mode
        const privateButton = screen.getByText('Private').closest('button');
        const publicButton = screen.getByText('Public').closest('button');

        expect(privateButton).toHaveClass('selected');

        // Switch to public mode
        fireEvent.click(publicButton);
        expect(publicButton).toHaveClass('selected');
        expect(privateButton).not.toHaveClass('selected');

        // Switch back to private mode
        fireEvent.click(privateButton);
        expect(privateButton).toHaveClass('selected');
        expect(publicButton).not.toHaveClass('selected');
    });

    test('shows delete confirmation when delete is clicked', () => {
        // Open menu
        const menuButton = screen.getByRole('button', { name: /favorites menu/i });
        fireEvent.click(menuButton);

        // Click delete
        const deleteButton = screen.getByText('Delete').closest('button');
        fireEvent.click(deleteButton);

        // Check confirmation dialog appears
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText('This will delete your entire favorites list.')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    test('cancels delete when cancel is clicked in confirmation', () => {
        // Open menu and click delete
        const menuButton = screen.getByRole('button', { name: /favorites menu/i });
        fireEvent.click(menuButton);
        const deleteButton = screen.getByText('Delete').closest('button');
        fireEvent.click(deleteButton);

        // Click cancel in confirmation
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        // Confirmation should be gone
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();

        // Songs should still be there
        expect(screen.getByText('Song Title 1')).toBeInTheDocument();
    });

    test('deletes all favorites when delete is confirmed', () => {
        // Open menu and click delete
        const menuButton = screen.getByRole('button', { name: /favorites menu/i });
        fireEvent.click(menuButton);
        const deleteButton = screen.getByText('Delete').closest('button');
        fireEvent.click(deleteButton);

        // Click delete in confirmation
        const confirmDeleteButton = screen.getByText('Delete').closest('button');
        fireEvent.click(confirmDeleteButton);

        // Confirmation should be gone
        expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();

        // Songs should be gone, replaced with empty message
        expect(screen.queryByText('Song Title 1')).not.toBeInTheDocument();
        expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });

    test('shows song details when a song is clicked', () => {
        // Click on a song
        const songTitle = screen.getByText('Song Title 1');
        fireEvent.click(songTitle);

        // Song details modal should appear
        expect(screen.getByText('Album')).toBeInTheDocument();
        expect(screen.getByTestId('pop-up-song-title')).toBeInTheDocument();
        expect(screen.getByText('Artist Name 1')).toBeInTheDocument();
    });

    test('closes song details when close button is clicked', () => {
        // Open song details
        const songTitle = screen.getByText('Song Title 1');
        fireEvent.click(songTitle);

        // Click close button
        const closeButton = screen.getByTestId('close-button');
        fireEvent.click(closeButton);

        // Modal should be gone
        expect(screen.queryByText('Album')).not.toBeInTheDocument();
    });

    test('shows action menu when more button is clicked', () => {
        // Find the first song's action button
        const actionButtons = screen.getAllByRole('button', { name: '' });
        const firstSongActionButton = actionButtons.find(button =>
            button.closest('.favorite-actions')
        );

        fireEvent.click(firstSongActionButton);

        // Action menu should appear
        expect(screen.getByText('Move song')).toBeInTheDocument();
        expect(screen.getByText('Remove song')).toBeInTheDocument();
    });

    test('removes a song when remove is clicked in action menu', () => {
        // Get the initial count of songs
        const initialSongs = screen.getAllByText(/Song Title/);
        const initialCount = initialSongs.length;

        // Open action menu for first song
        const actionButtons = screen.getAllByRole('button', { name: '' });
        const firstSongActionButton = actionButtons.find(button =>
            button.closest('.favorite-actions')
        );

        fireEvent.click(firstSongActionButton);

        // Click remove song
        const removeButton = screen.getByText('Remove song');
        fireEvent.click(removeButton);

        // Should have one less song
        const remainingSongs = screen.getAllByText(/Song Title/);
        expect(remainingSongs.length).toBe(initialCount - 1);
    });
});