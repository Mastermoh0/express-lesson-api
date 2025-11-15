// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
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

// Helper function to get Font Awesome icon class for each subject
function getIconForSubject(subject) {
    const iconMap = {
        "Mathematics": "fa-calculator",
        "English": "fa-book",
        "Science": "fa-flask",
        "Art": "fa-palette",
        "Music": "fa-music",
        "Physical Education": "fa-running",
        "Computer Science": "fa-laptop-code",
        "History": "fa-landmark",
        "Geography": "fa-globe",
        "Drama": "fa-theater-masks"
    };
    return iconMap[subject] || "fa-graduation-cap";
}

// Lesson data
const initialLessons = [
    {
        "subject": "Mathematics",
        "location": "Hendon",
        "price": 100,
        "spaces": 5,
        "icon": "fa-calculator"
    },
    {
        "subject": "English",
        "location": "Colindale",
        "price": 90,
        "spaces": 5,
        "icon": "fa-book"
    },
    {
        "subject": "Science",
        "location": "Brent Cross",
        "price": 110,
        "spaces": 5,
        "icon": "fa-flask"
    },
    {
        "subject": "Art",
        "location": "Golders Green",
        "price": 85,
        "spaces": 5,
        "icon": "fa-palette"
    },
    {
        "subject": "Music",
        "location": "Hendon",
        "price": 95,
        "spaces": 5,
        "icon": "fa-music"
    },
    {
        "subject": "Physical Education",
        "location": "Colindale",
        "price": 80,
        "spaces": 5,
        "icon": "fa-running"
    },
    {
        "subject": "Computer Science",
        "location": "Brent Cross",
        "price": 120,
        "spaces": 5,
        "icon": "fa-laptop-code"
    },
    {
        "subject": "History",
        "location": "Golders Green",
        "price": 88,
        "spaces": 5,
        "icon": "fa-landmark"
    },
    {
        "subject": "Geography",
        "location": "Hendon",
        "price": 92,
        "spaces": 5,
        "icon": "fa-globe"
    },
    {
        "subject": "Drama",
        "location": "Colindale",
        "price": 87,
        "spaces": 5,
        "icon": "fa-theater-masks"
    }
];

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

        // Initialize or update lessons in the database
        const resetPromises = initialLessons.map(async lesson => {
            const lessonWithIcon = {
                ...lesson,
                icon: lesson.icon || getIconForSubject(lesson.subject)
            };
            
            await db.collection('lessons').updateOne(
                { subject: lesson.subject, location: lesson.location },
                { $set: lessonWithIcon },
                { upsert: true }
            );
        });

        await Promise.all(resetPromises);
        console.log('✅ Lessons initialized/updated in database');
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
