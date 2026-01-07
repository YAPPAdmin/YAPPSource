import { json } from '@sveltejs/kit';
import { User } from "./auth/User";


export class API {

    static BaseUrl = "http://skaldak.home.simcic.at:5173/api"

    /**
     * Base function to make API requests.
     * @param {string} endpoint - The URL to make the request to.
     * @param {Object} options - The options for the fetch request.
     * @returns {Promise<Object>} - The response data from the API.
     */
    static async apiRequest(endpoint: string, options = {}) {
        const url = `${this.BaseUrl}${endpoint}`;
        const response = await fetch(url, options);

        if (!response.ok) {
            const error = new Error('An error occurred while fetching the data.');
            error.info = await response.json();
            error.status = response.status;
            throw error;
        }

        return response.json();
    }


    /**
     * Make a GET request to the specified URL.
     * @param {string} endpoint - The URL to make the GET request to.
     * @returns {Promise<Object>} - The response data from the API.
     */
    static async get(endpoint: string) {
        return this.apiRequest(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Make a POST request to the specified URL with the provided data.
     * @param {string} endpoint - The URL to make the POST request to.
     * @param {Object} data - The data to send in the POST request.
     * @returns {Promise<Object>} - The response data from the API.
     */
    static async post(endpoint: string, data) {
        return this.apiRequest(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }


    static async getAuthor(authorId: string): Promise<undefined|User> {
        if (!authorId) {
            console.error("[API/Client/getAuthor] Invalid authorID");
            return undefined;
        }

        try {
            const response = await API.get(`/getUser/getAuthor/?id=${encodeURIComponent(authorId)}`);

            if (!response.success) {
                console.error("Error searching for author");
                return undefined;
            }

            const author = response.author

            if (author) {
                return User.fromJSON(author);
            } else {
                console.error("No Author found");
                return undefined;
            }
        } catch (error) {
            console.error("An error occurred while fetching the author:", error);
            return undefined;
        }
}
}


