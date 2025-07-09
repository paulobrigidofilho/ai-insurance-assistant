// ==== Module imports ======= //

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import turnersCars from './assets/turnerscars.png';
import ReactMarkdown from 'react-markdown';

// ====================== API URL ===================== //
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/api/chat';

////////////////////////////////////////////////////////////////////////
// ========================== APP COMPONENT ========================= //
////////////////////////////////////////////////////////////////////////

function App() {

  // ========================= State Variables ======================== //
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const conversationEndRef = useRef(null);

  ////////////////////////////////////////////////////////////////////////
  // ==================== OPT-IN MESSAGE FROM TINA ==================== //
  ////////////////////////////////////////////////////////////////////////

  // ================== Initial Message from Tina ================== //
  const initialTinaMessage = {
    speaker: 'Tina',
    text: 'I’m Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?',
  };
  
  // Initialize messages with a welcome message from Tina
  // The messages state is an array of objects, each containing a speaker and text

  const [messages, setMessages] = useState(() => {
    const storedMessages = JSON.parse(localStorage.getItem('chatHistory')) || []; // Retrieve messages from local storage
    return storedMessages.length > 0 ? storedMessages : [initialTinaMessage]; // If no messages are stored, start with Tina's initial message
  });

  ////////////////////////////////////////////////////////////////////////
  // ========================= HELPER FUNCTIONS ======================= //
  ////////////////////////////////////////////////////////////////////////

  // =================== SCROLL TO BOTTOM FUNCTION =================== //

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  ////////////////////////////////////////////////////////////////////////
  // ======================== USE EFFECT HOOKS ======================== //
  ////////////////////////////////////////////////////////////////////////

  // ================== Scroll to Bottom on Messages Change ================ //

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================== Save Messages to Local Storage ================== //

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  ///////////////////////////////////////////////////////////////////////
  // ========================= EVENT HANDLERS ======================== //
  ///////////////////////////////////////////////////////////////////////

  // ================== Handle Input Change ================== //
  const handleInputChange = (event) => { // Update the userInput state with the current value of the input field
    setUserInput(event.target.value);
  };

  // ================== Handle Submit ======================== //
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const trimmedInput = userInput.trim(); // Prevent empty submission

    if (trimmedInput === '' || isLoading) return; // Prevent empty submission

    const userMessage = { speaker: 'Me', text: trimmedInput }; // Wrap user message in an object

    setMessages(prev => [...prev, userMessage]); // Add user message to the conversation
    setUserInput(''); // Clear the input field
    setIsLoading(true);
    setError(null);

    try {

      // Test - API call
      // console.log("Sending to backend:", { message: trimmedInput, history: messages });

      // ================== API CALL TO SEND MESSAGE ================== //

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput, history: messages }),
        credentials: 'include', // Include credentials for session management
      });

      // Test - API response
      // console.log("Backend response status:", response.status);

      // Check if the response is OK (status code 200-299)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
        console.error("Backend request failed:", errorData);
        setMessages(prev => prev.slice(0, -1)); // Rollback user message
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      // ================== HANDLE SUCCESSFUL RESPONSE =============== //
      // Parse the response

      const data = await response.json(); // Parse the JSON response from the backend

      const aiMessage = { speaker: 'Tina', text: data.reply }; // Wrap AI message in an object
      setMessages(prev => [...prev, aiMessage]); // Add AI message to the conversation

    } catch (error) {
      console.error('Error fetching AI response:', error);
      setError(`Failed to get response: ${error.message}. Please try again.`);
      setMessages(prev => prev.slice(0, -1)); // Rollback user message on error
    } finally {
      setIsLoading(false);
    }
  };

  // ================== Handle Refresh ======================== //
  const handleRefresh = async () => {
    try {
      // Send a request to the backend to clear the session
      const response = await fetch(API_URL + '/reset', { 
        method: 'POST',
        credentials: 'include', 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset the frontend state
      localStorage.removeItem('chatHistory'); // Clear local storage
      setMessages([initialTinaMessage]); // Reset messages to initial state
      setError(null);

    } catch (error) {
      console.error('Error resetting session:', error);
      setError("Failed to reset the session. Please try again.");
    }
  };

  ///////////////////////////////////////////////////////////////////////
  // ========================= JSX BELOW ============================= //
  ///////////////////////////////////////////////////////////////////////

  return (
    <div className="app-container">

      {/* Refresh Button */}
      <button className="refresh-button" onClick={handleRefresh}>
        <span role="img" aria-label="refresh">🔄</span> Refresh
      </button>

      {/* Logo and Header Section */}
      <img src={turnersCars} alt="Turners Cars" className="logo" />
      <h1>AI Insurance Policy Assistant</h1>

      {/* Conversation Section */}

      <div className="conversation-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.speaker.toLowerCase()}`}>
            <strong>{message.speaker}:</strong>
            {message.speaker === 'Tina' ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message tina">
            <strong>Tina:</strong> Typing...
          </div>
        )}
        <div ref={conversationEndRef} />
      </div>

      {/* Error Message Section */}

      {error && <div className="error-message">Error: {error}</div>}

      {/* Input Form Section */}

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          placeholder="Type your response..."
          value={userInput}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;