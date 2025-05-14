/**
 * █████████████████████████████████████████████████████████
 * █ C.H.A.O.S. CHANNEL ROUTES                            █
 * █ Channel management within community hubs             █
 * █████████████████████████████████████████████████████████
 * 
 * [CODEX] Channels are topic-specific communication spaces
 * within hubs. They hold different types of content (text,
 * voice, video) and enable organized communication among 
 * community members.
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { verifyToken, extractTokenFromRequest } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// [SCHEMAS] Input validation schemas
const createChannelSchema = z.object({
  name: z.string().min(1).max(30).regex(/^[a-z0-9-_]+$/, 
    'Channel name can only contain lowercase letters, numbers, hyphens, and underscores'),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'VOICE', 'VIDEO', 'ANNOUNCEMENT', 'STREAM']).default('TEXT'),
});

const updateChannelSchema = z.object({
  name: z.string().min(1).max(30).regex(/^[a-z0-9-_]+$/, 
    'Channel name can only contain lowercase letters, numbers, hyphens, and underscores').optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['TEXT', 'VOICE', 'VIDEO', 'ANNOUNCEMENT', 'STREAM']).optional(),
});

const sendChannelMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  replyToId: z.string().uuid().optional(),
});

/**
 * [AUTH] Authentication middleware
 * Secures all channel routes
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
 * [PERM] Check if user has permission to manage channels in hub
 */
const hasChannelPermission = async (
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
 * [ROUTES] Channel management routes plugin
 * Handles channel operations within hubs
 */
const channelRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  // [HOOK] Apply authentication to all routes
  fastify.addHook('preHandler', authenticate);
  
  /**
   * [CREATE] Create a new channel in a hub
   * POST /api/channels
   */
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['hubId', 'name'],
        properties: {
          hubId: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 30, pattern: '^[a-z0-9-_]+$' },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string', enum: ['TEXT', 'VOICE', 'VIDEO', 'ANNOUNCEMENT', 'STREAM'] },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            channel: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                type: { type: 'string' },
                hubId: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [PARSE] Validate request body
      const { hubId } = request.body;
      const channelData = createChannelSchema.parse(request.body);
      
      // [CHECK] Verify hub exists
      const hub = await fastify.prisma.hub.findUnique({
        where: { id: hubId },
      });
      
      if (!hub) {
        throw new AppError('Hub not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [PERM] Check if user has permission
      const hasPermission = await hasChannelPermission(
        fastify.prisma,
        request.user.id,
        hubId
      );
      
      if (!hasPermission) {
        throw new AppError('Not authorized to create channels', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [DUPE] Check for duplicate channel name in this hub
      const existingChannel = await fastify.prisma.channel.findFirst({
        where: {
          hubId,
          name: channelData.name,
        },
      });
      
      if (existingChannel) {
        throw new AppError('Channel with this name already exists in this hub', 400, 'VALIDATION_ERROR');
      }
      
      // [CREATE] Create the channel
      const channel = await fastify.prisma.channel.create({
        data: {
          name: channelData.name,
          description: channelData.description,
          type: channelData.type,
          hubId,
        },
      });
      
      // [RESPOND] Return the created channel
      return reply.code(201).send({
        success: true,
        channel,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error creating channel:', error);
      throw error;
    }
  });
  
  /**
   * [LIST] Get all channels in a hub
   * GET /api/channels/hub/:hubId
   */
  fastify.get('/hub/:hubId', {
    schema: {
      params: {
        type: 'object',
        required: ['hubId'],
        properties: {
          hubId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            channels: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  type: { type: 'string' },
                  hubId: { type: 'string' },
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
      const { hubId } = request.params;
      
      // [CHECK] Verify user is a member of the hub
      const membership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId,
          userId: request.user.id,
        },
      });
      
      if (!membership) {
        throw new AppError('Not a member of this hub', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [FETCH] Get all channels in this hub
      const channels = await fastify.prisma.channel.findMany({
        where: {
          hubId,
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' },
        ],
      });
      
      // [TRANSFORM] Add unread counts (simplified implementation)
      // In a real app, this would track user's last read message per channel
      const channelsWithUnread = channels.map(channel => ({
        ...channel,
        unreadCount: 0, // This would be calculated in a real implementation
      }));
      
      // [RESPOND] Return channels list
      return reply.send({
        success: true,
        channels: channelsWithUnread,
      });
    } catch (error) {
      logger.error('Error fetching channels:', error);
      throw error;
    }
  });
  
  /**
   * [DETAIL] Get channel details
   * GET /api/channels/:id
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
            channel: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                type: { type: 'string' },
                hubId: { type: 'string' },
                createdAt: { type: 'string' },
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
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      
      // [FETCH] Get channel with hub details
      const channel = await fastify.prisma.channel.findUnique({
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
        throw new AppError('Channel not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Verify user is member of the hub
      const membership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId: channel.hubId,
          userId: request.user.id,
        },
      });
      
      if (!membership) {
        throw new AppError('Not authorized to view this channel', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [RESPOND] Return channel details
      return reply.send({
        success: true,
        channel,
      });
    } catch (error) {
      logger.error('Error fetching channel details:', error);
      throw error;
    }
  });
  
  /**
   * [UPDATE] Update channel details
   * PATCH /api/channels/:id
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
          name: { type: 'string', minLength: 1, maxLength: 30, pattern: '^[a-z0-9-_]+$' },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string', enum: ['TEXT', 'VOICE', 'VIDEO', 'ANNOUNCEMENT', 'STREAM'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            channel: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                type: { type: 'string' },
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
      const updates = updateChannelSchema.parse(request.body);
      
      // [FETCH] Get channel to verify hub
      const channel = await fastify.prisma.channel.findUnique({
        where: { id },
      });
      
      if (!channel) {
        throw new AppError('Channel not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [PERM] Check if user has permission
      const hasPermission = await hasChannelPermission(
        fastify.prisma,
        request.user.id,
        channel.hubId
      );
      
      if (!hasPermission) {
        throw new AppError('Not authorized to update this channel', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [DUPE] If renaming, check for duplicates
      if (updates.name && updates.name !== channel.name) {
        const duplicateChannel = await fastify.prisma.channel.findFirst({
          where: {
            hubId: channel.hubId,
            name: updates.name,
            id: { not: id },
          },
        });
        
        if (duplicateChannel) {
          throw new AppError('Channel with this name already exists in this hub', 400, 'VALIDATION_ERROR');
        }
      }
      
      // [UPDATE] Apply channel updates
      const updatedChannel = await fastify.prisma.channel.update({
        where: { id },
        data: updates,
      });
      
      // [RESPOND] Return updated channel
      return reply.send({
        success: true,
        channel: updatedChannel,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error updating channel:', error);
      throw error;
    }
  });
  
  /**
   * [DELETE] Delete a channel
   * DELETE /api/channels/:id
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
      
      // [FETCH] Get channel to verify hub
      const channel = await fastify.prisma.channel.findUnique({
        where: { id },
      });
      
      if (!channel) {
        throw new AppError('Channel not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [PERM] Check if user has permission
      const hasPermission = await hasChannelPermission(
        fastify.prisma,
        request.user.id,
        channel.hubId,
        ['OWNER', 'ADMIN']
      );
      
      if (!hasPermission) {
        throw new AppError('Not authorized to delete this channel', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [DEFAULT] Prevent deletion of default general channel
      if (channel.name === 'general') {
        const channelCount = await fastify.prisma.channel.count({
          where: { hubId: channel.hubId },
        });
        
        if (channelCount === 1) {
          throw new AppError('Cannot delete the only channel in a hub', 400, 'VALIDATION_ERROR');
        }
      }
      
      // [DELETE] Remove the channel
      await fastify.prisma.channel.delete({
        where: { id },
      });
      
      // [RESPOND] Confirm deletion
      return reply.send({
        success: true,
        message: 'Channel successfully deleted',
      });
    } catch (error) {
      logger.error('Error deleting channel:', error);
      throw error;
    }
  });
  
  /**
   * [MESSAGES] Get messages in a channel
   * GET /api/channels/:id/messages
   */
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
          cursor: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  content: { type: 'string' },
                  createdAt: { type: 'string' },
                  sender: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      displayName: { type: 'string' },
                      avatarUrl: { type: 'string', nullable: true },
                    },
                  },
                  replyTo: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string' },
                      content: { type: 'string' },
                      senderId: { type: 'string' },
                    },
                  },
                },
              },
            },
            nextCursor: { type: 'string', nullable: true },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      const limit = parseInt(request.query.limit) || 50;
      const { cursor } = request.query;
      
      // [FETCH] Get channel to verify hub
      const channel = await fastify.prisma.channel.findUnique({
        where: { id },
      });
      
      if (!channel) {
        throw new AppError('Channel not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Verify user is member of the hub
      const membership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId: channel.hubId,
          userId: request.user.id,
        },
      });
      
      if (!membership) {
        throw new AppError('Not authorized to view this channel', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [PAGINATION] Setup cursor-based pagination
      let cursorObj;
      if (cursor) {
        cursorObj = { id: cursor };
      }
      
      // [FETCH] Get messages with user details
      const messages = await fastify.prisma.message.findMany({
        where: {
          channelId: id,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              senderId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursorObj,
        take: limit + 1, // +1 to check if there are more messages
        skip: cursor ? 1 : 0, // Skip the cursor item if provided
      });
      
      // [CURSOR] Determine if there are more messages
      const hasMore = messages.length > limit;
      const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
      const nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1].id : null;
      
      // [RESPOND] Return messages with pagination
      return reply.send({
        success: true,
        messages: messagesToReturn,
        nextCursor,
      });
    } catch (error) {
      logger.error('Error fetching channel messages:', error);
      throw error;
    }
  });
  
  /**
   * [SEND] Send a message to a channel
   * POST /api/channels/:id/messages
   */
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
          content: { type: 'string', minLength: 1, maxLength: 4000 },
          replyToId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                content: { type: 'string' },
                channelId: { type: 'string' },
                senderId: { type: 'string' },
                createdAt: { type: 'string' },
                replyToId: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { id } = request.params;
      const { content, replyToId } = sendChannelMessageSchema.parse(request.body);
      
      // [FETCH] Get channel to verify hub
      const channel = await fastify.prisma.channel.findUnique({
        where: { id },
        include: {
          hub: true,
        },
      });
      
      if (!channel) {
        throw new AppError('Channel not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Verify user is member of the hub
      const membership = await fastify.prisma.hubMembership.findFirst({
        where: {
          hubId: channel.hubId,
          userId: request.user.id,
        },
      });
      
      if (!membership) {
        throw new AppError('Not authorized to post in this channel', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [REPLY] If replying, verify the original message
      if (replyToId) {
        const originalMessage = await fastify.prisma.message.findUnique({
          where: { id: replyToId },
        });
        
        if (!originalMessage) {
          throw new AppError('Original message not found', 404, 'NOT_FOUND_ERROR');
        }
        
        if (originalMessage.channelId !== id) {
          throw new AppError('Reply must be to a message in this channel', 400, 'VALIDATION_ERROR');
        }
      }
      
      // [CREATE] Create the message
      const message = await fastify.prisma.message.create({
        data: {
          content,
          senderId: request.user.id,
          channelId: id,
          replyToId,
        },
      });
      
      // [RESPOND] Return the created message
      return reply.code(201).send({
        success: true,
        message,
      });
      
      // [NOTE] Real-time delivery handled by WebSocket server
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error sending channel message:', error);
      throw error;
    }
  });
});

export default channelRoutes;
