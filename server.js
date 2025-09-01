import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.js'

// Initialize Express
const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Database connection state
let isConnected = false

// Database connection middleware
const ensureDbConnection = async (req, res, next) => {
    if (!isConnected) {
        try {
            await connectDB()
            isConnected = true
            console.log('✅ Database connection established')
        } catch (error) {
            console.error('❌ Database connection failed:', error.message)
            console.error('❌ Database error details:', error)
            Sentry.captureException(error)
            // Continue without database for now
        }
    }
    next()
}

// Apply database middleware to routes that need it
app.use('/webhooks', ensureDbConnection)

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: isConnected ? 'Connected' : 'Disconnected',
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 5000,
            hasMongoDB: !!process.env.MONGODB_URI,
            hasClerkSecret: !!process.env.CLERK_WEBHOOK_SECRET
        }
    })
})
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.post('/webhooks', clerkWebhooks)

// Setup Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

export default app