/**
 * ███████████████████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. BACKEND SERVER                                              █
 * █ Communication Hub for Animated Online Socializing                      █
 * █ Main application entry point                                           █
 * ███████████████████████████████████████████████████████████████████████████
 * 
 * This is the main entry point for the C.H.A.O.S. Backend API server.
 * It initializes the Fastify server and sets up all required plugins,
 * routes, and services.
 * 
 * @license MIT
 * @version 0.1.0
 */

import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import swagger from '@fastify/swagger';
import rateLimit from '@fastify/rate-limit';

import { initializeWebSocketServer } from './websocket/server';
import { registerRoutes } from './routes';
import { databasePlugin } from './plugins/database';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { configureSwagger } from './config/swagger';

// [GLOBALS] Define process level constants
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * [CORE] Initialize and configure the main Fastify server instance
 * This sets up all middleware, plugins, and core server functionality
 */
const buildServer = async (): Promise<FastifyInstance> => {
  // [INIT] Create the server instance with logging configuration
  const server = Fastify({
    logger: NODE_ENV === 'development',
    trustProxy: true, // Required for proper IP detection behind proxy
  });

  // [GLOBAL] Set up global error handler
  server.setErrorHandler(errorHandler);

  // [PLUGINS] Register required plugins
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback_development_secret_key',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  });

  await server.register(rateLimit, {
    max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
    timeWindow: process.env.RATE_LIMIT_TIMEWINDOW ? process.env.RATE_LIMIT_TIMEWINDOW : '1 minute',
  });

  // [DB] Initialize database connection
  await server.register(databasePlugin);

  // [API-DOCS] Register Swagger for API documentation
  await server.register(swagger, configureSwagger());

  // [WEBSOCKET] Register WebSocket server
  await server.register(websocket, {
    options: { maxPayload: 1048576 } // 1MB max payload
  });
  
  // [ROUTES] Register all API routes
  await server.register(registerRoutes);
  
  // [WEBSOCKET] Initialize WebSocket event handlers after all plugins 
  server.ready(() => {
    initializeWebSocketServer(server);
    logger.info('WebSocket server initialized');
  });

  return server;
};

/**
 * [BOOT] Application startup function
 * Initializes the server and starts listening on the configured port
 */
const startServer = async () => {
  try {
    const server = await buildServer();
    
    // [HEALTH] Add basic health check route
    server.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // [START] Begin listening for requests
    await server.listen({ port: PORT, host: HOST });
    
    logger.info(`
    ████████████████████████████████████████████████████
    █ C.H.A.O.S. Server started!                      █
    █ Environment: ${NODE_ENV.padEnd(33)}█
    █ Server listening at: http://${HOST}:${PORT}${' '.repeat(19-`${HOST}:${PORT}`.length)}█
    █ API Documentation: http://${HOST}:${PORT}/docs${' '.repeat(17-`${HOST}:${PORT}/docs`.length)}█
    ████████████████████████████████████████████████████
    `);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

// [EXEC] Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// [EXPORT] Export the server builder for testing
export { buildServer };
