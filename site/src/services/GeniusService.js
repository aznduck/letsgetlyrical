// src/services/GeniusService.js
const BACKEND_URL = "http://localhost:8080/api/genius";

const GeniusService = {
    searchArtist: async (query) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Backend API error response:", errorBody);
                throw new Error(`Backend API returned an error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const artists = await response.json();
                return artists;
            } else {
                const textResponse = await response.text();
                console.error("Received non-JSON response from searchArtist:", textResponse);
                throw new Error("Received non-JSON response from backend");
            }

        } catch (error) {
            console.error("Error searching for artists:", error.message);
            return [];
        }
    },

    getTopSongs: async (artistId, numSongs = 10) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/artists/${artistId}/songs?per_page=${numSongs}`
            );

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Backend API error response:", errorBody);
                throw new Error(`Backend API returned an error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const songs = await response.json();
                return songs;
            } else {
                const textResponse = await response.text();
                console.error("Received non-JSON response from getTopSongs:", textResponse);
                throw new Error("Received non-JSON response from backend");
            }

        } catch (err) {
            console.error("Error fetching top songs:", err.message);
            return [];
        }
    }
};

export default GeniusService;
