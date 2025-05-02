import React from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import WordCloudContent from "./WordCloudContent";

jest.mock("porter-stemmer", () => ({
    stemmer: (w) => w,
}));

const mockGetLyrics = jest.fn();
jest.mock("../services/GeniusService", () => ({
    __esModule: true,
    default: { getLyrics: (...args) => mockGetLyrics(...args) },
}));

jest.mock("../components/WordCloudHeader", () => (props) => {
    const { selectedType, onTypeChange } = props;
    return (
        <div data-testid="header">
            <button
                data-testid="btn-cloud"
                disabled={selectedType === "cloud"}
                onClick={() => onTypeChange("cloud")}
            >
                cloud
            </button>
            <button
                data-testid="btn-table"
                disabled={selectedType === "table"}
                onClick={() => onTypeChange("table")}
            >
                table
            </button>
        </div>
    );
});

/* Minimal SongList that exposes onClose and displays its props. */
jest.mock("./SongList", () => ({ searchTerm, onClose }) => (
    <div data-testid="song-list">
        <span data-testid="search-term">{searchTerm}</span>
        <button data-testid="close-song-list" onClick={onClose}>
            ×
        </button>
    </div>
));

/* Deterministic d3-cloud stand-in – each word renders a <span>. */
jest.mock("react-d3-cloud", () => {
    return ({ data, onWordClick }) => (
        <div data-testid="mock-cloud">
            {data.map((d, i) => (
                <span
                    key={i}
                    data-testid={`word-${d.text}`}
                    onClick={() => onWordClick({}, d)}
                >
          {d.text}
        </span>
            ))}
        </div>
    );
});

const flushPromises = () => act(() => Promise.resolve());

const buildSongs = (n) =>
    Array.from({ length: n }, (_, i) => ({
        id: i + 1,
        title: `Song${i + 1}`,
        url: `https://genius.com/Artist-song${i + 1}-lyrics`,
    }));

describe("WordCloudContent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("shows prompt when no songs selected", () => {
        render(<WordCloudContent songsData={[]} />);
        expect(
            screen.getByText(/select songs to generate a word cloud/i)
        ).toBeInTheDocument();
    });

    test("displays loading spinner then renders cloud view on success", async () => {
        const songs = buildSongs(2);
        mockGetLyrics.mockResolvedValueOnce(
            "hello world hello friend" /* Song1 */
        );
        mockGetLyrics.mockResolvedValueOnce(
            "hello world" /* Song2 */
        );

        render(<WordCloudContent songsData={songs} />);

        // initial spinner
        expect(screen.getByText(/fetching lyrics/i)).toBeInTheDocument();

        await flushPromises(); // settle `Promise.all`
        await waitFor(() =>
            expect(screen.queryByText(/fetching lyrics/i)).not.toBeInTheDocument()
        );

        // cloud rendered with highest-frequency words
        expect(screen.getByTestId("mock-cloud")).toBeInTheDocument();
        expect(screen.getByTestId("word-world")).toBeInTheDocument();
    });

    test("partial fetch failure surfaces warning banner", async () => {
        const songs = buildSongs(2);
        mockGetLyrics
            .mockResolvedValueOnce("foo bar baz") // success
            .mockRejectedValueOnce(new Error("Boom")); // failure

        render(<WordCloudContent songsData={songs} />);

        await flushPromises();

        // Banner contains fraction fetched
        expect(
            screen.getByText(/fetched lyrics for 1\/2 songs\./i)
        ).toBeInTheDocument();
    });

    test("header toggles between cloud and table views", async () => {
        const songs = buildSongs(1);
        mockGetLyrics.mockResolvedValueOnce("alpha beta beta gamma");

        render(<WordCloudContent songsData={songs} />);

        await flushPromises();

        // default = cloud
        expect(screen.getByTestId("mock-cloud")).toBeInTheDocument();

        // switch to table
        fireEvent.click(screen.getByTestId("btn-table"));
        expect(screen.getByText(/alpha – 1/i)).toBeInTheDocument();

        // switch back to cloud
        fireEvent.click(screen.getByTestId("btn-cloud"));
        expect(screen.getByTestId("mock-cloud")).toBeInTheDocument();
    });

    test("clicking a word opens SongList and close button hides it", async () => {
        const songs = buildSongs(1);
        mockGetLyrics.mockResolvedValueOnce(
            "goodbye world goodbye world friend"
        );

        render(<WordCloudContent songsData={songs} />);
        await flushPromises();

        // click high-frequency word
        fireEvent.click(screen.getByTestId("word-world"));

        await waitFor(() =>
            expect(screen.getByTestId("song-list")).toBeInTheDocument()
        );
        expect(screen.getByTestId("search-term")).toHaveTextContent("world");

        // close it
        fireEvent.click(screen.getByTestId("close-song-list"));
        await waitFor(() =>
            expect(screen.queryByTestId("song-list")).not.toBeInTheDocument()
        );
    });

    test("table row click (alternative path) opens SongList", async () => {
        const songs = buildSongs(1);
        mockGetLyrics.mockResolvedValueOnce("apple banana banana cherry");

        render(<WordCloudContent songsData={songs} />);
        await flushPromises();

        fireEvent.click(screen.getByTestId("btn-table"));

        // click the row for “banana”
        fireEvent.click(screen.getByText(/banana – 2/i));

        expect(screen.getByTestId("song-list")).toBeInTheDocument();
        expect(screen.getByTestId("search-term")).toHaveTextContent("banana");
    });
});
