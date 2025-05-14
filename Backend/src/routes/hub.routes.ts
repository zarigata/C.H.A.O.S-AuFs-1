/**
 * ███████████████████████████████████████████████████████████
 * █ C.H.A.O.S. HUB ROUTES                                  █
 * █ Server/hub management for community features           █
 * ███████████████████████████████████████████████████████████
 * 
 * [CODEX] Hubs are Discord-inspired servers where users can
 * gather in topic-specific communities with multiple channels
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { verifyToken, extractTokenFromRequest } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// [SCHEMAS] Input validation schemas
const createHubSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

const updateHubSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(100).optional(),
  expiresInHours: z.number().int().min(1).max(720).optional(),
});

/**
 * [AUTH] Authentication middleware
 * Secures all hub-related routes
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
 * [PERM] Check if user has admin/mod permissions in hub
 */
const hasHubPermission = async (
  prisma: any,
  userId: string,
  hubId: string,
  roles: string[] = ['OWNER', 'ADMIN', 'MODERATOR']
): Promise<boolean> => {
  const membership = await prisma.hubMembership.findFirst({
    where: {
      userId,
      hubId,
      role: { in: roles },
    },
  });
  
  return !!membership;
};

/**
 * [ROUTES] Hub management routes plugin
 * Handles community server functionality
 */
const hubRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  // [HOOK] Apply authentication to all routes
  fastify.addHook('preHandler', authenticate);
  
  /**
   * [CREATE] Create a new hub
   * POST /api/hubs
   */
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 50 },
          description: { type: 'string', maxLength: 500 },
          iconUrl: { type: 'string', format: 'uri' },
          isPublic: { type: 'boolean' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            hub: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                iconUrl: { type: 'string', nullable: true },
                isPublic: { type: 'boolean' },
                createdAt: { type: 'string' },
                ownerId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [PARSE] Validate request body
      const { name, description, iconUrl, isPublic } = createHubSchema.parse(request.body);
      
      // [CREATE] Create new hub record
      const hub = await fastify.prisma.hub.create({
        data: {
          name,
          description,
          iconUrl,
          isPublic: isPublic || false,
          ownerId: request.user.id,
          // [CHAN] Create default channels
          channels: {
            create: [
              {
                name: 'general',
                description: 'General discussion',
                type: 'TEXT',
              },
            ],
          },
          // [MEM] Add creator as owner
          members: {
            create: {
              userId: request.user.id,
              role: 'OWNER',
            },
          },
        },
      });
      
      // [RESPOND] Return the created hub
      return reply.code(201).send({
        success: true,
        hub,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error creating hub:', error);
      throw error;
    }
  });
  
  /**
   * [LIST] Get user's hubs
   * GET /api/hubs
   */
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            hubs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  iconUrl: { type: 'string', nullable: true },
                  isPublic: { type: 'boolean' },
                  memberCount: { type: 'integer' },
                  role: { type: 'string' },
                  unreadCount: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [FETCH] Get all hubs user is a member of
      const memberships = await fastify.prisma.hubMembership.findMany({
        where: {
          userId: request.user.id,
        },
        include: {
          hub: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      });
      
      // [TRANSFORM] Format hub data with membership info
      const hubs = memberships.map(membership => ({
        id: membership.hub.id,
        name: membership.hub.name,
        description: membership.hub.description,
        iconUrl: membership.hub.iconUrl,
        isPublic: membership.hub.isPublic,
        memberCount: membership.hub._count.members,
        role: membership.role,
        unreadCount: 0, // This would be calculated in a real implementation
      }));
      
      // [RESPOND] Return hubs list
      return reply.send({
        success: true,
        hubs,
      });
    } catch (error) {
      logger.error('Error fetching hubs:', error);
      throw error;
    }
  });
  
  /**
   * [DETAIL] Get hub details by ID
   * GET /api/hubs/:id
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
            hub: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                iconUrl: { type: 'string', nullable: true },
                isPublic: { type: 'boolean' },
                createdAt: { type: 'string' },
                ownerId: { type: 'string' },
                memberCount: { type: 'integer' },
                userRole: { type: 'string' },
                channels: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string', nullable: true },
                      type: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // [FETCH] Get hub details with membership check
      const hub = await fastify.prisma.hub.findUnique({
        where: { id },
        include: {
          channels: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
      
      if (!hub) {
        throw new AppError('Hub not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Verify user is a member of the hub
      const membership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId: id,
          userId: request.user.id,
        },
      });
      
      if (!membership && !hub.isPublic) {
        throw new AppError('Not a member of this hub', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [RESPOND] Return hub details with user's role
      return reply.send({
        success: true,
        hub: {
          ...hub,
          memberCount: hub._count.members,
          userRole: membership ? membership.role : null,
        },
      });
    } catch (error) {
      logger.error('Error fetching hub details:', error);
      throw error;
    }
  });
  
  /**
   * [UPDATE] Update hub details
   * PATCH /api/hubs/:id
   */
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
          name: { type: 'string', minLength: 3, maxLength: 50 },
          description: { type: 'string', maxLength: 500 },
          iconUrl: { type: 'string', format: 'uri' },
          isPublic: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            hub: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                iconUrl: { type: 'string', nullable: true },
                isPublic: { type: 'boolean' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      const updates = updateHubSchema.parse(request.body);
      
      // [PERM] Check if user has permission to update the hub
      const hasPermission = await hasHubPermission(
        fastify.prisma,
        request.user.id,
        id,
        ['OWNER', 'ADMIN']
      );
      
      if (!hasPermission) {
        throw new AppError('Not authorized to update this hub', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [UPDATE] Apply hub updates
      const updatedHub = await fastify.prisma.hub.update({
        where: { id },
        data: updates,
      });
      
      // [RESPOND] Return updated hub
      return reply.send({
        success: true,
        hub: updatedHub,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error updating hub:', error);
      throw error;
    }
  });
  
  /**
   * [MEMBER] Get hub members
   * GET /api/hubs/:id/members
   */
  fastify.get('/:id/members', {
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
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  role: { type: 'string' },
                  joinedAt: { type: 'string' },
                  user: {
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
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // [CHECK] Verify user is a member of the hub
      const membership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId: id,
          userId: request.user.id,
        },
      });
      
      if (!membership) {
        throw new AppError('Not a member of this hub', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [FETCH] Get all members with user details
      const members = await fastify.prisma.hubMembership.findMany({
        where: {
          hubId: id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' },
        ],
      });
      
      // [RESPOND] Return members list
      return reply.send({
        success: true,
        members,
      });
    } catch (error) {
      logger.error('Error fetching hub members:', error);
      throw error;
    }
  });
  
  /**
   * [INVITE] Create invite code
   * POST /api/hubs/:id/invites
   */
  fastify.post('/:id/invites', {
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
          maxUses: { type: 'integer', minimum: 1, maximum: 100 },
          expiresInHours: { type: 'integer', minimum: 1, maximum: 720 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            invite: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                code: { type: 'string' },
                expiresAt: { type: 'string', nullable: true },
                maxUses: { type: 'integer', nullable: true },
                currentUses: { type: 'integer' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      const { maxUses, expiresInHours } = createInviteSchema.parse(request.body);
      
      // [PERM] Check if user has permission
      const hasPermission = await hasHubPermission(
        fastify.prisma,
        request.user.id,
        id
      );
      
      if (!hasPermission) {
        throw new AppError('Not authorized to create invites', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [CODE] Generate a unique invite code
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const length = 8;
        
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
      };
      
      const code = generateCode();
      
      // [EXPIRY] Calculate expiration date if specified
      let expiresAt = null;
      if (expiresInHours) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);
      }
      
      // [CREATE] Create the invite
      const invite = await fastify.prisma.hubInvite.create({
        data: {
          hubId: id,
          code,
          maxUses,
          expiresAt,
        },
      });
      
      // [RESPOND] Return the created invite
      return reply.code(201).send({
        success: true,
        invite,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error creating invite:', error);
      throw error;
    }
  });
  
  /**
   * [JOIN] Join hub via invite code
   * POST /api/hubs/join/:code
   */
  fastify.post('/join/:code', {
    schema: {
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            hub: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                iconUrl: { type: 'string', nullable: true },
                memberCount: { type: 'integer' },
              },
            },
            membership: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                role: { type: 'string' },
                joinedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { code } = request.params;
      
      // [FIND] Find the invite
      const invite = await fastify.prisma.hubInvite.findUnique({
        where: { code },
        include: {
          hub: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      });
      
      if (!invite) {
        throw new AppError('Invalid invite code', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Validate invite is still valid
      if (invite.expiresAt && new Date() > invite.expiresAt) {
        throw new AppError('Invite has expired', 400, 'VALIDATION_ERROR');
      }
      
      if (invite.maxUses && invite.currentUses >= invite.maxUses) {
        throw new AppError('Invite has reached maximum uses', 400, 'VALIDATION_ERROR');
      }
      
      // [CHECK] Check if user is already a member
      const existingMembership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId: invite.hubId,
          userId: request.user.id,
        },
      });
      
      if (existingMembership) {
        return reply.send({
          success: true,
          message: 'Already a member of this hub',
          hub: {
            id: invite.hub.id,
            name: invite.hub.name,
            description: invite.hub.description,
            iconUrl: invite.hub.iconUrl,
            memberCount: invite.hub._count.members,
          },
          membership: existingMembership,
        });
      }
      
      // [JOIN] Create membership for the user
      const membership = await fastify.prisma.hubMembership.create({
        data: {
          hubId: invite.hubId,
          userId: request.user.id,
          role: 'MEMBER',
        },
      });
      
      // [UPDATE] Increment invite uses
      await fastify.prisma.hubInvite.update({
        where: { id: invite.id },
        data: {
          currentUses: { increment: 1 },
        },
      });
      
      // [RESPOND] Return hub info with new membership
      return reply.send({
        success: true,
        hub: {
          id: invite.hub.id,
          name: invite.hub.name,
          description: invite.hub.description,
          iconUrl: invite.hub.iconUrl,
          memberCount: invite.hub._count.members + 1,
        },
        membership,
      });
    } catch (error) {
      logger.error('Error joining hub:', error);
      throw error;
    }
  });
  
  /**
   * [LEAVE] Leave a hub
   * DELETE /api/hubs/:id/leave
   */
  fastify.delete('/:id/leave', {
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
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // [CHECK] Get hub and membership details
      const hub = await fastify.prisma.hub.findUnique({
        where: { id },
      });
      
      if (!hub) {
        throw new AppError('Hub not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Owner cannot leave their own hub
      if (hub.ownerId === request.user.id) {
        throw new AppError('Owner cannot leave their hub. Transfer ownership first or delete the hub.', 400, 'VALIDATION_ERROR');
      }
      
      // [LEAVE] Remove membership
      await fastify.prisma.hubMembership.deleteMany({
        where: {
          hubId: id,
          userId: request.user.id,
        },
      });
      
      // [RESPOND] Confirm leaving
      return reply.send({
        success: true,
        message: 'Successfully left the hub',
      });
    } catch (error) {
      logger.error('Error leaving hub:', error);
      throw error;
    }
  });
  
  /**
   * [DELETE] Delete a hub (owner only)
   * DELETE /api/hubs/:id
   */
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
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // [CHECK] Verify hub exists and user is owner
      const hub = await fastify.prisma.hub.findUnique({
        where: { id },
      });
      
      if (!hub) {
        throw new AppError('Hub not found', 404, 'NOT_FOUND_ERROR');
      }
      
      if (hub.ownerId !== request.user.id) {
        throw new AppError('Only the owner can delete this hub', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [DELETE] Delete the hub (will cascade to channels, memberships, etc.)
      await fastify.prisma.hub.delete({
        where: { id },
      });
      
      // [RESPOND] Confirm deletion
      return reply.send({
        success: true,
        message: 'Hub successfully deleted',
      });
    } catch (error) {
      logger.error('Error deleting hub:', error);
      throw error;
    }
  });
});

export default hubRoutes;
