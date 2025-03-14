const SearchService = require('./SearchService');

(async () => {
    const query = "Kanye West";
    console.log(`Searching for: "${query}"...`);

    const songs = await SearchService.search(query);

    console.log(`\nResults for "${query}":`);
    console.log(songs);
})();