const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Logger Middleware - outputs all requests to console
function loggerMiddleware(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
}

// Apply logger middleware to all routes
app.use(loggerMiddleware);

// Middleware
app.use(cors());
app.use(express.json());

// Static file middleware for images - returns error if file doesn't exist
app.use('/images', (req, res, next) => {
    const filePath = req.path.replace(/^\/images/, '') || '/';
    const imagePath = path.join(__dirname, 'images', filePath);
    
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'Image file does not exist' });
        }
        next();
    });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
