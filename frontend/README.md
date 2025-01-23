# Echo Chat Frontend

A modern real-time chat application frontend built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 Secure Authentication
  - Email and password-based login/registration
  - Persistent sessions with JWT
  - Secure logout functionality

- 💬 Real-time Chat
  - Instant message delivery with WebSocket
  - Server echo functionality
  - Message timestamps
  - Automatic scrolling to latest messages
  - Message persistence using local storage

- 🎨 Modern UI/UX
  - Clean and responsive design
  - Mobile-first approach
  - Beautiful message bubbles
  - Loading states and animations
  - Toast notifications
  - Dark mode support

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Vite

## Prerequisites

- Bun 1.0.0 or higher
- Node.js 18.0.0 or higher

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:1337
   ```

3. Start the development server:
   ```bash
   bun dev
   ```

The application will be available at `http://localhost:5174` or the next available port.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (auth, websocket)
├── pages/         # Page components
├── styles/        # Global styles and Tailwind config
└── types/         # TypeScript type definitions
```

## Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build
- `bun lint` - Run ESLint
- `bun format` - Format code with Prettier

## Development

- The frontend expects a Strapi backend running on port 1337
- WebSocket connection is established automatically on login
- Messages are stored in localStorage for persistence
- UI components use Tailwind CSS for styling
- The chat interface is optimized for both desktop and mobile

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:1337)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
