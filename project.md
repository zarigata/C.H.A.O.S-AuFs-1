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
- Node.js with Fastify
- PostgreSQL + Prisma ORM
- Redis (caching, online presence)
- WebSockets for real-time
- JWT + Refresh tokens
- Zod for validation

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

## 📦 Architecture Overview:

### Frontend Architecture:
```
FrontEnd/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, sounds, etc.
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── chat/        # Chat-related components
│   │   ├── hub/         # Hub/server components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Base UI components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Application pages
│   ├── services/        # API service functions
│   ├── store/           # State management
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── vite-env.d.ts    # Vite type definitions
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore file
├── index.html           # HTML entry point
├── package.json         # Package configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

### Backend Architecture:
```
Backend/
├── prisma/              # Prisma ORM files
│   ├── migrations/      # Database migrations
│   └── schema.prisma    # Database schema
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── plugins/         # Fastify plugins
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── websocket/       # WebSocket handlers
│   └── index.ts         # Application entry point
├── .env                 # Environment variables
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore file
├── package.json         # Package configuration
└── tsconfig.json        # TypeScript configuration
```

## 🔒 Data Models:

### User
- id: UUID
- username: String
- email: String
- passwordHash: String
- displayName: String
- avatar: String
- status: Enum (ONLINE, AWAY, BUSY, OFFLINE)
- customStatus: String
- createdAt: DateTime
- updatedAt: DateTime

### Hub (Server)
- id: UUID
- name: String
- description: String
- icon: String
- ownerId: UUID (User)
- createdAt: DateTime
- updatedAt: DateTime

### Channel
- id: UUID
- name: String
- description: String
- type: Enum (TEXT, VOICE)
- hubId: UUID (Hub)
- createdAt: DateTime
- updatedAt: DateTime

### Message
- id: UUID
- content: String
- encrypted: Boolean
- senderId: UUID (User)
- channelId: UUID? (Channel)
- directMessageId: UUID? (DirectMessage)
- createdAt: DateTime
- updatedAt: DateTime

### DirectMessage
- id: UUID
- participantIds: UUID[] (User)
- createdAt: DateTime
- updatedAt: DateTime

### HubMember
- userId: UUID (User)
- hubId: UUID (Hub)
- role: Enum (OWNER, ADMIN, MODERATOR, MEMBER)
- nickname: String?
- joinedAt: DateTime

## 🔄 API Endpoints:

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### Users
- GET /api/users/me
- GET /api/users/:id
- PATCH /api/users/me
- GET /api/users/me/friends
- POST /api/users/me/friends/:id/request
- PATCH /api/users/me/friends/:id/accept
- DELETE /api/users/me/friends/:id

### Hubs
- GET /api/hubs
- POST /api/hubs
- GET /api/hubs/:id
- PATCH /api/hubs/:id
- DELETE /api/hubs/:id
- GET /api/hubs/:id/channels
- POST /api/hubs/:id/channels
- GET /api/hubs/:id/members
- POST /api/hubs/:id/members
- PATCH /api/hubs/:id/members/:userId

### Channels
- GET /api/channels/:id
- PATCH /api/channels/:id
- DELETE /api/channels/:id
- GET /api/channels/:id/messages
- POST /api/channels/:id/messages

### Direct Messages
- GET /api/direct-messages
- POST /api/direct-messages
- GET /api/direct-messages/:id
- GET /api/direct-messages/:id/messages
- POST /api/direct-messages/:id/messages

### WebSocket Events
- user:status (status updates)
- user:typing (typing indicators)
- message:new (new messages)
- message:update (edited messages)
- message:delete (deleted messages)
- hub:update (hub changes)
- channel:update (channel changes)
- friend:request (friend requests)
- friend:update (friend status changes)
