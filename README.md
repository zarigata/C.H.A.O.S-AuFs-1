# C.H.A.O.S. (Communication Hub for Animated Online Socializing)

<div align="center">
  <img src="./FrontEnd/public/chaos-logo.png" alt="C.H.A.O.S. Logo" width="200" />
  <h3>A modern communication platform with nostalgic MSN Messenger vibes</h3>
</div>

## 🌟 Overview

C.H.A.O.S. is a full-stack communication platform that combines the nostalgic charm of MSN Messenger with modern Discord-like features. Built with security, real-time communication, and cross-platform compatibility in mind.

## ✨ Features

- **Real-time Messaging** - Instant message delivery with typing indicators
- **Hub-based Communities** - Create and join community hubs with multiple channels
- **End-to-End Encryption** - Secure private messaging
- **MSN-inspired UI** - Nostalgic design elements with modern UX
- **Cross-platform** - Desktop apps for Linux and macOS via Tauri
- **Theme Switching** - Light, dark, and classic MSN themes
- **Status Indicators** - Online, away, busy, and offline statuses

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- TailwindCSS + Shadcn/UI
- Framer Motion for animations
- Vite for development
- Tauri for native desktop apps

### Backend
- Node.js with Fastify
- WebSockets for real-time communication
- PostgreSQL with Prisma ORM
- Redis for caching and presence tracking
- JWT + Refresh Token authentication

### Testing
- Vitest/Jest for unit testing
- Supertest for API testing
- Playwright for end-to-end testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PNPM
- PostgreSQL
- Redis

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/chaos.git
cd chaos
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Start the development servers
```bash
# Terminal 1: Start the backend
pnpm run dev:backend

# Terminal 2: Start the frontend
pnpm run dev:frontend
```

5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Inspired by MSN Messenger and Discord
- Built with modern web technologies
- Created with ❤️ by [Your Name]
