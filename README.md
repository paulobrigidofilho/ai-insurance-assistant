[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/4PDuOKq9)
# Turners Cars AI Insurance Policy Assistant

This project is an AI-powered chatbot designed to assist users in choosing the right car insurance policy through a conversational interface. It leverages the Google Gemini AI model to understand user needs and recommend suitable insurance options from Turners Cars.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MR-2025-PT-March-L5ADV/mission-4-app-aliance.git
    cd mission-4-app-aliance
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add your Google Generative AI API key:

        ```
        GOOGLE_API_KEY=<your_api_key>
        ```

4.  **Run the application:**

    ```bash
    npm start
    ```

## Usage

Once the application is running, navigate to `http://localhost:3000` (or the appropriate address based on your setup) in your web browser.  You'll be greeted by Tina, the AI Insurance Policy Assistant. Simply type your questions or requests in the input box and submit. Tina will guide you through the process of finding the right car insurance for your needs.

## Project Details

*   **Frontend:** React.js for the user interface.
*   **Backend:** Node.js with Express for handling API requests.
*   **AI Model:** Google Gemini AI for natural language understanding and response generation.
*   **Key Features:**
    *   Conversational insurance policy recommendation.
    *   Integration with Google Gemini AI for intelligent responses.
    *   Session management for maintaining conversation history.
    *   Error handling and user-friendly feedback.

## Insurance Products Supported:

The AI assistant can recommend the following insurance products:

*   Mechanical Breakdown Insurance (MBI): Covers repairs for unexpected mechanical or electrical failures.
*   Comprehensive Car Insurance: Covers damage to your own car and damage you cause to others.
*   Third Party Car Insurance: Covers only the damage you cause to other people's property or vehicles.

## Business Rules
*   Mechanical Breakdown Insurance (MBI) is NOT available for trucks or racing cars.
*   Comprehensive Insurance is ONLY available for motor vehicles (cars, motorcycles, vans etc.) that are LESS THAN 10 years old.

## Contributors

*   [Andre Cavalcanti](https://github.com/lwrdr)
*   [Paulo Brigido](https://github.com/paulobrigidofilho)
