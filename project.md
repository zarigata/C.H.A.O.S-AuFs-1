# C.H.A.O.S. - Communication Hub for Animated Online Socializing

## 🎯 Project Vision
Create a modern, privacy-focused communication platform that brings back the nostalgia of MSN Messenger while incorporating modern features and security standards.

## 🚀 Core Features
- **Real-time Messaging**: Instant messaging with read receipts and typing indicators
- **Contact Management**: Friend lists with online/offline status
- **End-to-End Encryption**: Secure private conversations
- **Theme Support**: Light/dark mode with custom theming
- **Cross-Platform**: Native desktop apps for Windows, macOS, and Linux
- **Modern UI/UX**: Clean, responsive interface with smooth animations

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **UI**: TailwindCSS + Shadcn/UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Bundler**: Vite
- **Desktop**: Tauri

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSockets (via Socket.IO)
- **Caching**: Redis
- **Authentication**: JWT + Refresh Tokens

### DevOps
- **Testing**: Vitest (unit), Playwright (e2e)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Linting/Formatting**: ESLint + Prettier

## 📁 Project Structure
```
C.H.A.O.S/
├── Frontend/           # Tauri + React frontend
├── Backend/            # Fastify API server
├── Shared/             # Shared types and utilities
├── Tests/              # E2E and integration tests
└── docs/               # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8.x
- Rust (for Tauri)
- PostgreSQL 14+
- Redis 6+

### Development Setup
```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:backend
pnpm dev:frontend
```

## 📝 License
MIT
