const BACKEND_URL = "http://localhost:8080/api/favorite";

const FavoriteService = {
    fetchFavorites: async(username) => {
        try {
            const yourData = {
                username: username,
                password: ""
            }

            const response = await fetch("/api/favorite/get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(yourData)
            });

            return response;
        }
        catch(error) {
            console.error(error);
        }
    },

    addToFavorites: async(data) => {
        try {
            const response = await fetch("/api/favorite/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            return response;
        }
        catch(error) {
            console.error(error);
        }
    },

    removeFavorites: async(data) => {
        try {
            const response = await fetch("api/favorite/remove", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            return response;
        }
        catch(error) {
            console.error(error);
        }
    },


}

export default FavoriteService;