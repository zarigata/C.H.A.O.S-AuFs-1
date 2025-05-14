// =============================================
// ============== CODEX FRIENDS ===============
// =============================================
// Friend routes for C.H.A.O.S.
// Handles friend requests and relationships

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const updateFriendRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'BLOCKED']),
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

// Friend routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);
  
  // =============================================
  // ============== GET FRIENDS =================
  // =============================================
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            friends: {
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
            pending: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  senderId: { type: 'string' },
                  receiverId: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      displayName: { type: 'string' },
                      avatar: { type: 'string', nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // Get accepted friend requests
      const acceptedRequests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
          status: 'ACCEPTED',
        },
        include: {
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
      const friends = acceptedRequests.map(request => {
        return request.senderId === userId ? request.receiver : request.sender;
      });
      
      // Get pending friend requests (received)
      const pendingRequests = await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });
      
      // Format pending requests
      const pending = pendingRequests.map(request => ({
        id: request.id,
        senderId: request.senderId,
        receiverId: request.receiverId,
        status: request.status,
        createdAt: request.createdAt,
        user: request.sender,
      }));
      
      return {
        friends,
        pending,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== SEND FRIEND REQUEST =========
  // =============================================
  fastify.post('/request/:userId', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
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
      const { userId: receiverId } = request.params as { userId: string };
      
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
  // ============== UPDATE FRIEND REQUEST =======
  // =============================================
  fastify.patch('/request/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['ACCEPTED', 'REJECTED', 'BLOCKED'] },
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
      const { id } = request.params as { id: string };
      const { status } = updateFriendRequestSchema.parse(request.body);
      
      // Find friend request
      const friendRequest = await prisma.friendRequest.findUnique({
        where: { id },
      });
      
      if (!friendRequest) {
        return reply.code(404).send({ error: 'Friend request not found' });
      }
      
      // Check if user is the receiver
      if (friendRequest.receiverId !== userId) {
        return reply.code(403).send({ error: 'Only the recipient can update a friend request' });
      }
      
      // Update friend request
      const updatedRequest = await prisma.friendRequest.update({
        where: { id },
        data: { status },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });
      
      return updatedRequest;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== REMOVE FRIEND ===============
  // =============================================
  fastify.delete('/:userId', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
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
      const { userId: friendId } = request.params as { userId: string };
      
      // Delete friend request (in either direction)
      const result = await prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
          status: 'ACCEPTED',
        },
      });
      
      if (result.count === 0) {
        return reply.code(404).send({ error: 'Friend relationship not found' });
      }
      
      return { message: 'Friend removed successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
});
