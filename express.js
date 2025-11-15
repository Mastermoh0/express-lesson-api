// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
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

// MongoDB connection URI
const uri = process.env.MONGODB_URI || "YOUR_MONGODB_CONNECTION_STRING_HERE";
let db;

// Connect to MongoDB
async function connectToDB() {
    if (uri === "YOUR_MONGODB_CONNECTION_STRING_HERE") {
        console.error('ERROR: Please set your MONGODB_URI in .env file');
        process.exit(1);
    }

    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db('afterschool');
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
}

// Middleware to check if the database is connected
function checkDB(req, res, next) {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    next();
}

// Start the server
connectToDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});
