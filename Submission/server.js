require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express(); // Moved this up - was used before being declared
const upload = multer({ dest: 'uploads/' });

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// --- Health Check Endpoint ---
app.get('/welcome', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const content = fs.readFileSync(file.path, { encoding: 'base64' });

        const githubRes = await axios.put(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/uploads/${file.originalname}`,
            {
                message: `Upload ${file.originalname}`,
                content: content,
                branch: process.env.GITHUB_BRANCH
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    'User-Agent': 'NodeUploader'
                }
            }
        );

        fs.unlinkSync(file.path); // delete local file

        res.json({ message: "Uploaded to GitHub", url: githubRes.data.content.html_url });

    } catch (error) {
        console.error("GitHub upload failed:", error.response?.data || error.message);
        res.status(500).json({ error: "Upload failed", details: error.response?.data || error.message });
    }
});

// 🔁 Periodic Ping to Keep Service Awake
setInterval(async () => {
    try {
        const pingRes = await axios.get('https://general-proficency.onrender.com/health');
        console.log(`[Health Ping] ${new Date().toISOString()} - Status: ${pingRes.status}`);
    } catch (err) {
        console.error(`[Health Ping] Failed at ${new Date().toISOString()}:`, err.message);
    }
}, 2 * 60 * 1000); // Every 2 minutes

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
