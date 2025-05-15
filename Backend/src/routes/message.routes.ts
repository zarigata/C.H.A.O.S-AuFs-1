// =============================================
// ============== CODEX MESSAGE ==============
// =============================================
// Message routes for C.H.A.O.S.
// Handles message operations like editing and deleting

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const updateMessageSchema = z.object({
  content: z.string().min(1).max(2000),
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

// Message routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);
  
  // =============================================
  // ============== EDIT MESSAGE ================
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
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 2000 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            encrypted: { type: 'boolean' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      const updateData = updateMessageSchema.parse(request.body);
      
      // Get message
      const message = await prisma.message.findUnique({
        where: { id },
      });
      
      if (!message) {
        return reply.code(404).send({ error: 'Message not found' });
      }
      
      // Check if user is the sender
      if (message.senderId !== userId) {
        return reply.code(403).send({ error: 'You can only edit your own messages' });
      }
      
      // Check if message is in a channel
      if (message.channelId) {
        // Check if user is still a member of the hub
        const channel = await prisma.channel.findUnique({
          where: { id: message.channelId },
          select: { hubId: true },
        });
        
        if (channel) {
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
        }
      } else if (message.directMessageId) {
        // Check if user is still a participant in the DM
        const participant = await prisma.directMessageParticipant.findUnique({
          where: {
            directMessageId_userId: {
              directMessageId: message.directMessageId,
              userId,
            },
          },
        });
        
        if (!participant) {
          return reply.code(403).send({ error: 'Not a participant in this conversation' });
        }
      }
      
      // Update message
      const updatedMessage = await prisma.message.update({
        where: { id },
        data: {
          content: updateData.content,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          content: true,
          encrypted: true,
          updatedAt: true,
        },
      });
      
      // Emit WebSocket event (handled separately)
      
      return updatedMessage;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== DELETE MESSAGE ==============
  // =============================================
  fastify.delete('/message-delete/:id', {
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
      
      // Get message
      const message = await prisma.message.findUnique({
        where: { id },
        include: {
          channel: {
            select: {
              hubId: true,
            },
          },
        },
      });
      
      if (!message) {
        return reply.code(404).send({ error: 'Message not found' });
      }
      
      // Check if user is the sender or has moderation permissions
      let canDelete = message.senderId === userId;
      
      if (!canDelete && message.channel) {
        // Check if user is a moderator or higher in the hub
        const member = await prisma.hubMember.findUnique({
          where: {
            userId_hubId: {
              userId,
              hubId: message.channel.hubId,
            },
          },
        });
        
        if (member && ['OWNER', 'ADMIN', 'MODERATOR'].includes(member.role)) {
          canDelete = true;
        }
      }
      
      if (!canDelete) {
        return reply.code(403).send({ error: 'Insufficient permissions to delete this message' });
      }
      
      // Delete message
      await prisma.message.delete({
        where: { id },
      });
      
      // Emit WebSocket event (handled separately)
      
      return { message: 'Message deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
});
