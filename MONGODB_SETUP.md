# MongoDB Atlas Setup Instructions

Follow these steps to set up your MongoDB Atlas database:

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Create your account (you can use Google, GitHub, or email)

## Step 2: Create a Cluster

1. After signing in, you'll be prompted to create a cluster
2. Choose the **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose the closest to you)
4. Click "Create Cluster"
5. Wait 3-5 minutes for the cluster to be created


## Step 3: Create Database User

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., `lessonapp_user`)
5. Click "Autogenerate Secure Password" or create your own
6. **IMPORTANT**: Copy and save the password - you won't see it again!
7. Under "Database User Privileges", select "Atlas admin" or "Read and write to any database"
8. Click "Add User"

## Step 4: Whitelist Your IP Address

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) OR add your current IP
   - For production, you should only allow specific IPs
4. Click "Confirm"

## Step 5: Get Your Connection String

1. In the left sidebar, click "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
6. Replace `<password>` with the password you created in Step 3
7. Replace `<database>` with `afterschool` (or your preferred database name)

## Step 6: Add Connection String to Your Project

### Option A: Using .env file (Recommended)

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your connection string:
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/afterschool?retryWrites=true&w=majority
   ```
3. Install dotenv if not already installed:
   ```bash
   npm install dotenv
   ```
4. Make sure `express.js` loads the .env file (add at the top):
   ```javascript
   require('dotenv').config();
   ```

### Option B: Direct in express.js

1. Open `express.js`
2. Find the line: `const uri = process.env.MONGODB_URI || "YOUR_MONGODB_CONNECTION_STRING_HERE";`
3. Replace `"YOUR_MONGODB_CONNECTION_STRING_HERE"` with your actual connection string

## Step 7: Test Your Connection

1. Start your Express server:
   ```bash
   node express.js
   ```
2. You should see:
   ```
   ✅ Connected to MongoDB
   ✅ Lessons initialized/updated in database
   Server running at http://localhost:3001
   ```

## Troubleshooting

### "Authentication failed"
- Check that your username and password are correct
- Make sure you replaced `<password>` in the connection string

### "IP not whitelisted"
- Go to Network Access and add your current IP address
- Or use "Allow Access from Anywhere" for development

### "Connection timeout"
- Check your internet connection
- Verify the connection string is correct
- Make sure your cluster is running (check MongoDB Atlas dashboard)

### "Database not connected"
- Verify the connection string format is correct
- Check that your cluster is active (not paused)
- Ensure you've completed all setup steps

## Security Notes

⚠️ **Important Security Tips:**
- Never commit your `.env` file to Git (it should be in `.gitignore`)
- Never share your connection string publicly
- For production, use environment variables on your hosting platform
- Use specific IP whitelisting instead of "Allow Access from Anywhere" in production

## Next Steps

Once connected, your database will automatically:
- Create the `afterschool` database
- Create the `lessons` collection with 10 lessons
- Create the `orders` collection (empty initially)

You can view your data in MongoDB Atlas:
1. Go to "Database" > "Browse Collections"
2. Click on your database and collections to see the data

