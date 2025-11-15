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
    // Remove /images prefix from path to get the actual file path
    const filePath = req.path.replace(/^\/images/, '') || '/';
    const imagePath = path.join(__dirname, 'images', filePath);
    
    // Check if file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist - return error message as JSON
            return res.status(404).json({ error: 'Image file does not exist' });
        }
        // File exists - serve it using express.static
        next();
    });
});

// Serve static files from images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// MongoDB connection URI - Replace with your own MongoDB Atlas connection string
// Get this from: MongoDB Atlas > Connect > Connect your application
const uri = process.env.MONGODB_URI || "mongodb+srv://moh_db_user:53B9w4zffkXA3K0k@cluster0.5ff7q3t.mongodb.net/?appName=Cluster0";
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
    return iconMap[subject] || "fa-graduation-cap"; // Default icon
}

// Lesson data for reset - using Font Awesome icons instead of images
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

// Connect to MongoDB and initialize lessons
async function connectToDB() {
    if (uri === "YOUR_MONGODB_CONNECTION_STRING_HERE") {
        console.error('ERROR: Please set your MONGODB_URI in .env file or replace the connection string in express.js');
        console.error('Get your connection string from MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
        process.exit(1);
    }

    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db('afterschool');
        console.log('✅ Connected to MongoDB');

        // Initialize or update lessons in the database
        const resetPromises = initialLessons.map(async lesson => {
            // Ensure icon is set for each lesson
            const lessonWithIcon = {
                ...lesson,
                icon: lesson.icon || getIconForSubject(lesson.subject)
            };
            
            await db.collection('lessons').updateOne(
                { subject: lesson.subject, location: lesson.location }, // Match by unique fields
                { $set: lessonWithIcon }, // Set all fields including icon
                { upsert: true } // Create the document if it doesn't exist
            );
        });

        await Promise.all(resetPromises);
        console.log('✅ Lessons initialized/updated in database');
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('Please check your MongoDB connection string and try again.');
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

// Routes

// Get all lessons
app.get('/api/lessons', checkDB, async (req, res) => {
    try {
        const lessons = await db.collection('lessons').find({}).toArray();
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch lessons' });
    }
});

// Search lessons - searches across subject, location, price, and spaces
app.get('/api/search', checkDB, async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    try {
        // Convert query to number if it's a numeric string
        const numericQuery = isNaN(query) ? null : Number(query);
        
        // Build search conditions
        const searchConditions = [
            { subject: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
        ];
        
        // If query is numeric, also search in price and spaces
        if (numericQuery !== null) {
            searchConditions.push({ price: numericQuery });
            searchConditions.push({ spaces: numericQuery });
        }
        
        const lessons = await db.collection('lessons').find({
            $or: searchConditions
        }).toArray();
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: 'Error searching lessons' });
    }
});

// Place an order
app.post('/api/orders', checkDB, async (req, res) => {
    const { name, phone, lessons: lessonIds } = req.body;

    if (!name || !phone || !Array.isArray(lessonIds)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        // Find lessons in the database
        const lessons = await db.collection('lessons').find({
            _id: { $in: lessonIds.map(id => new ObjectId(id)) }
        }).toArray();

        // Check if any lessons are fully booked
        const isFull = lessons.some(lesson => lesson.spaces <= 0);
        if (isFull) {
            return res.status(400).json({ error: 'Some lessons are fully booked' });
        }

        // Decrement spaces for each lesson
        for (const id of lessonIds) {
            await db.collection('lessons').updateOne(
                { _id: new ObjectId(id) },
                { $inc: { spaces: -1 } }
            );
        }

        // Create the order
        const order = {
            name,
            phone,
            lessonIds,
            orderDate: new Date()
        };
        await db.collection('orders').insertOne(order);

        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error placing order' });
    }
});

// Update lesson - can update ANY attribute (not just spaces)
app.put('/api/lessons/:id', checkDB, async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Update data is required' });
    }

    try {
        // Build update object - can update any field
        const updateFields = {};
        
        // Allow updating any attribute: subject, location, price, spaces, icon, etc.
        if (updateData.subject !== undefined) {
            updateFields.subject = updateData.subject;
            // Auto-update icon if subject changes
            if (updateData.subject) {
                updateFields.icon = getIconForSubject(updateData.subject);
            }
        }
        if (updateData.location !== undefined) updateFields.location = updateData.location;
        if (updateData.price !== undefined) updateFields.price = updateData.price;
        if (updateData.spaces !== undefined) updateFields.spaces = updateData.spaces;
        if (updateData.icon !== undefined) updateFields.icon = updateData.icon;
        
        // Add any other fields that might be in updateData
        Object.keys(updateData).forEach(key => {
            if (!['subject', 'location', 'price', 'spaces', 'icon'].includes(key)) {
                updateFields[key] = updateData[key];
            }
        });

        const result = await db.collection('lessons').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        // Return the updated lesson
        const updatedLesson = await db.collection('lessons').findOne({ _id: new ObjectId(id) });
        res.json({ message: 'Lesson updated successfully', lesson: updatedLesson });
    } catch (err) {
        console.error('Error updating lesson:', err);
        res.status(500).json({ error: 'Error updating lesson' });
    }
});
