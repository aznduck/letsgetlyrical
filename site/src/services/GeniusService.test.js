import GeniusService from './GeniusService';

global.fetch = jest.fn();

let consoleErrorSpy;

beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe('GeniusService', () => {
    const BACKEND_URL = "http://localhost:8080/api/genius";

    describe('searchArtist', () => {
        const searchQuery = 'Queen';
        const encodedQuery = encodeURIComponent(searchQuery);
        const expectedUrl = `${BACKEND_URL}/search?q=${encodedQuery}`;
        const mockArtists = [{ id: 1, name: 'Queen' }, { id: 2, name: 'Queen Latifah' }];

        it('should fetch artists successfully and return JSON data', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: jest.fn().mockResolvedValueOnce(mockArtists),
                text: jest.fn(),
            });

            const artists = await GeniusService.searchArtist(searchQuery);

            expect(artists).toEqual(mockArtists);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
            expect(console.error).not.toHaveBeenCalled();
        });

        it('should return an empty array and log error if response is not ok', async () => {
            const errorStatus = 404;
            const errorStatusText = 'Not Found';
            const errorBody = 'Artist not found';
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: errorStatus,
                statusText: errorStatusText,
                headers: new Headers({ 'Content-Type': 'text/plain' }),
                json: jest.fn(),
                text: jest.fn().mockResolvedValueOnce(errorBody),
            });

            const artists = await GeniusService.searchArtist(searchQuery);

            expect(artists).toEqual([]);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
            expect(console.error).toHaveBeenCalledTimes(2); // Once for the API error, once for the catch block
            expect(console.error).toHaveBeenCalledWith("Backend API error response:", errorBody);
            expect(console.error).toHaveBeenCalledWith(
                "Error searching for artists:",
                `Backend API returned an error: ${errorStatus} ${errorStatusText}`
            );
        });

        it('should return an empty array and log error if response is not JSON', async () => {
            const nonJsonBody = '<!DOCTYPE html><html></html>';
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers({ 'Content-Type': 'text/html' }),
                json: jest.fn(), // This won't be called
                text: jest.fn().mockResolvedValueOnce(nonJsonBody),
            });

            const artists = await GeniusService.searchArtist(searchQuery);

            expect(artists).toEqual([]);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
            expect(console.error).toHaveBeenCalledTimes(2); // Once for non-JSON, once for the catch
            expect(console.error).toHaveBeenCalledWith("Received non-JSON response from searchArtist:", nonJsonBody);
            expect(console.error).toHaveBeenCalledWith(
                "Error searching for artists:",
                "Received non-JSON response from backend"
            );
        });

        it('should return an empty array and log error if fetch throws an error', async () => {
            const networkError = new Error('Network failed');
            global.fetch.mockRejectedValueOnce(networkError);

            const artists = await GeniusService.searchArtist(searchQuery);

            expect(artists).toEqual([]);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith("Error searching for artists:", networkError.message);
        });
    });

    describe('getTopSongs', () => {
        const artistId = 1678;
        const defaultNumSongs = 10;
        const customNumSongs = 5;
        const expectedUrlDefault = `${BACKEND_URL}/artists/${artistId}/songs?per_page=${defaultNumSongs}`;
        const expectedUrlCustom = `${BACKEND_URL}/artists/${artistId}/songs?per_page=${customNumSongs}`;
        const mockSongs = [
            { id: 1, title: 'Bohemian Rhapsody' },
            { id: 2, title: 'Don\'t Stop Me Now' },
        ];

        it('should fetch top songs successfully using default number of songs', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: jest.fn().mockResolvedValueOnce(mockSongs),
                text: jest.fn(),
            });

            const songs = await GeniusService.getTopSongs(artistId);

            expect(songs).toEqual(mockSongs);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(console.error).not.toHaveBeenCalled();
        });

        it('should fetch top songs successfully using specified number of songs', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: jest.fn().mockResolvedValueOnce(mockSongs.slice(0, customNumSongs)),
                text: jest.fn(),
            });

            const songs = await GeniusService.getTopSongs(artistId, customNumSongs);

            expect(songs).toEqual(mockSongs.slice(0, customNumSongs));
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrlCustom);
            expect(console.error).not.toHaveBeenCalled();
        });

        it('should return an empty array and log error if response is not ok', async () => {
            const errorStatus = 500;
            const errorStatusText = 'Internal Server Error';
            const errorBody = 'Server exploded';
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: errorStatus,
                statusText: errorStatusText,
                headers: new Headers({ 'Content-Type': 'text/plain' }),
                json: jest.fn(),
                text: jest.fn().mockResolvedValueOnce(errorBody),
            });

            const songs = await GeniusService.getTopSongs(artistId);

            expect(songs).toEqual([]);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(console.error).toHaveBeenCalledTimes(2); // API error + catch block
            expect(console.error).toHaveBeenCalledWith("Backend API error response:", errorBody);
            expect(console.error).toHaveBeenCalledWith(
                "Error fetching top songs:",
                `Backend API returned an error: ${errorStatus} ${errorStatusText}`
            );
        });

        it('should return an empty array and log error if response is not JSON', async () => {
            const nonJsonBody = 'Error page content';
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers({ 'Content-Type': 'text/plain' }),
                json: jest.fn(),
                text: jest.fn().mockResolvedValueOnce(nonJsonBody),
            });

            const songs = await GeniusService.getTopSongs(artistId);

            expect(songs).toEqual([]);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(console.error).toHaveBeenCalledTimes(2); // non-JSON error + catch block
            expect(console.error).toHaveBeenCalledWith("Received non-JSON response from getTopSongs:", nonJsonBody);
            expect(console.error).toHaveBeenCalledWith(
                "Error fetching top songs:",
                "Received non-JSON response from backend"
            );
        });

        it('should return an empty array and log error if fetch throws an error', async () => {
            const networkError = new Error('Connection refused');
            global.fetch.mockRejectedValueOnce(networkError);

            const songs = await GeniusService.getTopSongs(artistId);

            expect(songs).toEqual([]);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith("Error fetching top songs:", networkError.message);
        });
    });
});