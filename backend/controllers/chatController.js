// ======= Module imports ======= //
const geminiService = require('../services/geminiService');
 
////////////////////////////////////////////////////////////////////////
// ========================= CHAT CONTROLLER ======================== //
////////////////////////////////////////////////////////////////////////
// This controller handles incoming chat messages and manages the conversation history
// It uses session storage to maintain the chat history across requests

const handleChatMessage = async (req, res) => {
    // Initialize chatHistory in session if it doesn't exist
    req.session.chatHistory = req.session.chatHistory || [];

    const { message } = req.body;

    try {
        // Map the session chat history to the format expected by the Gemini API
        const conversationHistory = req.session.chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }],
        }));

        // Add the current user message to the history
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }],
        });

        // Check if the first message is from the user, if not, add a dummy user message
        // This ensures the conversation starts with a user message, which is required by the Gemini API

        if (conversationHistory.length > 0 && conversationHistory[0].role !== 'user') {
            conversationHistory.unshift({ // unshift adds to the beginning of the array
                role: 'user',
                parts: [{ text: "Start" }] // A dummy user message
            });
        }

        // Call the Gemini service to get the AI's reply
        const reply = await geminiService.generateChatResponse(conversationHistory);

        // Add the user message and the AI's reply to the session chat history
        req.session.chatHistory.push({ role: 'user', text: message }); // Store the user's message
        req.session.chatHistory.push({ role: 'model', text: reply }); // Store the AI's reply

        // Send the AI's reply back to the client
        res.json({ reply });
    } catch (error) {
        console.error("Error in chat controller:", error);
        res.status(500).json({ error: 'Failed to get response from AI service' });
    }
};

module.exports = {
    handleChatMessage,
};