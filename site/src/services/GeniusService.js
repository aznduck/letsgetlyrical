const BACKEND_URL = "http://localhost:8080/api/genius";

const GeniusService = {
    searchArtist: async (query) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error(`Backend API returned an error: ${response.statusText}`);
            }

            const artists = await response.json();
            return artists;
        } catch (error) {
            console.error("Error searching for artists:", error.message);
            return [];
        }
    },

    getTopSongs: async (artistId) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/artists/${artistId}/songs`
            );

            if (!response.ok) {
                throw new Error(`Backend API returned an error: ${response.statusText}`);
            }

            const songs = await response.json();
            return songs;
        } catch (err) {
            console.error("Error fetching top songs:", err.message);
            return [];
        }
    }
};

export default GeniusService;