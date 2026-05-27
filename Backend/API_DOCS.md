# ChatBot Backend API Documentation

This document describes the available API endpoints for the ChatBot Backend.

## Base URL
`http://localhost:<PORT>/api` (Default port is 3000)

## Authentication
Most endpoints are protected and require a Google ID Token passed in the `Authorization` header.

**Header Format:**
`Authorization: Bearer <GOOGLE_ID_TOKEN>`

---

## Chat Endpoints

### 1. Create a New Chat
Creates a new conversation, generates an AI-powered title, and returns the initial AI response.

*   **URL:** `/chat`
*   **Method:** `POST`
*   **Auth Required:** Yes
*   **Body Parameters:**
    *   `message` (String, required): The user's first message.
    *   `model` (String, optional): The Groq model to use (e.g., `llama-3.3-70b-versatile`).

*   **Request Example:**
    ```json
    {
      "message": "What is the capital of France?",
      "model": "llama-3.3-70b-versatile"
    }
    ```

*   **Success Response:**
    *   **Code:** 201 (Created)
    *   **Content:**
        ```json
        {
          "reply": "The capital of France is Paris.",
          "chatID": "550e8400-e29b-41d4-a716-446655440000",
          "title": "Capital of France"
        }
        ```

*   **Error Responses:**
    *   **Code:** 400 (Bad Request) - Missing message or authentication.
    *   **Code:** 401 (Unauthorized) - Invalid or missing Google ID Token.
    *   **Code:** 500 (Internal Server Error) - LLM or Database error.

### 2. List All Chats
Retrieves a list of all conversations for the authenticated user.

*   **URL:** `/chat`
*   **Method:** `GET`
*   **Auth Required:** Yes

*   **Success Response:**
    *   **Code:** 200 (OK)
    *   **Content:** An array of Chat objects.
        ```json
        [
          {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "userId": "user_123",
            "title": "Capital of France",
            "lastAccessed": "2026-05-26T12:00:00Z",
            "messages": [...]
          }
        ]
        ```

### 3. List Available Models
Retrieves a list of available Groq models.

*   **URL:** `/chat/models`
*   **Method:** `GET`
*   **Auth Required:** Yes

*   **Success Response:**
    *   **Code:** 200 (OK)
    *   **Content:**
        ```json
        [
          "llama-3.3-70b-versatile",
          "mixtral-8x7b-32768",
          "gemma2-9b-it"
        ]
        ```

### 4. Send Message to Existing Chat
Adds a new message to an existing conversation and returns the AI response.

*   **URL:** `/chat/:chatID`
*   **Method:** `POST`
*   **Auth Required:** Yes
*   **Path Parameters:**
    *   `chatID` (String, required): The unique ID of the conversation.
*   **Body Parameters:**
    *   `message` (String, required): The user's message.
    *   `model` (String, optional): The Groq model to use.

*   **Request Example:**
    ```json
    {
      "message": "Can you tell me more about its history?",
      "model": "llama-3.3-70b-versatile"
    }
    ```

*   **Success Response:**
    *   **Code:** 200 (OK)
    *   **Content:**
        ```json
        {
          "reply": "Paris has a rich history dating back to the 3rd century BC..."
        }
        ```

*   **Error Responses:**
    *   **Code:** 400 (Bad Request) - Missing data.
    *   **Code:** 403 (Forbidden) - User does not own this chat.
    *   **Code:** 404 (Not Found) - Chat does not exist.
    *   **Code:** 503 (Service Unavailable) - LLM service error or quota exceeded. User message is NOT saved in this case. Response: `{ "error": "Server is Busy please try again after some time" }`
    *   **Code:** 500 (Internal Server Error) - Processing failure.

### 5. Get Chat Messages
Retrieves all messages for a specific conversation.

*   **URL:** `/chat/:chatID`
*   **Method:** `GET`
*   **Auth Required:** Yes
*   **Path Parameters:**
    *   `chatID` (String, required): The unique ID of the conversation.

*   **Success Response:**
    *   **Code:** 200 (OK)
    *   **Content:** An array of Message objects.
        ```json
        [
          {
            "id": "msg_123",
            "type": "User",
            "message": "Hello!"
          },
          {
            "id": "msg_456",
            "type": "AI",
            "message": "Hi there! How can I help?"
          }
        ]
        ```

*   **Error Responses:**
    *   **Code:** 403 (Forbidden) - User does not own this chat.
    *   **Code:** 404 (Not Found) - Chat does not exist.

---

## Development Notes
- All relative imports in the codebase must include the `.js` extension for ESM compatibility.
- Authentication uses `google-auth-library` to verify ID tokens against the `GOOGLE_CLIENT_ID`.
