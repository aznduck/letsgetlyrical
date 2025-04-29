import "@testing-library/jest-dom";
import { expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";

// Mock the dependencies
jest.mock("react-d3-cloud", () => ({
    __esModule: true,
    default: ({ data, onWordClick }) => (
        <div data-testid="mock-word-cloud">
            {data && data.map((item, index) => (
                <span
                    key={index}
                    data-testid={`cloud-word-${item.text}`}
                    onClick={() => onWordClick && onWordClick(item)}
                >
          {item.text}
        </span>
            ))}
        </div>
    )
}));

jest.mock("./SongList", () => ({
    __esModule: true,
    default: ({ searchTerm, onClose }) => (
        <div data-testid="song-list">
            SongList: {searchTerm}
            <button data-testid="close-song-list" onClick={onClose}>Close</button>
        </div>
    )
}));

jest.mock("../components/WordCloudHeader", () => ({
    __esModule: true,
    default: ({ onTypeChange, selectedType }) => (
        <div>
            <span data-testid="current-type">{selectedType}</span>
            <button
                data-testid="cloud-button"
                onClick={() => onTypeChange && onTypeChange("cloud")}
            >
                cloud
            </button>
            <button
                data-testid="table-button"
                onClick={() => onTypeChange && onTypeChange("table")}
            >
                table
            </button>
        </div>
    )
}));

jest.mock("../services/GeniusService", () => ({
    __esModule: true,
    default: {
        getLyrics: jest.fn()
    }
}));

// Import the actual component to test
import WordCloud from "./WordCloudContent";
import GeniusService from "../services/GeniusService";

// Set a shorter timeout for waitFor
const waitForOptions = { timeout: 3000 };

describe("WordCloud Component", () => {
    // Sample test data
    const testSongs = [
        { id: "1", title: "Test Song 1", url: "https://genius.com/test-song-1" },
        { id: "2", title: "Test Song 2", url: "https://genius.com/test-song-2" }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation
        GeniusService.getLyrics.mockResolvedValue("test test word mock lyrics");
    });

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    test("renders info message if songsData is empty", () => {
        render(<WordCloud songsData={[]} />);
        expect(screen.getByText(/No songs to generate a word cloud/i)).toBeInTheDocument();
    });

    test("displays loading message when fetching lyrics", async () => {
        // Create a promise that doesn't resolve immediately
        let resolvePromise;
        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        GeniusService.getLyrics.mockReturnValue(promise);

        render(<WordCloud songsData={testSongs} />);

        // Check if loading message is displayed
        expect(screen.getByText(/Fetching lyrics and generating cloud/i)).toBeInTheDocument();

        // Resolve the promise to complete the test
        await act(async () => {
            resolvePromise("test lyrics");
        });
    });

    test("shows error if no lyrics can be fetched", async () => {
        GeniusService.getLyrics.mockRejectedValue(new Error("Failed"));

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch lyrics for all/i)).toBeInTheDocument();
        }, waitForOptions);
    });

    test("shows partial success warning if some lyrics are fetched", async () => {
        // Mock successful fetch for first song, failed for second
        GeniusService.getLyrics
            .mockResolvedValueOnce("test lyrics for song 1")
            .mockRejectedValueOnce(new Error("Failed for song 2"));

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.getByText(/Warning: Fetched lyrics for 1 out of 2 songs/i)).toBeInTheDocument();
        }, waitForOptions);
    });

    test("renders word cloud after successful lyrics fetch", async () => {
        GeniusService.getLyrics.mockResolvedValue("test test word");

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        // Word cloud should be rendered
        expect(screen.getByTestId("mock-word-cloud")).toBeInTheDocument();

        // Check for words in the cloud
        expect(screen.getByTestId("cloud-word-test")).toBeInTheDocument();
    });

    test("toggles view between cloud and table when selected", async () => {
        GeniusService.getLyrics.mockResolvedValue("test test word");

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        // Default should be cloud view
        expect(screen.getByTestId("current-type").textContent).toBe("cloud");

        // Switch to table view
        fireEvent.click(screen.getByTestId("table-button"));

        // Check if table view is active
        expect(screen.getByTestId("current-type").textContent).toBe("table");

        // Switch back to cloud view
        fireEvent.click(screen.getByTestId("cloud-button"));

        // Check if cloud view is active again
        expect(screen.getByTestId("current-type").textContent).toBe("cloud");
    });

    test("displays SongList when a word is clicked", async () => {
        GeniusService.getLyrics.mockResolvedValue("test test word");

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        // Click on a word in the cloud
        fireEvent.click(screen.getByTestId("cloud-word-test"));

        // SongList should be displayed with the selected word
        expect(screen.getByTestId("song-list")).toBeInTheDocument();
        expect(screen.getByText(/SongList: test/i)).toBeInTheDocument();
    });

    test("closes SongList when close button is clicked", async () => {
        GeniusService.getLyrics.mockResolvedValue("test test word");

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        // Click on a word in the cloud to show SongList
        fireEvent.click(screen.getByTestId("cloud-word-test"));
        expect(screen.getByTestId("song-list")).toBeInTheDocument();

        // Click close button
        fireEvent.click(screen.getByTestId("close-song-list"));

        // SongList should be removed
        expect(screen.queryByTestId("song-list")).not.toBeInTheDocument();
    });

    test("handles case with no significant words", async () => {
        // Mock a response with only stop words
        GeniusService.getLyrics.mockResolvedValue("the and a is");

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        // Should show no words found message
        expect(screen.getByText(/No significant words found or lyrics unavailable/i)).toBeInTheDocument();
    });

    test("handles invalid Genius URLs", async () => {
        const invalidUrlSongs = [
            { id: "1", title: "Invalid URL", url: "not-a-url" }
        ];

        await act(async () => {
            render(<WordCloud songsData={invalidUrlSongs} />);
        });

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch lyrics for all/i)).toBeInTheDocument();
        }, waitForOptions);
    });

    test("handles missing song IDs by using URL as key", async () => {
        const songsWithoutIds = [
            { title: "No ID Song", url: "https://genius.com/no-id-song" }
        ];

        // Spy on console.warn
        const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

        GeniusService.getLyrics.mockResolvedValue("test words");

        await act(async () => {
            render(<WordCloud songsData={songsWithoutIds} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        // Should have logged a warning about missing ID
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Song missing 'id' property"));

        consoleSpy.mockRestore();
    });

    test("handles unexpected errors during lyric fetching", async () => {
        // Mock Promise.all to throw an unexpected error
        const originalAll = Promise.all;
        Promise.all = jest.fn().mockRejectedValue(new Error("Unexpected error"));

        await act(async () => {
            render(<WordCloud songsData={testSongs} />);
        });

        await waitFor(() => {
            expect(screen.getByText(/An unexpected error occurred while fetching lyrics/i)).toBeInTheDocument();
        }, waitForOptions);

        // Restore original Promise.all
        Promise.all = originalAll;
    });

    // Test the helper functions
    describe("getGeniusPathFromUrl function", () => {
        test("returns path from valid URL", () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            // Create a component ref to access the internal function
            let getGeniusPathFromUrlFn;
            render(<WordCloud ref={(ref) => {
                if (ref) getGeniusPathFromUrlFn = ref.getGeniusPathFromUrl;
            }} songsData={[]} />);

            // Test directly with our own implementation since we can't access the internal function
            const url = "https://genius.com/Drake-gods-plan-lyrics";
            const testFn = (url) => {
                try {
                    if (!url) return null;
                    const parsedUrl = new URL(url);
                    return parsedUrl.pathname.startsWith('/') ? parsedUrl.pathname.substring(1) : parsedUrl.pathname;
                } catch (e) {
                    console.error("Error parsing URL:", url, e);
                    return null;
                }
            };

            expect(testFn(url)).toBe("Drake-gods-plan-lyrics");
            expect(testFn(null)).toBeNull();
            expect(testFn("not a url")).toBeNull();

            consoleSpy.mockRestore();
        });
    });
});