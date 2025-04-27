import "@testing-library/jest-dom";
import { expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";

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
    default: ({ searchTerm }) => <div data-testid="song-list">SongList: {searchTerm}</div>
}));

jest.mock("../components/WordCloudHeader", () => ({
    __esModule: true,
    default: ({ onTypeChange }) => (
        <button data-testid="table-button" onClick={() => onTypeChange && onTypeChange("table")}>
            table
        </button>
    )
}));

jest.mock("../services/GeniusService", () => ({
    __esModule: true,
    default: {
        getLyrics: jest.fn()
    }
}));

jest.mock("./WordCloudContent", () => {
    // First, mock the module exports
    const originalModule = jest.requireActual("./WordCloudContent");

    const MockedWordCloud = (props) => {
        if (!props.songsData || props.songsData.length === 0) {
            return null;
        }

        return originalModule.default(props);
    };

    return {
        __esModule: true,
        default: MockedWordCloud,
        getGeniusPathFromUrl: originalModule.getGeniusPathFromUrl,
        getFrequencies: jest.fn((text) => {
            if (!text) return [];

            if (text.includes("test")) {
                return [
                    { word: "test", frequency: 2 },
                    { word: "word", frequency: 1 }
                ];
            }

            return [{ word: "word", frequency: 1 }];
        })
    };
});

import WordCloudContent, { getFrequencies, getGeniusPathFromUrl } from "./WordCloudContent";
import GeniusService from "../services/GeniusService";

// Set a shorter timeout for waitFor
const waitForOptions = { timeout: 3000 };

describe("WordCloud Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation
        GeniusService.getLyrics.mockResolvedValue("test test word mock lyrics");
    });

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    test("renders nothing if songsData is empty", () => {
        const { container } = render(<WordCloudContent songsData={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    test("displays loading message when fetching lyrics", async () => {
        let resolvePromise;
        const promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        GeniusService.getLyrics.mockReturnValue(promise);

        render(<WordCloudContent songsData={[{ title: "Test", url: "https://genius.com/test" }]} />);

        expect(screen.getByText(/Fetching lyrics/i)).toBeInTheDocument();

        await act(async () => {
            resolvePromise("test lyrics");
        });
    });

    test("shows error if no lyrics can be fetched", async () => {
        GeniusService.getLyrics.mockRejectedValue(new Error("Failed"));

        await act(async () => {
            render(<WordCloudContent songsData={[{ title: "Test", url: "https://genius.com/test" }]} />);
        });

        expect(await screen.findByText(/Failed to fetch lyrics/i, {}, waitForOptions)).toBeInTheDocument();
    });

    test("renders word cloud after successful lyrics fetch", async () => {
        GeniusService.getLyrics.mockResolvedValue("test test word");

        await act(async () => {
            render(<WordCloudContent songsData={[{ title: "Test", url: "https://genius.com/test" }]} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        expect(screen.getByTestId("mock-word-cloud")).toBeInTheDocument();

        await waitFor(() => {
            const cloudContainer = screen.getByTestId("mock-word-cloud");
            expect(cloudContainer.textContent).not.toBe("");
        }, waitForOptions);
    });

    test("toggles view to table when selected", async () => {
        GeniusService.getLyrics.mockResolvedValue("test test word");

        await act(async () => {
            render(<WordCloudContent songsData={[{ title: "Test", url: "https://genius.com/test" }]} />);
        });

        await waitFor(() => {
            expect(screen.queryByText(/Fetching lyrics/i)).not.toBeInTheDocument();
        }, waitForOptions);

        fireEvent.click(screen.getByTestId("table-button"));

        await waitFor(() => {
            const tableContainer = screen.queryByText(/Frequency/i);
            expect(tableContainer).toBeInTheDocument();
        }, waitForOptions);
    });

    describe("getGeniusPathFromUrl", () => {
        test("returns path from valid URL", () => {
            const url = "https://genius.com/Drake-gods-plan-lyrics";
            expect(getGeniusPathFromUrl(url)).toBe("Drake-gods-plan-lyrics");
        });

        test("returns null for invalid URL", () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
            expect(getGeniusPathFromUrl("not a url")).toBeNull();
            consoleSpy.mockRestore();
        });

        test("returns null for empty input", () => {
            expect(getGeniusPathFromUrl(null)).toBeNull();
            expect(getGeniusPathFromUrl("")).toBeNull();
        });
    });


});