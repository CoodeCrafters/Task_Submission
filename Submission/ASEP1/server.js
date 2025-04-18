const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

const GITHUB_TOKEN = "your_personal_access_token";
const REPO = "your-username/your-repo";
const BRANCH = "main"; // or other branch
const UPLOAD_PATH = "uploads/"; // path inside repo

app.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;

    const content = fs.readFileSync(file.path, { encoding: "base64" });

    const result = await axios.put(
        `https://api.github.com/repos/${REPO}/contents/${UPLOAD_PATH}${file.originalname}`,
        {
            message: `Upload ${file.originalname}`,
            content: content,
            branch: BRANCH
        },
        {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                "User-Agent": "GitHubUploader"
            }
        }
    );

    fs.unlinkSync(file.path); // cleanup

    res.json({ message: "Uploaded to GitHub", url: result.data.content.html_url });
});

app.listen(3000, () => console.log("Server running on port 3000"));
