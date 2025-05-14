/**
 * ████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. ROUTES REGISTRY                              █
 * █ Central registration point for all API routes           █
 * ████████████████████████████████████████████████████████████
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// [ROUTES] Import all route modules
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import messageRoutes from './message.routes';
import hubRoutes from './hub.routes';
import channelRoutes from './channel.routes';
import friendRoutes from './friend.routes';

/**
 * [REGISTER] Route registration plugin
 * Centralizes all route registration to maintain organization
 */
export const registerRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  // [LOG] Indicate route registration is starting
  fastify.log.info('Registering API routes...');

  // [AUTH] Authentication routes (public)
  fastify.register(authRoutes, { prefix: '/api/auth' });
  
  // [USER] User management routes (authenticated)
  fastify.register(userRoutes, { prefix: '/api/users' });
  
  // [MSG] Messaging routes (authenticated)
  fastify.register(messageRoutes, { prefix: '/api/messages' });
  
  // [HUB] Hub/server management routes (authenticated)
  fastify.register(hubRoutes, { prefix: '/api/hubs' });
  
  // [CHAN] Channel management routes (authenticated)
  fastify.register(channelRoutes, { prefix: '/api/channels' });
  
  // [FRIEND] Friend management routes (authenticated)
  fastify.register(friendRoutes, { prefix: '/api/friends' });
  
  // [DOCS] API documentation route
  fastify.get('/docs', (_, reply) => {
    reply.redirect('/documentation');
  });
});

/**
 * [EXPORT] Default export for fastify registration
 */
export default registerRoutes;
