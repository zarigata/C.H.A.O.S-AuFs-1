# C.H.A.O.S.

**Communication Hub for Animated Online Socializing**

![C.H.A.O.S. Logo](https://via.placeholder.com/150x150/245EDC/FFFFFF?text=C.H.A.O.S.)

A modern communication platform that combines the nostalgic feel of MSN Messenger with Discord-like community features. Built with security, privacy, and cross-platform compatibility in mind.

## 🚀 Features

- **Real-time messaging** with typing indicators and read receipts
- **End-to-end encrypted** private conversations
- **Community hubs** with multiple channels (Discord-like servers)
- **MSN-inspired status system** (Online, Away, Busy, Invisible)
- **Custom themes** with nostalgic MSN design options
- **Cross-platform** native applications via Tauri
- **Voice & video** communication (coming soon)
- **Bot framework** for automation and integration

## 🔧 Technology Stack

### Frontend
- React with TypeScript
- TailwindCSS with Shadcn UI components
- Tauri for native cross-platform applications
- Vite for fast development

### Backend
- Node.js with Fastify
- PostgreSQL with Prisma ORM
- Redis for caching and presence
- WebSockets for real-time communication
- JWT authentication

## 🏗️ Project Structure

```
C.H.A.O.S/
├── Frontend/                # React frontend application
│   ├── app/                 # App routes and layouts
│   ├── components/          # Reusable React components
│   └── ...
├── Backend/                 # Fastify server
│   ├── src/                 # Server source code
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── ...
│   └── prisma/              # Database schema and migrations
└── ...
```

## 📝 Prerequisites

- Node.js v18+ 
- PostgreSQL 14+
- Redis 6+
- Rust (for Tauri builds)

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and settings
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Python Integration (Optional)

For Python-based components and extensions:

1. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

### AI Integration with Ollama

C.H.A.O.S. supports integration with Ollama for AI-powered features.

1. [Install Ollama](https://ollama.ai/download)
2. Pull the default model:
   ```bash
   ollama pull llama3.2
   ```
3. Update the `.env` file with your Ollama settings:
   ```
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```

## 🖥️ Building Native Apps

### Tauri Build

To build native applications:

1. Ensure Rust is installed.
2. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
3. Build for your platform:
   ```bash
   npm run tauri build
   ```

Builds will be created for Windows, macOS, and Linux depending on your development environment.

## 🧪 Testing

Run backend tests:
```bash
cd Backend
npm test
```

Run frontend tests:
```bash
cd Frontend
npm test
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔍 Privacy

C.H.A.O.S. is designed with privacy in mind. All direct messages support end-to-end encryption, and we collect minimal user data. For self-hosting, all data remains under your control.

---

Built with ❤️ by the C.H.A.O.S. team
