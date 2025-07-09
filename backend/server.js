// ==== Module imports ======= //
const express = require('express');
const session = require('express-session');
const redis = require('redis');
require('dotenv').config();
const { setupMiddleware } = require('./middleware/cors');

// ========================= APP INITIALIZATION ==================== //
const app = express();
const port = process.env.PORT || 4000;

// ========================= REDIS CLIENT CONFIGURATION ================ //
(async () => {
    try {
        // ========================= SESSION CONFIGURATION =============== //
        // Configuration - Redis client
        const redisClient = redis.createClient({
            
            url: 'redis://redis:6379'  // Use the Docker service name for Redis
        });


        // Handle Redis connection events
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
        redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
        redisClient.on('ready', () => console.log('✅ Redis ready to accept commands'));
        
        await redisClient.connect(); // Connect to Redis server

        // Test Redis connection
        try {

            // Test Redis connection by setting and getting a test key
            await redisClient.set('test-key', 'test-value');
            // Retrieve the test key to verify connection
            const testValue = await redisClient.get('test-key');
            console.log('✅ Redis test successful:', testValue);
            // Clean up the test key
            await redisClient.del('test-key');
        } catch (redisTestError) {
            console.error('❌ Redis test failed:', redisTestError);
        }

        // ======================== SESSION SETUP ========================= //
        // Connect Redis to express-session
        // Use the RedisStore for session management
        const { RedisStore } = require('connect-redis');

        app.use(session({
            store: new RedisStore({ client: redisClient }), // Use RedisStore
            secret: process.env.SESSION_SECRET || 'a-very-long-and-random-session-secret', 
            resave: false, // Don't resave session if unmodified
            saveUninitialized: false,  // Don't save uninitialized sessions
            name: 'sessionId', // Session Name
            cookie: {
                secure: false, // Set to false for development/Docker
                httpOnly: true, // Prevent XSS attacks
                sameSite: 'lax', // More permissive for development
                maxAge: 24 * 60 * 60 * 1000 // The session cookie will expire after 24 hours
            }
        }));

        // ========================= SESSION DEBUGGING MIDDLEWARE =========== //
        // This middleware logs session information for debugging purposes
    
        app.use((req, res, next) => { 
            
            // parameter 'res' is not used, but it's a common pattern to have it for middleware  
            // parameter 'next' is not used, but it's a common pattern to have it for middleware 
            
            console.log('🔍 Session Debug:', {
                sessionID: req.sessionID,
                session: req.session,
                cookies: req.headers.cookie
            });
            next();
        });


        // ========================= MIDDLEWARE ============================ //
        setupMiddleware(app);
        app.use(express.json());

        ///////////////////////////////////////////////////////////////////////
        // ========================= ROUTES ================================ //
        ///////////////////////////////////////////////////////////////////////

        // ===================== Routes Imports ============================ //

        const chatRoutes = require('./routes/chatRoutes');

        // ====================== Routes Setup ============================= //

        app.use('/api/chat', chatRoutes);

        ///////////////////////////////////////////////////////////////////////
        // ========================= SERVER START ========================== //
        ///////////////////////////////////////////////////////////////////////
        
        // Start the server
        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Allowing requests from: ${process.env.FRONTEND_URL}`);

            // Check if the GOOGLE_API_KEY is set
            if (!process.env.GOOGLE_API_KEY) {
                console.warn("Warning: GOOGLE_API_KEY environment variable not set. Gemini API calls will fail.");
            }
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server Error:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error("Error setting up Redis and session:", error);
        process.exit(1);
    }
})();