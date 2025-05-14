/**
 * ████████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. DATABASE PLUGIN                                 █
 * █ Prisma ORM integration with Fastify                        █
 * ████████████████████████████████████████████████████████████████
 */

import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// [DB-INSTANCE] Create main Prisma client instance
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// [DEBUG] Log database queries in development mode
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug(`[PRISMA-QUERY] ${e.query} [${e.duration}ms]`);
  });
  
  prisma.$on('error', (e: any) => {
    logger.error('[PRISMA-ERROR]', e);
  });
}

/**
 * [PLUGIN] Database plugin
 * Decorates Fastify instance with Prisma client
 * Handles graceful connection management
 */
const databasePlugin: FastifyPluginAsync = fp(async (fastify) => {
  // [INIT] Connect to the database
  try {
    await prisma.$connect();
    logger.info('[DB] Successfully connected to the database');
    
    // [INJECT] Add prisma client to Fastify instance
    fastify.decorate('prisma', prisma);
    
    // [CLEANUP] Close DB connection when server shuts down
    fastify.addHook('onClose', async () => {
      logger.info('[DB] Closing database connection');
      await prisma.$disconnect();
    });
  } catch (error) {
    logger.error('[DB] Failed to connect to the database:', error);
    throw error;
  }
});

// [TYPES] Type declaration for Fastify instance with Prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export { databasePlugin, prisma };
