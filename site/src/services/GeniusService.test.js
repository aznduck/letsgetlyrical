import GeniusService from './GeniusService';

global.fetch = jest.fn();
let consoleErrorSpy;

beforeEach(() => {
    fetch.mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

const BACKEND_URL = "http://localhost:8080/api/genius";

describe('GeniusService', () => {
    describe('searchArtist', () => {
        const query = "Test Artist";
        const encodedQuery = encodeURIComponent(query);
        const expectedUrl = `${BACKEND_URL}/search?q=${encodedQuery}`;
        const mockArtists = [{ id: 1, name: "Test Artist" }];

        it('should fetch artists successfully with valid JSON response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: async () => mockArtists,
                text: async () => JSON.stringify(mockArtists),
            });

            const artists = await GeniusService.searchArtist(query);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(artists).toEqual(mockArtists);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should return empty array on backend API error (!response.ok)', async () => {
            const errorText = "Internal Server Error";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: "Server Error",
                headers: new Headers(),
                text: async () => errorText,
            });

            const artists = await GeniusService.searchArtist(query);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(artists).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Backend API error response:", errorText);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error searching for artists:", "Backend API returned an error: 500 Server Error");
        });

        it('should return empty array when response is ok but not JSON', async () => {
            const nonJsonText = "<!DOCTYPE html><html><body>Error page</body></html>";
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'text/html' }),
                json: async () => { throw new Error("Should not call json()")},
                text: async () => nonJsonText,
            });

            const artists = await GeniusService.searchArtist(query);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(artists).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Received non-JSON response from searchArtist:", nonJsonText);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error searching for artists:", "Received non-JSON response from backend");
        });

        it('should return empty array on fetch network error', async () => {
            const networkError = new Error("Network failed");
            fetch.mockRejectedValueOnce(networkError);

            const artists = await GeniusService.searchArtist(query);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(artists).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error searching for artists:", networkError.message);
        });
    });

    describe('getTopSongs', () => {
        const artistId = 123;
        const defaultNumSongs = 10;
        const customNumSongs = 5;
        const expectedUrlDefault = `${BACKEND_URL}/artists/${artistId}/songs?per_page=${defaultNumSongs}&sort=popularity`;
        const expectedUrlCustom = `${BACKEND_URL}/artists/${artistId}/songs?per_page=${customNumSongs}&sort=popularity`;
        const mockSongs = [{ id: 1, title: "Song A" }, { id: 2, title: "Song B" }];

        it('should fetch top songs successfully with default number', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: async () => mockSongs,
                text: async () => JSON.stringify(mockSongs),
            });

            const songs = await GeniusService.getTopSongs(artistId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(songs).toEqual(mockSongs);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should fetch top songs successfully with specified number', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: async () => mockSongs.slice(0, customNumSongs),
                text: async () => JSON.stringify(mockSongs.slice(0, customNumSongs)),
            });

            const songs = await GeniusService.getTopSongs(artistId, customNumSongs);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrlCustom);
            expect(songs).toEqual(mockSongs.slice(0, customNumSongs));
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should return empty array on backend API error (!response.ok)', async () => {
            const errorText = "Artist not found";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
                headers: new Headers(),
                text: async () => errorText,
            });

            const songs = await GeniusService.getTopSongs(artistId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(songs).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Backend API error response:", errorText);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching top songs:", "Backend API returned an error: 404 Not Found");
        });

        it('should return empty array when response is ok but not JSON', async () => {
            const nonJsonText = "Unexpected response format";
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'text/plain' }),
                json: async () => { throw new Error("Should not call json()")},
                text: async () => nonJsonText,
            });

            const songs = await GeniusService.getTopSongs(artistId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(songs).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Received non-JSON response from getTopSongs:", nonJsonText);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching top songs:", "Received non-JSON response from backend");
        });

        it('should return empty array on fetch network error', async () => {
            const networkError = new Error("Failed to fetch");
            fetch.mockRejectedValueOnce(networkError);

            const songs = await GeniusService.getTopSongs(artistId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrlDefault);
            expect(songs).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching top songs:", networkError.message);
        });
    });

    describe('getSong', () => {
        const songId = 456;
        const expectedUrl = `${BACKEND_URL}/songs/${songId}`;
        const mockSong = { id: 456, title: "Specific Song", lyrics_state: "complete" };

        it('should fetch a specific song successfully with valid JSON', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: async () => mockSong,
                text: async () => JSON.stringify(mockSong),
            });

            const song = await GeniusService.getSong(songId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(song).toEqual(mockSong);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should return empty array on backend API error (!response.ok)', async () => {
            const errorText = "Song access forbidden";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: "Forbidden",
                headers: new Headers(),
                text: async () => errorText,
            });

            const song = await GeniusService.getSong(songId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(song).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Backend API error response:", errorText);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching song:", "Backend API returned an error: 403 Forbidden");
        });

        it('should return empty array when response is ok but not JSON', async () => {
            const nonJsonText = "Redirecting...";
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'text/html' }),
                json: async () => { throw new Error("Should not call json()")},
                text: async () => nonJsonText,
            });

            const song = await GeniusService.getSong(songId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(song).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Received non-JSON response from getSong:", nonJsonText);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching song:", "Received non-JSON resposne from backend");
        });

        it('should return empty array on fetch network error', async () => {
            const networkError = new Error("Connection refused");
            fetch.mockRejectedValueOnce(networkError);

            const song = await GeniusService.getSong(songId);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(song).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching song:", networkError.message);
        });
    });

    describe('getLyrics', () => {
        const pageURL = "https://genius.com/test-artist-song-lyrics";
        const expectedUrl = `${BACKEND_URL}/lyrics?url=${pageURL}`;
        const mockLyrics = "[Verse 1]\nLa la la...";

        it('should fetch lyrics successfully as text', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Type': 'text/plain' }),
                text: async () => mockLyrics,
            });

            const lyrics = await GeniusService.getLyrics(pageURL);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(lyrics).toEqual(mockLyrics);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should return undefined on backend API error (!response.ok)', async () => {
            const errorText = "Lyrics page not found";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: "Not Found",
                headers: new Headers(),
                text: async () => errorText,
            });

            const lyrics = await GeniusService.getLyrics(pageURL);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(lyrics).toBeUndefined();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching lyrics:", "Backend API error response: 404: Lyrics page not found");
        });

        it('should return undefined on fetch network error', async () => {
            const networkError = new Error("DNS resolution failed");
            fetch.mockRejectedValueOnce(networkError);

            const lyrics = await GeniusService.getLyrics(pageURL);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(expectedUrl);
            expect(lyrics).toBeUndefined();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching lyrics:", networkError.message);
        });
    });
});