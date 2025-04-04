import GeniusService from './GeniusService';

global.fetch = jest.fn();
global.console.error = jest.fn();

const BACKEND_URL = "http://localhost:8080/api/genius";

describe('GeniusService', () => {
    beforeEach(() => {
        fetch.mockClear();
        console.error.mockClear();
    });


    it('searchArtist should fetch artists successfully', async () => {
        const mockArtists = [{ artist_id: 1, artist_name: 'Artist One' }];
        const query = 'Test Artist';

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockArtists,
        });

        const artists = await GeniusService.searchArtist(query);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`
        );
        expect(artists).toEqual(mockArtists);
        expect(console.error).not.toHaveBeenCalled();
    });

    it('searchArtist should return empty array on backend API error', async () => {
        const query = 'Test Artist';
        fetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found',
        });

        const artists = await GeniusService.searchArtist(query);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`
        );
        expect(artists).toEqual([]);
        expect(console.error).toHaveBeenCalledWith(
            "Error searching for artists:",
            "Backend API returned an error: Not Found"
        );
    });

    it('searchArtist should return empty array on network error', async () => {
        const query = 'Test Artist';
        const networkError = new Error('Network failure');
        fetch.mockRejectedValueOnce(networkError);

        const artists = await GeniusService.searchArtist(query);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`
        );
        expect(artists).toEqual([]);
        expect(console.error).toHaveBeenCalledWith(
            "Error searching for artists:",
            networkError.message
        );
    });


    it('getTopSongs should fetch songs successfully', async () => {
        const mockSongs = [{ id: 101, title: 'Song One' }];
        const artistId = 1;

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSongs,
        });

        const songs = await GeniusService.getTopSongs(artistId);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/artists/${artistId}/songs`
        );
        expect(songs).toEqual(mockSongs);
        expect(console.error).not.toHaveBeenCalled();
    });

    it('getTopSongs should return empty array on backend API error', async () => {
        const artistId = 1;
        fetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Server Error',
        });

        const songs = await GeniusService.getTopSongs(artistId);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/artists/${artistId}/songs`
        );
        expect(songs).toEqual([]);
        expect(console.error).toHaveBeenCalledWith(
            "Error fetching top songs:",
            "Backend API returned an error: Server Error"
        );
    });

    it('getTopSongs should return empty array on network error', async () => {
        const artistId = 1;
        const networkError = new Error('Fetch failed');
        fetch.mockRejectedValueOnce(networkError);

        const songs = await GeniusService.getTopSongs(artistId);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${BACKEND_URL}/artists/${artistId}/songs`
        );
        expect(songs).toEqual([]);
        expect(console.error).toHaveBeenCalledWith(
            "Error fetching top songs:",
            networkError.message
        );
    });
});