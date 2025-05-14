/**
 * ███████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. USER ROUTES                                     █
 * █ User profile management and status operations              █
 * ███████████████████████████████████████████████████████████████
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { verifyToken, extractTokenFromRequest } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// [SCHEMAS] Input validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  statusMessage: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
  themePreference: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['ONLINE', 'IDLE', 'DO_NOT_DISTURB', 'INVISIBLE', 'OFFLINE', 'CUSTOM']),
  statusMessage: z.string().max(100).optional(),
});

/**
 * [AUTH] Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (request: any, reply: any) => {
  try {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_ERROR');
    }
    
    const decoded = verifyToken(token);
    request.user = { id: decoded.userId, username: decoded.username };
  } catch (error) {
    reply.code(401).send({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      },
    });
  }
};

/**
 * [ROUTES] User management routes plugin
 * Handles profile management, status updates, and user querying
 */
const userRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  // [HOOK] Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticate);
  
  /**
   * [PROFILE] Get current user profile
   * GET /api/users/me
   */
  fastify.get('/me', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                displayName: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
                status: { type: 'string' },
                statusMessage: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [FETCH] Get user data from database
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          status: true,
          statusMessage: true,
          createdAt: true,
          themePreference: true,
        },
      });
      
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [RESPOND] Return user profile data
      return reply.send({
        success: true,
        user,
      });
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  });
  
  /**
   * [PROFILE] Update current user profile
   * PATCH /api/users/me
   */
  fastify.patch('/me', {
    schema: {
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string', minLength: 1, maxLength: 50 },
          statusMessage: { type: 'string', maxLength: 100 },
          avatarUrl: { type: 'string', format: 'uri' },
          themePreference: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                displayName: { type: 'string' },
                statusMessage: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', nullable: true },
                themePreference: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [PARSE] Validate request body
      const updates = updateProfileSchema.parse(request.body);
      
      // [UPDATE] Apply changes to user profile
      const updatedUser = await fastify.prisma.user.update({
        where: { id: request.user.id },
        data: updates,
        select: {
          id: true,
          displayName: true,
          statusMessage: true,
          avatarUrl: true,
          themePreference: true,
        },
      });
      
      // [RESPOND] Return updated profile data
      return reply.send({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      // [ERROR] Handle validation errors
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error updating user profile:', error);
      throw error;
    }
  });
  
  /**
   * [STATUS] Update user status
   * POST /api/users/status
   */
  fastify.post('/status', {
    schema: {
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { 
            type: 'string', 
            enum: ['ONLINE', 'IDLE', 'DO_NOT_DISTURB', 'INVISIBLE', 'OFFLINE', 'CUSTOM'] 
          },
          statusMessage: { type: 'string', maxLength: 100 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string' },
            statusMessage: { type: 'string', nullable: true },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [PARSE] Validate request body
      const { status, statusMessage } = updateStatusSchema.parse(request.body);
      
      // [UPDATE] Update user status
      await fastify.prisma.user.update({
        where: { id: request.user.id },
        data: {
          status,
          statusMessage: statusMessage || null,
        },
      });
      
      // [BROADCAST] Trigger WebSocket status update (handled by WS server)
      
      // [RESPOND] Confirm status update
      return reply.send({
        success: true,
        status,
        statusMessage: statusMessage || null,
      });
    } catch (error) {
      // [ERROR] Handle validation errors
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error updating user status:', error);
      throw error;
    }
  });
  
  /**
   * [SEARCH] Search for users
   * GET /api/users/search
   */
  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 2 },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
        required: ['query'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  displayName: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                pages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [PARSE] Get query parameters
      const { query } = request.query;
      const page = parseInt(request.query.page) || 1;
      const limit = parseInt(request.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // [SEARCH] Find users matching query
      const [users, total] = await Promise.all([
        fastify.prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
            // Don't return the requesting user
            NOT: { id: request.user.id },
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            status: true,
          },
          skip: offset,
          take: limit,
        }),
        fastify.prisma.user.count({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
            NOT: { id: request.user.id },
          },
        }),
      ]);
      
      // [CALCULATE] Calculate pagination values
      const pages = Math.ceil(total / limit);
      
      // [RESPOND] Return search results with pagination
      return reply.send({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      });
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  });
  
  /**
   * [PROFILE] Get user profile by ID
   * GET /api/users/:id
   */
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
                status: { type: 'string' },
                statusMessage: { type: 'string', nullable: true },
              },
            },
            isFriend: { type: 'boolean' },
            pendingRequest: { 
              type: 'object', 
              nullable: true,
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                senderId: { type: 'string' },
                receiverId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // [FETCH] Get user data
      const user = await fastify.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          status: true,
          statusMessage: true,
        },
      });
      
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Check friendship status
      const friendship = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId1: request.user.id, userId2: id },
            { userId1: id, userId2: request.user.id },
          ],
        },
      });
      
      // [CHECK] Check for pending friend requests
      const pendingRequest = await fastify.prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: request.user.id, receiverId: id },
            { senderId: id, receiverId: request.user.id },
          ],
          status: 'PENDING',
        },
      });
      
      // [RESPOND] Return user profile with relationship info
      return reply.send({
        success: true,
        user,
        isFriend: !!friendship,
        pendingRequest: pendingRequest || null,
      });
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  });
});

export default userRoutes;
