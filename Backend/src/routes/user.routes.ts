// =============================================
// ============== CODEX USER =================
// =============================================
// User routes for C.H.A.O.S.
// Handles user profile management, friend requests, and status updates

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatar: z.string().optional(),
  customStatus: z.string().max(100).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['ONLINE', 'AWAY', 'BUSY', 'OFFLINE']),
});

// Authentication middleware
async function authenticate(request: any, reply: any) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = request.server.jwt.verify(token) as { userId: string, type: string };
    
    if (decoded.type !== 'access') {
      return reply.code(401).send({ error: 'Invalid token type' });
    }
    
    // Attach user ID to request
    request.userId = decoded.userId;
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

// User routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);
  
  // =============================================
  // ============== GET CURRENT USER ============
  // =============================================
  fastify.get('/me', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            status: { type: 'string' },
            customStatus: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatar: true,
          status: true,
          customStatus: true,
          createdAt: true,
        },
      });
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return user;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET USER BY ID ==============
  // =============================================
  fastify.get('/user-details/:id', {
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
            id: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            status: { type: 'string' },
            customStatus: { type: 'string', nullable: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          status: true,
          customStatus: true,
        },
      });
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return user;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== UPDATE PROFILE ==============
  // =============================================
  fastify.patch('/me', {
    schema: {
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string', minLength: 1, maxLength: 50 },
          avatar: { type: 'string' },
          customStatus: { type: 'string', maxLength: 100 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            customStatus: { type: 'string', nullable: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const updateData = updateProfileSchema.parse(request.body);
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          customStatus: true,
        },
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== UPDATE STATUS ===============
  // =============================================
  fastify.patch('/me/status', {
    schema: {
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { status } = updateStatusSchema.parse(request.body);
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          status: true,
        },
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET FRIENDS =================
  // =============================================
  fastify.get('/me/friends', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              displayName: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              status: { type: 'string' },
              customStatus: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // Get accepted friend requests where the user is either sender or receiver
      const friendRequests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
          status: 'ACCEPTED',
        },
        select: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              status: true,
              customStatus: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              status: true,
              customStatus: true,
            },
          },
        },
      });
      
      // Extract friend data
      const friends = friendRequests.map(request => {
        return request.senderId === userId ? request.receiver : request.sender;
      });
      
      return friends;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== SEND FRIEND REQUEST =========
  // =============================================
  fastify.post('/me/friends/:id/request', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const senderId = request.userId;
      const { id: receiverId } = request.params as { id: string };
      
      // Check if users are the same
      if (senderId === receiverId) {
        return reply.code(400).send({ error: 'Cannot send friend request to yourself' });
      }
      
      // Check if receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });
      
      if (!receiver) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      // Check if friend request already exists
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
      });
      
      if (existingRequest) {
        return reply.code(409).send({ 
          error: 'Friend request already exists',
          status: existingRequest.status,
        });
      }
      
      // Create friend request
      const friendRequest = await prisma.friendRequest.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });
      
      return reply.code(201).send(friendRequest);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== ACCEPT FRIEND REQUEST =======
  // =============================================
  fastify.patch('/me/friends/:id/accept', {
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
            id: { type: 'string' },
            status: { type: 'string' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id: senderId } = request.params as { id: string };
      
      // Find pending friend request
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId: userId,
          status: 'PENDING',
        },
      });
      
      if (!friendRequest) {
        return reply.code(404).send({ error: 'Friend request not found' });
      }
      
      // Accept friend request
      const updatedRequest = await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: 'ACCEPTED' },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });
      
      return updatedRequest;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== REJECT FRIEND REQUEST =======
  // =============================================
  fastify.patch('/me/friends/:id/reject', {
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
            id: { type: 'string' },
            status: { type: 'string' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id: senderId } = request.params as { id: string };
      
      // Find pending friend request
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId: userId,
          status: 'PENDING',
        },
      });
      
      if (!friendRequest) {
        return reply.code(404).send({ error: 'Friend request not found' });
      }
      
      // Reject friend request
      const updatedRequest = await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: 'REJECTED' },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });
      
      return updatedRequest;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== REMOVE FRIEND ===============
  // =============================================
  fastify.delete('/me/friends/:id', {
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
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id: friendId } = request.params as { id: string };
      
      // Delete friend request (in either direction)
      await prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
          status: 'ACCEPTED',
        },
      });
      
      return { message: 'Friend removed successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
});
