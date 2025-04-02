require('dotenv').config();
const SearchService = require('./SearchService');

describe("SearchService", () => {
    const CLIENT_ACCESS_TOKEN = process.env.CLIENT_ACCESS_TOKEN;

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should return parsed search results when API call is successful", async () => {
        const mockApiResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue({
                response: {
                    hits: [
                        {
                            result: {
                                id: 123,
                                full_title: "Song Title by Artist",
                                title: "Song Title",
                                primary_artist: { name: "Artist" },
                                url: "http://example.com/song"
                            }
                        },
                        {
                            result: {
                                id: 456,
                                full_title: "Another Song Title by Another Artist",
                                title: "Another Song Title",
                                primary_artist: { name: "Another Artist" },
                                url: "http://example.com/another-song"
                            }
                        }
                    ]
                }
            }),
        };

        global.fetch.mockResolvedValue(mockApiResponse);

        const query = "test query";
        const results = await SearchService.search(query);

        expect(global.fetch).toHaveBeenCalledWith(
            `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${CLIENT_ACCESS_TOKEN}`,
                },
            }
        );

        expect(results).toEqual([
            {
                id: 123,
                fullTitle: "Song Title by Artist",
                title: "Song Title",
                artist: "Artist",
                url: "http://example.com/song"
            },
            {
                id: 456,
                fullTitle: "Another Song Title by Another Artist",
                title: "Another Song Title",
                artist: "Another Artist",
                url: "http://example.com/another-song"
            }
        ]);
    });

    it("should return an empty array when API returns a non-ok response", async () => {
        const mockErrorResponse = {
            ok: false,
            statusText: "Bad Request",
        };

        global.fetch.mockResolvedValue(mockErrorResponse);

        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());

        const results = await SearchService.search("test query");

        expect(results).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error searching for songs:",
            "Genius API returned an error: Bad Request"
        );

        consoleErrorSpy.mockRestore();
    });

    it("should return an empty array when fetch throws an error", async () => {
        global.fetch.mockRejectedValue(new Error("Network error"));

        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const results = await SearchService.search("test query");

        expect(results).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error searching for songs:", "Network error");

        consoleErrorSpy.mockRestore();
    });
});
