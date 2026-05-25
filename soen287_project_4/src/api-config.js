// API Configuration - Switch between Cloudflare and Local
const API_CONFIG = {
    // Set to 'local' for XAMPP or 'cloudflare' for Cloudflare Workers
    mode: 'local',

    endpoints: {
        local: 'http://localhost/soen287_project_2/src/server.php',
        cloudflare: 'https://your-worker.your-subdomain.workers.dev'
    }
};

// Get the active API base URL
export const API_BASE_URL = API_CONFIG.endpoints[API_CONFIG.mode];

// Helper function to make API calls
export async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    return response.json();
}

