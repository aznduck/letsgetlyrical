require('dotenv').config();
console.log(process.env.CLIENT_ACCESS_TOKEN);
const CLIENT_ACCESS_TOKEN = process.env.CLIENT_ACCESS_TOKEN;
const BASE_URL = "https://api.genius.com";

const SearchService = {
    search: async (query) => {
        try {
            const response = await fetch(
                `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${CLIENT_ACCESS_TOKEN}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Genius API returned an error: ${response.statusText}`);
            }

            const data = await response.json();
            const hits = data?.response?.hits || [];

            return hits.map((hit) => {
                const result = hit.result;
                return {
                    id: result.id,
                    fullTitle: result.full_title,
                    title: result.title,
                    artist: result.primary_artist?.name,
                    url: result.url,
                };
            });
        } catch (error) {
            console.error("Error searching for songs:", error.message);
            return [];
        }
    },
};

module.exports = SearchService;
