// Import mongoose library for MongoDB connection
import mongoose from "mongoose";

// Simple function to connect to MongoDB database
const connectDB = async () => {
    try {
        // Check if already connected to avoid multiple connections
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Already connected to MongoDB');
            return;
        }

        // Get MongoDB connection string from environment variables
        const mongoUri = process.env.MONGODB_URI;
        
        // Check if MongoDB URI exists
        if (!mongoUri) {
            throw new Error('❌ MONGODB_URI not found in environment variables');
        }

        console.log('🔗 Connecting to MongoDB...');

        // Connect to MongoDB with simple options
        await mongoose.connect(mongoUri, {
            dbName: 'test',  // Database name
        });

        console.log('✅ Connected to MongoDB successfully!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
};

// Export the connection function
export default connectDB;