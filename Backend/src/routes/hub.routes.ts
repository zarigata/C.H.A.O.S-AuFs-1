// =============================================
// ============== CODEX HUB ==================
// =============================================
// Hub routes for C.H.A.O.S.
// Handles community server management, channels, and members

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const createHubSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
});

const updateHubSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
});

const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'VOICE']).default('TEXT'),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']).default('MEMBER'),
});

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']),
  nickname: z.string().max(50).optional(),
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

// Hub routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // Add authentication hook to all routes
  fastify.addHook('preHandler', authenticate);
  
  // =============================================
  // ============== CREATE HUB =================
  // =============================================
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          icon: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            ownerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const hubData = createHubSchema.parse(request.body);
      
      // Create hub
      const hub = await prisma.hub.create({
        data: {
          ...hubData,
          ownerId: userId,
        },
      });
      
      // Add owner as member with OWNER role
      await prisma.hubMember.create({
        data: {
          userId,
          hubId: hub.id,
          role: 'OWNER',
        },
      });
      
      // Create default "general" text channel
      await prisma.channel.create({
        data: {
          name: 'general',
          description: 'General discussion',
          type: 'TEXT',
          hubId: hub.id,
        },
      });
      
      return reply.code(201).send(hub);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET USER'S HUBS =============
  // =============================================
  fastify.get('/hub-list', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
              ownerId: { type: 'string' },
              role: { type: 'string' },
              memberCount: { type: 'integer' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      
      // Get hubs where user is a member
      const hubMembers = await prisma.hubMember.findMany({
        where: { userId },
        include: {
          hub: true,
        },
      });
      
      // Get member count for each hub
      const hubsWithMemberCount = await Promise.all(
        hubMembers.map(async (member) => {
          const memberCount = await prisma.hubMember.count({
            where: { hubId: member.hub.id },
          });
          
          return {
            ...member.hub,
            role: member.role,
            memberCount,
          };
        })
      );
      
      return hubsWithMemberCount;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET HUB BY ID ===============
  // =============================================
  fastify.get('/hub-details/:id', {
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
            icon: { type: 'string', nullable: true },
            ownerId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            memberCount: { type: 'integer' },
            userRole: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      
      // Check if hub exists
      const hub = await prisma.hub.findUnique({
        where: { id },
      });
      
      if (!hub) {
        return reply.code(404).send({ error: 'Hub not found' });
      }
      
      // Check if user is a member
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: id,
          },
        },
      });
      
      if (!member) {
        return reply.code(403).send({ error: 'Not a member of this hub' });
      }
      
      // Get member count
      const memberCount = await prisma.hubMember.count({
        where: { hubId: id },
      });
      
      return {
        ...hub,
        memberCount,
        userRole: member.role,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== UPDATE HUB ==================
  // =============================================
  fastify.patch('/hub-update/:id', {
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
          icon: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            ownerId: { type: 'string' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      const updateData = updateHubSchema.parse(request.body);
      
      // Check if hub exists
      const hub = await prisma.hub.findUnique({
        where: { id },
      });
      
      if (!hub) {
        return reply.code(404).send({ error: 'Hub not found' });
      }
      
      // Check if user is owner or admin
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: id,
          },
        },
      });
      
      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      // Update hub
      const updatedHub = await prisma.hub.update({
        where: { id },
        data: updateData,
      });
      
      return updatedHub;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== DELETE HUB ==================
  // =============================================
  fastify.delete('/hub-delete/:id', {
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
      
      // Check if hub exists
      const hub = await prisma.hub.findUnique({
        where: { id },
      });
      
      if (!hub) {
        return reply.code(404).send({ error: 'Hub not found' });
      }
      
      // Check if user is owner
      if (hub.ownerId !== userId) {
        return reply.code(403).send({ error: 'Only the owner can delete a hub' });
      }
      
      // Delete hub (cascades to channels, messages, and members)
      await prisma.hub.delete({
        where: { id },
      });
      
      return { message: 'Hub deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== GET HUB CHANNELS ============
  // =============================================
  fastify.get('/:id/channels', {
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
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              type: { type: 'string' },
              hubId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = request.userId;
      const { id } = request.params as { id: string };
      
      // Check if user is a member
      const member = await prisma.hubMember.findUnique({
        where: {
          userId_hubId: {
            userId,
            hubId: id,
          },
        },
      });
      
      if (!member) {
        return reply.code(403).send({ error: 'Not a member of this hub' });
      }
      
      // Get channels
      const channels = await prisma.channel.findMany({
        where: { hubId: id },
        orderBy: { createdAt: 'asc' },
      });
      
      return channels;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
});
