# Real-time Chat Application

A real-time chat application built with React, Strapi, Socket.io, and Tailwind CSS.

## Features

- User authentication (login/register)
- Real-time messaging with WebSocket
- Message history stored in local storage
- Responsive design
- Echo server functionality

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git

## Project Structure

```
.
├── backend/         # Strapi backend
└── frontend/        # React frontend
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Strapi development server:
   ```bash
   npm run develop
   ```

4. Create an admin account when prompted in the browser

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Start chatting! Messages sent will be echoed back by the server

## Development

- Backend runs on `http://localhost:1337`
- Frontend runs on `http://localhost:5173`
- WebSocket connection is established on backend port
- Messages are stored in the browser's local storage

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Socket.io Client
  - Axios

- Backend:
  - Strapi
  - Socket.io