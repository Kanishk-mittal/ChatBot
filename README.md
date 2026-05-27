# AI ChatBot

A full-stack, AI-powered ChatBot application featuring Google OAuth authentication, hybrid storage (MongoDB + Redis), and integration with cutting-edge Groq LLM models (e.g., Llama 3, Mixtral) for intelligent, conversational text generation.

## 🚀 Features

- **Conversational AI**: High-performance AI chat capabilities powered by Groq's APIs (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, etc.).
- **Secure Authentication**: End-to-end Google OAuth flow (handling ID tokens) protecting all user data and chats.
- **Smart Data Storage**: 
  - **MongoDB**: Persistent database maintaining user chat history and session metadata.
  - **Redis Stack**: High-speed caching layer ensuring rapid message retrieval.
- **Modern Tech Stack**:
  - **Frontend**: React 19, TypeScript, Vite, React Router, TailwindCSS.
  - **Backend**: Node.js, Express 5, TypeScript, Mongoose, Redis-OM.

---

## 📁 Project Structure

```text
├── Backend/                 # Express Server, API Routes, DB Logic, LLM integration
│   ├── src/                 # TypeScript source files (Controllers, Models, Services)
│   ├── docker-compose.yml   # Redis-stack docker configuration
│   ├── API_DOCS.md          # Comprehensive REST API definitions
│   └── Diagram.puml         # Application architecture UML diagram
└── frontend/                # React Vite application
    ├── src/                 # React Components, Contexts, Pages, Types
    └── tailwind.config.js   # Tailwind UI styling configuration
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed and set up:
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose** (for running Redis locally)
- A **MongoDB** instance (Local or MongoDB Atlas)
- **Google OAuth Client Credentials** (from Google Cloud Console)
- **Groq API Key** (from [Groq Console](https://console.groq.com/))

---

## 🛠️ Installation & Setup

### 1. Configure Environment Variables

**Backend (`Backend/.env`)**
Create a `.env` file in the `Backend` directory based on the provided example:
```bash
cp Backend/.env.example Backend/.env
```
Fill in the variables in `Backend/.env`:
```env
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID_HERE>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET_HERE>
MONGO_URI=<mongodb_connection_string>
REDIS_URL=redis://:1234@localhost:6379  # Assuming password "1234" from docker-compose
GROQ_API_KEY=<YOUR_GROQ_API_KEY_HERE>
```

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend` directory:
```bash
cp frontend/.env.example frontend/.env
```
Fill in the variable in `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID_HERE>
```

### 2. Start Supporting Services (Redis)

Use the provided `docker-compose.yml` to spin up the Redis Stack in the background.
```bash
cd Backend
docker compose up -d
```

### 3. Run the Backend Server

Install dependencies and start the development server.
```bash
cd Backend
npm install
npm run dev
```
*The backend API will typically start on `http://localhost:3000` (or as configured).*

### 4. Run the Frontend App

Open a new terminal, install dependencies, and start the Vite dev server.
```bash
cd frontend
npm install
npm run dev
```
*Access the React web application via the local URL Vite provides (e.g., `http://localhost:5173`).*

---

## 📖 API Documentation

The backend service exposes REST APIs at `/api`. All protected routes require a valid Google ID token sent as a Bearer token in the `Authorization` header.

**Key Endpoints:**
- `POST /api/chat` - Initialize a new conversation and generate an AI-powered title.
- `GET /api/chat` - List all chats owned by the authenticated user.
- `GET /api/chat/models` - Fetch supported Groq LLM models.
- `POST /api/chat/:chatID` - Send a message to an ongoing conversation.
- `GET /api/chat/:chatID` - Retrieve history for a specific chat.

For full details, reference the [Backend API Documentation](Backend/API_DOCS.md).

---

## 🏗️ Architecture

The backend features a resilient architecture enforcing separation of concerns:
- **Authentication**: `GoogleAuthService` & `AuthMiddleware` validate claims and populate user context.
- **Storage Layer**: A `StorageManager` Singleton orchestrates interactions between the `ICache` (Redis) and `IDatabase` (MongoDB) interfaces seamlessly.
- **LLM Engine**: Interactions are abstracted through `ILLMInterface` using `GroqService`.

View the complete [Architecture UML Diagram](Backend/Diagram.puml).
