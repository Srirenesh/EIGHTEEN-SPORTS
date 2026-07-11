const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
// Set limits high enough to handle Base64 image uploads from camera snaps
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static client assets and files directly
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// API to login admin using credentials
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username && username.toLowerCase() === 'admin' && password === 'eighteen18') {
        res.json({ success: true, token: 'mock-admin-session-token-18' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
});

// API to upload base64 images from camera snaps
app.post('/api/upload', (req, res) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || !filename) {
        return res.status(400).json({ error: 'Missing image data or filename' });
    }

    try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const filePath = path.join(__dirname, 'assets', filename);

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Failed to write file to disk' });
            }
            res.json({ success: true, url: `assets/${filename}` });
        });
    } catch (error) {
        console.error('Upload catch error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// API to GET current database status
app.get('/api/data', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db:', err);
            return res.status(500).json({ error: 'Failed to read store data' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseErr) {
            console.error('Error parsing db JSON:', parseErr);
            res.status(500).json({ error: 'Invalid database format' });
        }
    });
});

// API to POST/UPDATE the database status
app.post('/api/data', (req, res) => {
    const updatedData = req.body;

    // Simple validation of structure
    if (!updatedData.hero || !updatedData.categories || !updatedData.promos || !updatedData.products) {
        return res.status(400).json({ error: 'Invalid store database schema. Products list is required.' });
    }

    fs.writeFile(DB_PATH, JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to db:', err);
            return res.status(500).json({ error: 'Failed to save store updates' });
        }
        res.json({ success: true, message: 'Store configuration saved successfully' });
    });
});

// Custom routes to serve main pages cleanly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Eighteen Sports server running on http://localhost:${PORT}`);
});
