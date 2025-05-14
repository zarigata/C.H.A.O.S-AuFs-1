// =============================================
// ============== CODEX CHANNEL ===============
// =============================================
// Channel routes for C.H.A.O.S.
// Handles channel management and messages within hubs

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'VOICE']).optional(),
});

const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  encrypted: z.boolean().default(false),
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

// Channel routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);
  
  // =============================================
  // ============== GET CHANNEL =================
  // =============================================
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
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            type: { type: 'string' },
            hubId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            hub: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      
      // Get channel with hub
      const channel = await prisma.channel.findUnique({
        where: { id },
        include: {
          hub: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      if (!channel) {
        return reply.code(404).send({ error: 'Channel not found' });
      }
      
      // Check if user is a member of the hub
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: channel.hubId,
          },
        },
      });
      
      if (!member) {
        return reply.code(403).send({ error: 'Not a member of this hub' });
      }
      
      return channel;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== UPDATE CHANNEL ==============
  // =============================================
  fastify.patch('/:id', {
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
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string', enum: ['TEXT', 'VOICE'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            type: { type: 'string' },
            hubId: { type: 'string' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      const updateData = updateChannelSchema.parse(request.body);
      
      // Get channel
      const channel = await prisma.channel.findUnique({
        where: { id },
        include: {
          hub: true,
        },
      });
      
      if (!channel) {
        return reply.code(404).send({ error: 'Channel not found' });
      }
      
      // Check if user is owner or admin of the hub
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: channel.hubId,
          },
        },
      });
      
      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN' && member.role !== 'MODERATOR')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      // Update channel
      const updatedChannel = await prisma.channel.update({
        where: { id },
        data: updateData,
      });
      
      return updatedChannel;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== DELETE CHANNEL ==============
  // =============================================
  fastify.delete('/:id', {
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
      const { id } = request.params as { id: string };
      
      // Get channel
      const channel = await prisma.channel.findUnique({
        where: { id },
        include: {
          hub: true,
        },
      });
      
      if (!channel) {
        return reply.code(404).send({ error: 'Channel not found' });
      }
      
      // Check if user is owner or admin of the hub
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: channel.hubId,
          },
        },
      });
      
      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      // Prevent deletion of the last channel
      const channelCount = await prisma.channel.count({
        where: { hubId: channel.hubId },
      });
      
      if (channelCount <= 1) {
        return reply.code(400).send({ error: 'Cannot delete the last channel in a hub' });
      }
      
      // Delete channel
      await prisma.channel.delete({
        where: { id },
      });
      
      return { message: 'Channel deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET CHANNEL MESSAGES ========
  // =============================================
  fastify.get('/:id/messages', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          before: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              encrypted: { type: 'boolean' },
              senderId: { type: 'string' },
              channelId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              sender: {
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
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      const query = request.query as { limit?: number, before?: string };
      
      // Get channel
      const channel = await prisma.channel.findUnique({
        where: { id },
      });
      
      if (!channel) {
        return reply.code(404).send({ error: 'Channel not found' });
      }
      
      // Check if user is a member of the hub
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: channel.hubId,
          },
        },
      });
      
      if (!member) {
        return reply.code(403).send({ error: 'Not a member of this hub' });
      }
      
      // Build query conditions
      const limit = query.limit || 50;
      const conditions: any = { channelId: id };
      
      if (query.before) {
        conditions.createdAt = { lt: new Date(query.before) };
      }
      
      // Get messages
      const messages = await prisma.message.findMany({
        where: conditions,
        orderBy: { createdAt: 'desc' },
        take: limit,
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
      
      // Return messages in reverse order (oldest first)
      return messages.reverse();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== SEND CHANNEL MESSAGE ========
  // =============================================
  fastify.post('/:id/messages', {
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
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 2000 },
          encrypted: { type: 'boolean' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            encrypted: { type: 'boolean' },
            senderId: { type: 'string' },
            channelId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            sender: {
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
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      const messageData = createMessageSchema.parse(request.body);
      
      // Get channel
      const channel = await prisma.channel.findUnique({
        where: { id },
      });
      
      if (!channel) {
        return reply.code(404).send({ error: 'Channel not found' });
      }
      
      // Check if user is a member of the hub
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: channel.hubId,
          },
        },
      });
      
      if (!member) {
        return reply.code(403).send({ error: 'Not a member of this hub' });
      }
      
      // Create message
      const message = await prisma.message.create({
        data: {
          content: messageData.content,
          encrypted: messageData.encrypted,
          senderId: userId,
          channelId: id,
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
      
      // Emit WebSocket event (handled separately)
      
      return reply.code(201).send(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
});
