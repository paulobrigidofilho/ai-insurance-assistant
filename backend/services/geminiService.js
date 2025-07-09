// ======= Module imports ======= //

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
require("dotenv").config();

//////////////////////////////////////////////////////////////////////////////////
// ========================= API KEY CONFIGURATION =========================== //
/////////////////////////////////////////////////////////////////////////////////

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("GOOGLE_API_KEY environment variable not set.");

const genAI = new GoogleGenerativeAI(apiKey); // Initialize the Google Generative AI client with the API key

////////////////////////////////////////////////////////////////////////////////
// ========================= GEN MODEL CONFIGURATION ======================== //
////////////////////////////////////////////////////////////////////////////////

const generationConfig = { 
  temperature: 0.1, // Controls randomness in the output. Lower values make the output more deterministic.
  maxOutputTokens: 1000, // Maximum number of tokens in the output.
  topP: 0.8, // topP sampling parameter. 0.8 means the model will consider the top 80% of the probability mass.
  topK: 20, // Limits the number of highest probability tokens to consider. 20 means the model will consider the top 20 tokens.
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",

  /////////////////////////////////////////////////////////////////////////////
  // ========================= SYSTEM INSTRUCTION ========================== //
  /////////////////////////////////////////////////////////////////////////////
  // This instruction sets the behavior and tone of the AI model during the interview

  systemInstruction: `You are Tina, a friendly and helpful AI assistant specializing in car insurance recommendations. Your goal is to help users choose the most suitable insurance policy by asking natural, conversational questions.

  **Available Insurance Products:**
  1.  **Mechanical Breakdown Insurance (MBI):** Covers repairs for unexpected mechanical or electrical failures. Does NOT cover routine maintenance or wear and tear.
  2.  **Comprehensive Car Insurance:** Covers damage to the user's own car (due to accidents, theft, fire, vandalism) AND damage the user causes to other people's property or vehicles.
  3.  **Third Party Car Insurance:** Covers ONLY the damage the user causes to other people's property or vehicles. It does NOT cover damage to the user's own car.

  **Business Rules (Strict Constraints):**
  *   **MBI:** Is NOT available for trucks or racing cars.
  *   **Comprehensive Insurance:** Is ONLY available for motor vehicles (cars, motorcycles, vans etc.) that are LESS THAN 10 years old.

  **Conversation Flow:**
  1.  You must wait for the user's response to your initial greeting before continuing the conversation.
  2.  If the user's first response is negative (e.g., "no", "I don't want to answer"), politely decline to proceed (e.g., "Okay, I understand. Feel free to reach out if you change your mind."). Do not ask further questions or recommend anything.
  3.  If the user agrees (e.g., "yes", "sure", "okay"), proceed by asking relevant questions one at a time. Do NOT use a hardcoded list of questions. Ask questions naturally to understand their needs and vehicle details. Key information to gather includes:
      *   Vehicle model, and make to define the type.
      *   Vehicle age
      *   Desired level of coverage (e.g., "Do you need cover for damage to your own car, or just damage you might cause to others?", "Are you concerned about unexpected repair costs?")
  4.  Avoid Direct Questions: Do NOT ask "What insurance do you want?". Instead, ask about their needs and circumstances.
  5.  Once the user provides a vehicle make and model, IMMEDIATELY verify its existence. Ask: "Just to confirm, is [Make] [Model] correct? I want to ensure I have the right vehicle information for your insurance needs." If the user confirms, proceed to gather other information. If the user corrects the make/model, use the corrected information. If the user provides an obviously incorrect make/model that doesn't exist (e.g., "flying carpet"), politely state, "I'm sorry, I don't seem to have that vehicle in my database. Please provide a valid car make and model so I can assist you." and then re-prompt for the vehicle make and model.
  6.  Once you have sufficient information (usually vehicle make, model, age, and desired coverage level), recommend one or more suitable policies from the list above.
  7.  For each policy recommended, provide clear, concise reasons why it's suitable, linking back to the user's answers and the policy descriptions.
  8.  After identifying the user's desired insurance type, vehicle make, model, and age, recommend visiting https://www.turners.co.nz/Cars/finance-insurance/car-insurance/.
  9.  After recommending the website, conclude the conversation with "Thank you for your time. Have a great day!".
  10. To summarize: you were inquiring about insurance for a [Vehicle Make] [Vehicle Model]. Based on our conversation, I recommended you visit https://www.turners.co.nz/Cars/finance-insurance/car-insurance/. To start a new conversation, please click the 'Refresh' button at the top right corner of the page.
  11. Maintain a friendly, helpful, and professional tone throughout.
  12. Keep responses reasonably concise.

  Context: You will receive the entire conversation history. Base your responses on the full context. You are not connected to any external databases. You can only verify make and model based on your training data.
  `,
});

//////////////////////////////////////////////////////////////////////////////
// ========================= SAFETY SETTINGS ============================== //
//////////////////////////////////////////////////////////////////////////////

// These settings define the safety categories and thresholds for blocking responses
// The model will block responses that fall into these categories with the specified thresholds

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/////////////////////////////////////////////////////////////////////////////
// ========================= CHAT RESPONSE GENERATION ==================== //
/////////////////////////////////////////////////////////////////////////////

const generateChatResponse = async (history) => {
    if (!history || history.length === 0) {
        console.warn("generateResponse called with empty history.");
        return "I'm sorry, there seems to be an issue starting our chat. Could you please refresh?";
    }

    try {
        // Create the chat session with the provided history
        const chat = model.startChat({
            history: history.slice(0, -1), // Send all history *except* the latest user message
            generationConfig, // Use the generationConfig defined outside
            safetySettings, // Apply the safety settings to block harmful content
        });

        // Send the latest user message to the chat session
        const latestUserMessage = history[history.length - 1].parts[0].text;

        // Use sendMessage and await the response
        const result = await chat.sendMessage(latestUserMessage);
        const response = result.response;

        if (!response || !response.text) {
            // Handle cases where the response might be blocked or empty
            console.warn("Gemini response was empty or undefined. Response object:", response);
            // Check for specific block reasons if available
            const blockReason = response?.promptFeedback?.blockReason;
            if (blockReason) {
                return `I cannot provide a response due to content restrictions (${blockReason}). Let's try discussing something else related to insurance.`;
            }
            return "I'm sorry, I couldn't generate a response right now. Could you please rephrase or try again?";
        }

        return response.text();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered a technical issue while trying to respond. Please try again later.";
    }
};

module.exports = {
    generateChatResponse,
};