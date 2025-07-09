// ==== Module imports ======= //
 
const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();

// ============================ ROUTES ================================ //

// This route handles incoming chat messages
router.post('/', chatController.handleChatMessage);

// This route resets the session, effectively clearing the chat history
router.post('/reset', (req, res) => {
  req.session.destroy((err) => {  // Destroy to clear the session // This will clear the session data, including chat history
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: 'Failed to reset session' });
    }
    res.sendStatus(200); 
  });
});

module.exports = router;

