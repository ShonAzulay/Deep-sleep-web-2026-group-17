export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Wrapper around fetch to handle common API tasks
 * @param {string} endpoint - The API endpoint (e.g., '/api/users/login')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 */
export async function apiClient(endpoint, { body, ...customConfig } = {}) {
    const headers = {
        "Content-Type": "application/json",
    };

    const config = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Allow the caller to handle specific non-200 statuses if needed
        // by attaching the status to the error object if the response is not ok
        if (!response.ok) {
            const error = new Error(`API Error: ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            throw error;
        }

        return response.json();
    } catch (error) {
        // Re-throw to be handled by the service
        throw error;
    }
}
