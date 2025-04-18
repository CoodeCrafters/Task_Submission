require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
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

    fs.unlinkSync(file.path); // clean up local file

    res.json({ message: "Uploaded to GitHub", url: githubRes.data.content.html_url });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
