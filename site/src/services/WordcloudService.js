import WordCloud from "wordcloud";

/*
example usage
        const words = [
            { text: "Gustavo", size: 40 },
            { text: "Paul", size: 50 },
            { text: "White", size: 30 },
            { text: "BOMBOGYATT", size: 25 },
            { text: "YOOOO", size: 35 },
        ];

        WordcloudService.generate(words, {
            selector: "#wordcloud",
            width: 600,
            height: 400,
        });
 */
const WordcloudService = {
    generate(words, options = {}) {
        const {
            selector = "#canvas",
            width = 600,
            height = 400,
            ...customOptions
        } = options;

        const canvas = document.querySelector(selector);
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const list = words.map(w => [w.text, w.size]);

        WordCloud(canvas, {
            list,
            gridSize: 8,
            weightFactor: 2,
            fontFamily: "Arial",
            color: "random-dark",
            rotateRatio: 0,
            rotationStep: 1,
            backgroundColor: null,
            ...customOptions
        });
    }
};

export default WordcloudService;