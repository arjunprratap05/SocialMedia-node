const axios = require('axios');
const https = require('https');

const ASPNET_API_URL = process.env.ASPNET_API_URL;

const axiosConfig = {};

if (process.env.NODE_ENV !== 'production') {
    axiosConfig.httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });
    console.warn('--- DEVELOPMENT MODE ACTIVE ---');
    console.warn('WARNING: SSL certificate validation is disabled (`rejectUnauthorized: false`).');
    console.warn('This is for local development with self-signed certificates. DO NOT USE IN PRODUCTION.');
    console.warn('-----------------------------');
} else {
    if (ASPNET_API_URL && !ASPNET_API_URL.startsWith('https://')) {
        console.error('CRITICAL ERROR: In production environment, ASPNET_API_URL should use HTTPS (e.g., https://...).');
    }
    console.log('--- PRODUCTION MODE ACTIVE ---');
    console.log('SSL certificate validation is ENABLED. Ensure your API has a valid HTTPS certificate.');
    console.log('----------------------------');
}

const axiosInstance = axios.create(axiosConfig);

async function getGitHubProfileFromAspNetCore(username) {
    if (!ASPNET_API_URL) {
        throw new Error('ASP.NET API URL is not configured. Please check server environment variables (ASPNET_API_URL).');
    }

    try {
        console.log(`Service: Calling ASP.NET API for user: ${username} at ${ASPNET_API_URL}`);

        const response = await axiosInstance.get(`${ASPNET_API_URL}/${username}`);
        console.log(`Service: Received response from ASP.NET API for ${username}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`Service: Error from ASP.NET API for ${username}: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
            throw new Error(error.response.data.message || `ASP.NET API error: ${error.response.status}`);
        } else if (error.request) {
            console.error(`Service: No response received from ASP.NET API for ${username}: ${error.request}`);
            if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
                throw new Error('SSL Certificate Error: ASP.NET Core API uses a self-signed certificate or an untrusted one. This error should typically only occur in development if not configured to ignore untrusted certificates. In production, ensure your API uses a valid, trusted SSL certificate.');
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('Connection Refused: The ASP.NET Core API might not be running, or its URL is incorrect/unreachable. Verify the API status and network connectivity.');
            } else if (error.code === 'ERR_INVALID_URL') {
                throw new Error('Invalid URL for ASP.NET API. Check ASPNET_API_URL in your environment variables (.env locally, or server config in PRD) and ensure it is a valid URL (e.g., starts with http:// or https://).');
            }
            throw new Error('No response from backend API (Service unavailable or network issue).');
        } else {
            console.error('Service: Error setting up request to ASP.NET API:', error.message);
            throw new Error('Error setting up request to backend API.');
        }
    }
}

module.exports = {
    getGitHubProfileFromAspNetCore
};