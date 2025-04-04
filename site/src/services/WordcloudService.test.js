jest.mock("wordcloud", () => {
    return jest.fn();
});

import WordcloudService from "./WordcloudService";
import WordCloud from "wordcloud"; // import the mocked function

describe("WordcloudService", () => {
    beforeEach(() => {
        document.body.innerHTML = '<canvas id="testCanvas"></canvas>';
        WordCloud.mockClear(); // reset the mock before each test
    });

    it("calls WordCloud with correct list format", () => {
        const words = [
            { text: "Ryan", size: 20 },
            { text: "Gosling", size: 80 }
        ];

        WordcloudService.generate(words, {
            selector: "#testCanvas"
        });

        const canvas = document.querySelector("#testCanvas");
        expect(canvas).toBeTruthy();
        expect(WordCloud).toHaveBeenCalledTimes(1);

        const [calledCanvas, calledOptions] = WordCloud.mock.calls[0];

        expect(calledCanvas).toBe(canvas);
        expect(calledOptions.list).toEqual([
            ["Ryan", 20],
            ["Gosling", 80]
        ]);
        expect(calledOptions.gridSize).toBe(8);
        expect(calledOptions.rotateRatio).toBe(0);
    });

    it("handles empty options", () => {
        const words = [
            { text: "Hello", size: 20 },
            { text: "World", size: 40 }
        ];

        WordcloudService.generate(words);

        const canvas = document.querySelector("#canvas");
        expect(canvas).toBeFalsy();
    });
});
