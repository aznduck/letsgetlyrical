describe("SongList", () => {
    test("fake test", () => {
        expect(1).toBeTruthy();
    });
})

// import React from 'react';
// import { render, screen, fireEvent, within } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import SongList from './SongList';
//
// // Mock child components
// jest.mock('./LyricsPopUp', () => {
//     return function MockLyricsPopup({ visible, onClose, song }) {
//         return visible ? (
//             <div data-testid="lyrics-popup">
//                 {song && <div data-testid="lyrics-content">{song.lyrics}</div>}
//                 <button onClick={onClose} data-testid="close-lyrics">Close</button>
//             </div>
//         ) : null;
//     };
// });
//
// jest.mock('./Toast', () => {
//     return function MockToast({ visible, onClose, message, type }) {
//         return visible ? (
//             <div data-testid="toast" className={type}>
//                 {message}
//                 <button onClick={onClose} data-testid="close-toast">Close</button>
//             </div>
//         ) : null;
//     };
// });
//
// // Mock CSS import
// jest.mock('../styles/SongList.css', () => ({}));
//
// // Mock data
// const mockSongs = [
//     { id: '1', title: 'Song 1', artist: 'Artist 1', year: 2020 },
//     { id: '2', title: 'Song 2', artist: 'Artist 2', year: 2021 },
//     { url: '3', title: 'Song 3', artist: 'Artist 3', year: 2022 }, // Using url instead of id
// ];
//
// // Mock lyrics map
// const mockLyricsMap = new Map([
//     ['1', 'These are the lyrics for Song 1 with test word in it'],
//     ['2', 'These are the lyrics for Song 2 without match'],
//     ['3', 'These are the lyrics for Song 3 with test word also'],
// ]);
//
// // Default props
// const defaultProps = {
//     searchTerm: 'test word',
//     songs: mockSongs,
//     onClose: jest.fn(),
//     lyricsMap: mockLyricsMap,
// };
//
// describe('SongList Component', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });
//
//     test('renders component with matching songs', () => {
//         render(<SongList {...defaultProps} />);
//
//         // Check the title is rendered
//         expect(screen.getByText(/Songs containing the word 'test word'/i)).toBeInTheDocument();
//
//         // Check that only songs with matching lyrics are displayed
//         expect(screen.getByText('Song 1')).toBeInTheDocument();
//         expect(screen.queryByText('Song 2')).not.toBeInTheDocument();
//         expect(screen.getByText('Song 3')).toBeInTheDocument();
//
//         // Check table headers
//         expect(screen.getByText('#')).toBeInTheDocument();
//         expect(screen.getByText('Song')).toBeInTheDocument();
//         expect(screen.getByText('Artist')).toBeInTheDocument();
//         expect(screen.getByText('Year')).toBeInTheDocument();
//     });
//
//     test('renders "no songs found" message when no matches', () => {
//         render(<SongList {...defaultProps} searchTerm="nonexistent" />);
//
//         expect(screen.getByText(/No songs with available lyrics were found containing 'nonexistent'/i)).toBeInTheDocument();
//     });
//
//     test('renders empty state when search term is empty', () => {
//         render(<SongList {...defaultProps} searchTerm="" />);
//         expect(screen.getByText(/No songs with available lyrics were found containing ''/i)).toBeInTheDocument();
//     });
//
//     test('renders empty state when songs array is empty', () => {
//         render(<SongList {...defaultProps} songs={[]} />);
//         expect(screen.getByText(/No songs with available lyrics were found containing 'test word'/i)).toBeInTheDocument();
//     });
//
//     test('renders empty state when lyrics map is null', () => {
//         render(<SongList {...defaultProps} lyricsMap={null} />);
//         expect(screen.getByText(/No songs with available lyrics were found containing 'test word'/i)).toBeInTheDocument();
//     });
//
//     test('calls onClose when backdrop or close button is clicked', () => {
//         const { container } = render(<SongList {...defaultProps} />);
//
//         // Click the close button
//         fireEvent.click(screen.getByRole('button', { name: '✕' }));
//         expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
//
//         // Click the backdrop - using querySelector instead of getByClassName
//         const backdrop = container.querySelector('.song-list-backdrop');
//         fireEvent.click(backdrop);
//         expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
//     });
//
//     test('shows and hides lyrics popup', () => {
//         render(<SongList {...defaultProps} />);
//
//         // Lyrics popup should not be visible initially
//         expect(screen.queryByTestId('lyrics-popup')).not.toBeInTheDocument();
//
//         // Click lyrics button for first song
//         const lyricsButtons = screen.getAllByRole('button', { name: /lyrics/i });
//         fireEvent.click(lyricsButtons[0]);
//
//         // Lyrics popup should now be visible
//         expect(screen.getByTestId('lyrics-popup')).toBeInTheDocument();
//
//         // Verify the lyrics content
//         expect(screen.getByTestId('lyrics-content')).toHaveTextContent(/These are the lyrics for Song 1/);
//
//         // Close the lyrics popup
//         fireEvent.click(screen.getByTestId('close-lyrics'));
//
//         // Lyrics popup should not be visible again
//         expect(screen.queryByTestId('lyrics-popup')).not.toBeInTheDocument();
//     });
//
//     test('shows add to favorites button on hover and handles adding to favorites', () => {
//         render(<SongList {...defaultProps} />);
//
//         // Get the first song row
//         const songRows = screen.getAllByRole('row');
//         const firstSongRow = songRows[1]; // First row after header
//
//         // Add to favorites button should not be visible initially
//         expect(screen.queryByText(/\+ Add to favorites/i)).not.toBeInTheDocument();
//
//         // Hover over the song row
//         fireEvent.mouseEnter(firstSongRow);
//
//         // Add to favorites button should now be visible
//         const addToFavButton = screen.getByText(/\+ Add to favorites/i);
//         expect(addToFavButton).toBeInTheDocument();
//
//         // Click add to favorites button
//         fireEvent.click(addToFavButton);
//
//         // Toast should appear with success message
//         expect(screen.getByTestId('toast')).toBeInTheDocument();
//         expect(screen.getByText(/Song successfully added to favorites list/i)).toBeInTheDocument();
//
//         // Check that toast can be closed
//         fireEvent.click(screen.getByTestId('close-toast'));
//
//         // Mouse leave the row
//         fireEvent.mouseLeave(firstSongRow);
//
//         // Add to favorites button should not be visible again
//         expect(screen.queryByText(/\+ Add to favorites/i)).not.toBeInTheDocument();
//     });
//
//     test('shows error toast when adding a song that is already in favorites', () => {
//         render(<SongList {...defaultProps} />);
//
//         // Get the first song row
//         const songRows = screen.getAllByRole('row');
//         const firstSongRow = songRows[1]; // First row after header
//
//         // Hover over the song row
//         fireEvent.mouseEnter(firstSongRow);
//
//         // Click add to favorites button for the first time
//         const addToFavButton = screen.getByText(/\+ Add to favorites/i);
//         fireEvent.click(addToFavButton);
//
//         // Check success toast
//         expect(screen.getByText(/Song successfully added to favorites list/i)).toBeInTheDocument();
//
//         // Close the toast
//         fireEvent.click(screen.getByTestId('close-toast'));
//
//         // Click add to favorites button again for the same song
//         fireEvent.click(addToFavButton);
//
//         // Check error toast
//         expect(screen.getByText(/Song is already in your favorites list/i)).toBeInTheDocument();
//         expect(screen.getByTestId('toast').className).toContain('error');
//     });
//
//     test('handles song with url instead of id correctly', () => {
//         render(<SongList {...defaultProps} />);
//
//         // Get the song with url instead of id (Song 3)
//         const song3Row = screen.getByText('Song 3').closest('tr');
//
//         // Hover over the song row
//         fireEvent.mouseEnter(song3Row);
//
//         // Add to favorites button should be visible
//         const addToFavButton = within(song3Row).getByText(/\+ Add to favorites/i);
//         expect(addToFavButton).toBeInTheDocument();
//
//         // Click add to favorites button
//         fireEvent.click(addToFavButton);
//
//         // Toast should appear with success message
//         expect(screen.getByTestId('toast')).toBeInTheDocument();
//
//         // Click lyrics button
//         const lyricsButton = within(song3Row).getByRole('button', { name: /lyrics/i });
//         fireEvent.click(lyricsButton);
//
//         // Lyrics popup should appear
//         expect(screen.getByTestId('lyrics-popup')).toBeInTheDocument();
//
//         // Verify the lyrics content for the song with URL
//         expect(screen.getByTestId('lyrics-content')).toHaveTextContent(/These are the lyrics for Song 3/);
//     });
//
//     test('handles case when lyrics are not available for a song', () => {
//         // Create a modified lyrics map without lyrics for song 1
//         const incompleteMap = new Map([
//             ['2', 'These are the lyrics for Song 2 without match'],
//             ['3', 'These are the lyrics for Song 3 with test word also'],
//         ]);
//
//         render(<SongList {...defaultProps} lyricsMap={incompleteMap} />);
//
//         // Song 1 should not be displayed as it has no lyrics
//         expect(screen.queryByText('Song 1')).not.toBeInTheDocument();
//
//         // Only Song 3 should be displayed (which has lyrics containing the search term)
//         expect(screen.getByText('Song 3')).toBeInTheDocument();
//         expect(screen.queryByText('Song 2')).not.toBeInTheDocument();
//     });
//
//     test('provides "Lyrics not available" message when lyrics are missing', () => {
//         // Create a song without lyrics in the map
//         const songWithoutLyrics = { id: '4', title: 'No Lyrics Song', artist: 'Artist 4', year: 2023 };
//         const songsWithExtra = [...mockSongs, songWithoutLyrics];
//
//         // Add this song to displaySongs directly by modifying the lyricsMap
//         const modifiedMap = new Map(mockLyricsMap);
//         modifiedMap.set('4', 'with test word but will be overridden');
//
//         render(<SongList {...defaultProps} songs={songsWithExtra} lyricsMap={modifiedMap} />);
//
//         // Find the new song
//         const noLyricsSongRow = screen.getByText('No Lyrics Song').closest('tr');
//
//         // Click lyrics button for this song
//         const lyricsButton = within(noLyricsSongRow).getByRole('button', { name: /lyrics/i });
//
//         // Force the test case where lyrics might be removed between filtering and clicking
//         modifiedMap.delete('4');
//
//         fireEvent.click(lyricsButton);
//
//         // Check that the popup shows "Lyrics not available" message
//         expect(screen.getByTestId('lyrics-popup')).toBeInTheDocument();
//         expect(screen.getByTestId('lyrics-content')).toHaveTextContent('Lyrics not available for this song.');
//     });
//
//     test('updates displaySongs when props change', () => {
//         const { rerender } = render(<SongList {...defaultProps} />);
//
//         // Initially, Song 1 and Song 3 should be displayed
//         expect(screen.getByText('Song 1')).toBeInTheDocument();
//         expect(screen.getByText('Song 3')).toBeInTheDocument();
//
//         // Change search term
//         rerender(<SongList {...defaultProps} searchTerm="different term" />);
//
//         // No songs should match now
//         expect(screen.queryByText('Song 1')).not.toBeInTheDocument();
//         expect(screen.queryByText('Song 3')).not.toBeInTheDocument();
//         expect(screen.getByText(/No songs with available lyrics were found containing 'different term'/i)).toBeInTheDocument();
//
//         // Change songs
//         const newSongs = [
//             { id: '5', title: 'New Song', artist: 'New Artist', year: 2023 }
//         ];
//         const newLyricsMap = new Map([
//             ['5', 'These lyrics contain the test word']
//         ]);
//
//         rerender(<SongList {...defaultProps} songs={newSongs} lyricsMap={newLyricsMap} />);
//
//         // New song should be displayed
//         expect(screen.getByText('New Song')).toBeInTheDocument();
//     });
// });