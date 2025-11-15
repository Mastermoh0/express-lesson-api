# Express.js REST API - After School Classes

Back-end REST API for the After School Classes booking application, built with Express.js and MongoDB Atlas.

## Features

- ✅ REST API with Express.js
- ✅ MongoDB Atlas database integration
- ✅ Logger middleware for request logging
- ✅ Static file middleware with error handling
- ✅ Full-text search functionality
- ✅ CRUD operations for lessons and orders

## API Endpoints

- `GET /api/lessons` - Get all lessons
- `GET /api/search?q=query` - Search lessons (searches subject, location, price, spaces)
- `POST /api/orders` - Create a new order
- `PUT /api/lessons/:id` - Update a lesson (can update any attribute)

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A MongoDB Atlas account (free tier is fine)

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- express
- mongodb (native driver)
- cors
- dotenv

### Step 2: Set Up MongoDB Atlas

Follow the detailed instructions in `MONGODB_SETUP.md` to:
1. Create a MongoDB Atlas account
2. Create a cluster
3. Create a database user
4. Get your connection string

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/afterschool?retryWrites=true&w=majority
   PORT=3001
   ```

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Lessons initialized/updated in database
Server running at http://localhost:3001
```

## Project Structure

```
express-lesson-api/
├── express.js          # Express.js server and API routes
├── package.json        # Node.js dependencies
├── .env                # Environment variables (create this)
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore file
├── MONGODB_SETUP.md    # MongoDB Atlas setup guide
└── README.md           # This file
```

## Testing the API

You can test the API using:
- Browser: Navigate to `http://localhost:3001/api/lessons`
- Postman: Import the collection and test all endpoints
- cURL: Use command line to test endpoints

## Database Structure

- Database: `afterschool`
- Collections:
  - `lessons` - Contains lesson information (subject, location, price, spaces, icon)
  - `orders` - Contains order information (name, phone, lessonIds, orderDate)

## Deployment

This API is designed to be deployed on:
- **Render.com** (recommended for free tier)
- **AWS** (as per coursework requirements)

See deployment instructions in the main project documentation.

## License

This project is for educational purposes.

