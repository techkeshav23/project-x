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
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.post('/webhooks', clerkWebhooks)

// Setup Sentry error handler
Sentry.setupExpressErrorHandler(app);

// For Vercel, export the app
export default app

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}