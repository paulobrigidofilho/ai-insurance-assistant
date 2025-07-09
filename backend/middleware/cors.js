// ==== Module imports ======= //

const cors = require("cors");
require("dotenv").config();

// ========================== CORS MIDDLEWARE SETUP ==================== //
// This middleware sets up CORS configuration based on the environment

const setupMiddleware = (app) => {
  if (process.env.NODE_ENV === 'production') {
    
    // ========================= CORS CONFIGURATION FOR PRODUCTION ==================== //
    const corsOptions = {
      origin: process.env.FRONTEND_URL, // Use the environment variable in production
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true, // Enable credentials
      optionsSuccessStatus: 200,
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    app.use(cors(corsOptions));
    console.log(`CORS middleware configured for production. Allowing origin: ${process.env.FRONTEND_URL}`);
  } else {

    // ========================= CORS CONFIGURATION FOR DEVELOPMENT ==================== //
    
    const corsOptions = {
      origin: true, // Allow all origins in development
      credentials: true, 
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200,
    };
    app.use(cors(corsOptions));
    console.log("CORS middleware configured for development with credentials enabled.");
  }
};

module.exports = { setupMiddleware };