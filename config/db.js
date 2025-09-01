import mongoose from "mongoose";

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

// Function to connect to the MongoDB database with connection caching for serverless
const connectDB = async () => {
    // If we have a cached connection, use it
    if (cached.conn) {
        console.log('🔄 Using cached database connection')
        return cached.conn
    }

    // If we don't have a promise, create one
    if (!cached.promise) {
        const mongoUri = process.env.MONGODB_URI
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined')
        }

        console.log('🔗 Creating new database connection...')

        const opts = {
            dbName: 'test',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4
            retryWrites: true,
            retryReads: true,
            // Important for serverless
            bufferCommands: false,
            bufferMaxEntries: 0,
        }

        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
            console.log('✅ New database connection established')
            return mongoose
        }).catch((error) => {
            console.error('❌ Database connection failed:', error.message)
            cached.promise = null
            throw error
        })
    }

    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (e) {
        cached.promise = null
        throw e
    }
}

export default connectDB