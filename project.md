# C.H.A.O.S. (Communication Hub for Animated Online Socializing)

## 🎯 Project Goal:
Build a secure, scalable communication platform blending the charm of MSN Messenger with modern real-time messaging and group communication features akin to Discord.

## 💡 Core Features:
- Direct Messages with real-time typing/status
- Group Chats (channels within hubs)
- Voice/video/streaming integration (future)
- Themeable interface with legacy nostalgia
- Bot integration per hub
- Fully encrypted private messages
- Tauri-based native app for Linux/macOS

## 🔐 Security Focus:
- Secure token-based authentication
- Role-based access controls
- Encrypted DM storage and transmission
- No 3rd-party tracking

## 🧱 Technologies:
### Frontend:
- React, TypeScript
- TailwindCSS, Shadcn/UI
- Framer Motion
- Tauri (for native builds)

### Backend:
- Node.js (Fastify or NestJS)
- PostgreSQL + Prisma ORM
- Redis (caching, online presence)
- WebSockets for real-time
- JWT + Refresh tokens
- Zod/Joi for validation

### Testing:
- Vitest/Jest
- Supertest
- Playwright

## 🧪 Environments:
- Dev: Vite local server + Dockerized Postgres
- Staging: CI builds from GitHub Actions
- Prod: Secure server with Nginx + PM2

## 🔄 Future Additions:
- Voice/video streaming
- Mobile companion app
- Emoji packs & custom reactions
