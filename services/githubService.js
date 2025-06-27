const axios = require('axios');
const https = require('https'); 

const ASPNET_API_URL = process.env.ASPNET_API_URL;

const axiosInstance = axios.create({
    
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

async function getGitHubProfileFromAspNetCore(username) {
    if (!ASPNET_API_URL) {
        throw new Error('ASP.NET API URL is not configured. Please check server environment variables.');
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
                throw new Error('SSL Certificate Error: ASP.NET Core API uses a self-signed certificate. Ensure you have trusted it using "dotnet dev-certs https --trust" AND/OR Node.js is configured to ignore untrusted certificates for development (e.g., by setting rejectUnauthorized to false).');
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('Connection Refused: ASP.NET Core API might not be running or its URL is incorrect.');
            } else if (error.code === 'ERR_INVALID_URL') { 
                 throw new Error('Invalid URL for ASP.NET API. Check ASPNET_API_URL in .env and the fetch path in githubService.js.');
            }
            throw new Error('No response from backend API (Service unavailable).');
        } else {
            console.error('Service: Error setting up request to ASP.NET API:', error.message);
            throw new Error('Error setting up request to backend API.');
        }
    }
}

module.exports = {
    getGitHubProfileFromAspNetCore
};