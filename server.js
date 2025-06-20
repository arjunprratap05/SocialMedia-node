require('dotenv').config();

const express = require('express');
const cors = require('cors');
const githubRoutes = require('./routes/githubRoutes.js'); 

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors()); 
app.use(express.json()); 

app.use('/api/github-user', githubRoutes);

app.get('/', (req, res) => {
    res.send('GitHub Profile Detective Node.js Proxy Server is running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Node.js proxy server running on http://localhost:${PORT}`);
    console.log(`ASP.NET API target: ${process.env.ASPNET_API_URL}`);
    console.log('Routes mounted: /api/github-user/:username');
});