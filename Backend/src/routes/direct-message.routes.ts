// =============================================
// ============== CODEX DIRECT MESSAGES ========
// =============================================
// Direct Message routes for C.H.A.O.S.
// Handles private conversations between users with encryption support

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const createDirectMessageSchema = z.object({
  recipientId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  encrypted: z.boolean().default(true), // Default to encrypted for DMs
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

// Direct Message routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);
  
  // =============================================
  // ============== GET USER'S DMS ==============
  // =============================================
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              participant: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  status: { type: 'string' },
                },
              },
              lastMessage: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  content: { type: 'string' },
                  encrypted: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
              unreadCount: { type: 'integer' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // Get all direct message conversations where user is a participant
      const directMessageParticipants = await prisma.directMessageParticipant.findMany({
        where: { userId },
        include: {
          directMessage: true,
        },
      });
      
      // Get details for each conversation
      const conversations = await Promise.all(
        directMessageParticipants.map(async (dmp) => {
          // Get the other participant
          const otherParticipant = await prisma.directMessageParticipant.findFirst({
            where: {
              directMessageId: dmp.directMessageId,
              userId: { not: userId },
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  status: true,
                },
              },
            },
          });
          
          // Get the last message
          const lastMessage = await prisma.message.findFirst({
            where: { directMessageId: dmp.directMessageId },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              encrypted: true,
              createdAt: true,
              senderId: true,
            },
          });
          
          // Count unread messages (simplified - would need a read receipts system)
          const unreadCount = lastMessage && lastMessage.senderId !== userId ? 1 : 0;
          
          return {
            id: dmp.directMessageId,
            createdAt: dmp.directMessage.createdAt,
            updatedAt: dmp.directMessage.updatedAt,
            participant: otherParticipant?.user,
            lastMessage,
            unreadCount,
          };
        })
      );
      
      // Sort by last message time (newest first)
      conversations.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || a.createdAt;
        const timeB = b.lastMessage?.createdAt || b.createdAt;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      
      return conversations;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== CREATE NEW DM ===============
  // =============================================
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['recipientId'],
        properties: {
          recipientId: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            participant: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                avatar: { type: 'string', nullable: true },
                status: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { recipientId } = createDirectMessageSchema.parse(request.body);
      
      // Check if recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          status: true,
        },
      });
      
      if (!recipient) {
        return reply.code(404).send({ error: 'Recipient not found' });
      }
      
      // Check if conversation already exists
      const existingConversation = await prisma.directMessageParticipant.findFirst({
        where: {
          userId,
          directMessage: {
            participants: {
              some: {
                userId: recipientId,
              },
            },
          },
        },
        include: {
          directMessage: true,
        },
      });
      
      if (existingConversation) {
        return reply.code(200).send({
          id: existingConversation.directMessageId,
          createdAt: existingConversation.directMessage.createdAt,
          participant: recipient,
        });
      }
      
      // Create new direct message conversation
      const directMessage = await prisma.directMessage.create({
        data: {
          participants: {
            create: [
              { userId },
              { userId: recipientId },
            ],
          },
        },
      });
      
      return reply.code(201).send({
        id: directMessage.id,
        createdAt: directMessage.createdAt,
        participant: recipient,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET DM BY ID ================
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
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            participant: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                avatar: { type: 'string', nullable: true },
                status: { type: 'string' },
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
      
      // Check if user is a participant
      const participant = await prisma.directMessageParticipant.findUnique({
        where: {
          directMessageId_userId: {
            directMessageId: id,
            userId,
          },
        },
        include: {
          directMessage: true,
        },
      });
      
      if (!participant) {
        return reply.code(404).send({ error: 'Direct message conversation not found' });
      }
      
      // Get the other participant
      const otherParticipant = await prisma.directMessageParticipant.findFirst({
        where: {
          directMessageId: id,
          userId: { not: userId },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              status: true,
            },
          },
        },
      });
      
      return {
        id: participant.directMessage.id,
        createdAt: participant.directMessage.createdAt,
        updatedAt: participant.directMessage.updatedAt,
        participant: otherParticipant?.user,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET DM MESSAGES =============
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
              directMessageId: { type: 'string' },
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
      
      // Check if user is a participant
      const participant = await prisma.directMessageParticipant.findUnique({
        where: {
          directMessageId_userId: {
            directMessageId: id,
            userId,
          },
        },
      });
      
      if (!participant) {
        return reply.code(404).send({ error: 'Direct message conversation not found' });
      }
      
      // Build query conditions
      const limit = query.limit || 50;
      const conditions: any = { directMessageId: id };
      
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
  // ============== SEND DM MESSAGE =============
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
            directMessageId: { type: 'string' },
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
      const messageData = sendMessageSchema.parse(request.body);
      
      // Check if user is a participant
      const participant = await prisma.directMessageParticipant.findUnique({
        where: {
          directMessageId_userId: {
            directMessageId: id,
            userId,
          },
        },
      });
      
      if (!participant) {
        return reply.code(404).send({ error: 'Direct message conversation not found' });
      }
      
      // Create message
      const message = await prisma.message.create({
        data: {
          content: messageData.content,
          encrypted: messageData.encrypted,
          senderId: userId,
          directMessageId: id,
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
      
      // Update conversation timestamp
      await prisma.directMessage.update({
        where: { id },
        data: { updatedAt: new Date() },
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
