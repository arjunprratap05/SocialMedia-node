const githubService = require('../services/githubService');

const getUserProfile = async (req, res) => {
    const { username } = req.params;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: "Username cannot be empty." });
    }

    try {
        console.log(`Controller: Fetching profile for username: ${username}`);
        const profileData = await githubService.getGitHubProfileFromAspNetCore(username);
        res.status(200).json(profileData);
    } catch (error) {
        const statusCode = error.status || 500;
        const errorMessage = error.message || "An unexpected error occurred.";
        console.error(`Controller: Error fetching profile for ${username}:`, error);
        res.status(statusCode).json({ message: errorMessage });
    }
};

module.exports = {
    getUserProfile,
};