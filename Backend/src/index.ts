// =============================================
// ============== CODEX MAIN ==================
// =============================================
// C.H.A.O.S. Backend Entry Point
// Communication Hub for Animated Online Socializing
// Main server initialization and configuration

import Fastify, { FastifyInstance } from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import swagger from '@fastify/swagger';

// Import route plugins
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import hubRoutes from './routes/hub.routes';
import channelRoutes from './routes/channel.routes';
import messageRoutes from './routes/message.routes';
import friendRoutes from './routes/friend.routes';
import directMessageRoutes from './routes/direct-message.routes';
// Temporarily disable AI routes
// import { aiAssistantRoutes } from './routes/ai-assistant.routes';

// Import WebSocket handler
import setupWebsocketHandlers from './websocket';

// Load environment variables
dotenv.config();

// Create Fastify instance
const server: FastifyInstance = Fastify({
  logger: true,
  trustProxy: true,
});

// Register plugins
async function setupServer() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    });

    // Register JWT
    await server.register(jwt, {
      secret: process.env.JWT_SECRET || 'supersecretkey',
    });

    // Register WebSocket
    await server.register(websocket);

    // Register Swagger
    await server.register(swagger, {
      routePrefix: '/documentation',
      swagger: {
        info: {
          title: 'C.H.A.O.S. API',
          description: 'API documentation for C.H.A.O.S. (Communication Hub for Animated Online Socializing)',
          version: '0.1.0',
        },
        host: 'localhost:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
      exposeRoute: true,
    });

    // Register route plugins
    await server.register(authRoutes, { prefix: '/api/auth' });
    await server.register(userRoutes, { prefix: '/api/users' });
    await server.register(hubRoutes, { prefix: '/api/hubs' });
    await server.register(channelRoutes, { prefix: '/api/channels' });
    await server.register(messageRoutes, { prefix: '/api/messages' });
    await server.register(friendRoutes, { prefix: '/api/friends' });
    await server.register(directMessageRoutes, { prefix: '/api/direct-messages' });
    // Temporarily disable AI routes
    // await server.register(aiAssistantRoutes, { prefix: '/api/ai' });

    // Setup WebSocket handlers
    setupWebsocketHandlers(server);

    // Health check route
    server.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Start server
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    console.log(`Server is running on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Run the server
setupServer();
