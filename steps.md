# 🧭 Development Roadmap: C.H.A.O.S.

---

## Phase 1: Project Setup

### 1.1 Initialize Monorepo
- Use pnpm / TurboRepo
- Create `frontend`, `backend`, `shared`

### 1.2 Setup Versioning/CI
- GitHub repo with actions for lint/build/test
- ESLint, Prettier, Commitlint

---

## Phase 2: Backend API

### 2.1 Init Backend
- Fastify/NestJS scaffolding
- Health route
- Swagger doc integration

### 2.2 Auth System
- Register/Login (JWT + refresh token)
- Password hashing (bcrypt)
- Token refresh endpoint

### 2.3 User Management
- Get user data
- Update profile, avatar, status
- Delete account

### 2.4 Real-Time WebSocket Layer
- WS server setup
- Online presence
- Real-time messages

### 2.5 DMs and Groups
- Message schema (Prisma)
- Send/receive messages
- Group creation/invites
- Hub/channel architecture

### 2.6 Deploy Backend
- Docker + Docker Compose
- Setup SSL
- PostgreSQL
- PM2/Nginx

---

## Phase 3: Frontend

### 3.1 Base Setup
- Vite + React + TS
- Tailwind + Shadcn
- Theme system

### 3.2 Layout
- Left-side navigation (à la MSN)
- Top profile bar
- Central chat view
- Component folder architecture

### 3.3 Messaging
- Send/receive text messages
- Typing indicator
- Emoji picker
- Status badge

### 3.4 Groups/Hubs
- Create hub
- Add members
- Channel tabs
- Chat moderation

### 3.5 Real-time Integration
- Connect WebSocket
- Update UI with live data
- Online/offline detection

### 3.6 Native App
- Integrate with Tauri
- Auto-updates
- System tray support

---

## Phase 4: Testing

### 4.1 Backend
- Unit: Jest
- API: Supertest
- Auth, messages, errors

### 4.2 Frontend
- Component: Vitest
- Integration: React Testing Library
- E2E: Playwright

---

## Phase 5: Finalization

- Polish UI/UX
- Add sound effects, animations
- Optimize bundles
- Setup CI/CD pipelines
- Write user docs
