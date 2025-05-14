/**
 * ██████████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. MESSAGE ROUTES                                     █
 * █ Direct messaging and conversation management endpoints         █
 * ██████████████████████████████████████████████████████████████████
 * 
 * [CODEX] The messaging system is the nervous system of our application.
 * It handles direct messages between users and provides the history and 
 * foundation for real-time communication through WebSockets.
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { verifyToken, extractTokenFromRequest } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// [SCHEMAS] Input validation schemas for message operations
const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  receiverId: z.string().uuid(),
  replyToId: z.string().uuid().optional(),
  encrypted: z.boolean().optional(),
});

const getConversationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

const getMessagesSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

/**
 * [AUTH] Authentication middleware
 * Secures all message routes with JWT verification
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
 * [ROUTES] Messaging routes plugin
 * Handles direct message operations between users
 */
const messageRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  // [HOOK] Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticate);
  
  /**
   * [SEND] Send a direct message to another user
   * POST /api/messages
   */
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['content', 'receiverId'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 4000 },
          receiverId: { type: 'string', format: 'uuid' },
          replyToId: { type: 'string', format: 'uuid' },
          encrypted: { type: 'boolean' },
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
                senderId: { type: 'string' },
                receiverId: { type: 'string' },
                encrypted: { type: 'boolean' },
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
      // [PARSE] Validate request body
      const { content, receiverId, replyToId, encrypted } = sendMessageSchema.parse(request.body);
      
      // [CHECK] Verify receiver exists
      const receiver = await fastify.prisma.user.findUnique({
        where: { id: receiverId },
      });
      
      if (!receiver) {
        throw new AppError('Recipient user not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [VERIFY] Check if users are friends or have a relationship
      const areFriends = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId1: request.user.id, userId2: receiverId },
            { userId1: receiverId, userId2: request.user.id },
          ],
        },
      });
      
      // [MSN-STYLE] Allow messaging even without friendship - like classic MSN
      // but track if they're friends for potential future filtering options
      
      // [REPLY] If replying to a message, verify it exists
      if (replyToId) {
        const originalMessage = await fastify.prisma.message.findUnique({
          where: { id: replyToId },
        });
        
        if (!originalMessage) {
          throw new AppError('Original message not found', 404, 'NOT_FOUND_ERROR');
        }
        
        // [PERM] Verify user has access to the original message
        if (originalMessage.senderId !== request.user.id && 
            originalMessage.receiverId !== request.user.id) {
          throw new AppError('Cannot reply to this message', 403, 'AUTHORIZATION_ERROR');
        }
      }
      
      // [CREATE] Create the message in database
      const message = await fastify.prisma.message.create({
        data: {
          content,
          encrypted: encrypted || false,
          senderId: request.user.id,
          receiverId,
          replyToId,
        },
      });
      
      // [RESPOND] Return the created message
      return reply.code(201).send({
        success: true,
        message,
      });
      
      // [NOTE] Real-time delivery is handled by WebSocket server, 
      // which will notify the recipient of the new message.
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error sending message:', error);
      throw error;
    }
  });
  
  /**
   * [LIST] Get recent conversations (contact list)
   * GET /api/messages/conversations
   */
  fastify.get('/conversations', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          cursor: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            conversations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  username: { type: 'string' },
                  displayName: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true },
                  status: { type: 'string' },
                  lastMessage: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      content: { type: 'string' },
                      senderId: { type: 'string' },
                      encrypted: { type: 'boolean' },
                      createdAt: { type: 'string' },
                    },
                  },
                  unreadCount: { type: 'integer' },
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
      // [PARSE] Get query parameters
      const { limit, cursor } = getConversationsSchema.parse(request.query);
      
      // [FETCH] Get all recent conversations for the user
      const userId = request.user.id;
      
      // [QUERY] Find the most recent message with each unique contact
      const messageGroups = await fastify.prisma.$queryRaw`
        WITH ranked_messages AS (
          SELECT 
            m.*,
            ROW_NUMBER() OVER (
              PARTITION BY 
                CASE 
                  WHEN m."senderId" = ${userId} THEN m."receiverId" 
                  ELSE m."senderId" 
                END 
              ORDER BY m."createdAt" DESC
            ) as rn
          FROM messages m
          WHERE m."senderId" = ${userId} OR m."receiverId" = ${userId}
        )
        SELECT * FROM ranked_messages 
        WHERE rn = 1
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
        ${cursor ? `OFFSET ${cursor}` : ''}
      `;
      
      // [PROCESS] Collect user IDs from conversations
      const contactIds = new Set();
      messageGroups.forEach((msg: any) => {
        const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        contactIds.add(contactId);
      });
      
      // [FETCH] Get user data for each contact
      const contacts = await fastify.prisma.user.findMany({
        where: {
          id: { in: Array.from(contactIds) as string[] },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          status: true,
        },
      });
      
      // [COUNT] Count unread messages per conversation
      const unreadCounts = await Promise.all(
        Array.from(contactIds).map(async (contactId) => {
          const count = await fastify.prisma.message.count({
            where: {
              senderId: contactId,
              receiverId: userId,
              readAt: null,
            },
          });
          return { contactId, count };
        })
      );
      
      // [MAP] Build conversations list
      const conversations = messageGroups.map((msg: any) => {
        const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const contact = contacts.find(c => c.id === contactId);
        const unreadInfo = unreadCounts.find(u => u.contactId === contactId);
        
        return {
          userId: contactId,
          username: contact?.username,
          displayName: contact?.displayName,
          avatarUrl: contact?.avatarUrl,
          status: contact?.status,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            encrypted: msg.encrypted,
            createdAt: msg.createdAt,
          },
          unreadCount: unreadInfo?.count || 0,
        };
      });
      
      // [CURSOR] Calculate next cursor for pagination
      const nextCursor = messageGroups.length === limit 
        ? String(parseInt(cursor || '0') + limit)
        : null;
      
      // [RESPOND] Return conversations list
      return reply.send({
        success: true,
        conversations,
        nextCursor,
      });
    } catch (error) {
      logger.error('Error fetching conversations:', error);
      throw error;
    }
  });
  
  /**
   * [HISTORY] Get conversation history with a specific user
   * GET /api/messages/:userId
   */
  fastify.get('/:userId', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
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
                  senderId: { type: 'string' },
                  receiverId: { type: 'string' },
                  encrypted: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  readAt: { type: 'string', nullable: true },
                  replyToId: { type: 'string', nullable: true },
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
      // [PARSE] Get parameters
      const { userId } = request.params;
      const { limit, cursor } = getMessagesSchema.parse({
        ...request.query,
        userId,
      });
      
      // [VERIFY] Check if the other user exists
      const otherUser = await fastify.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!otherUser) {
        throw new AppError('User not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [PAGINATION] Setup cursor-based pagination
      let cursorObj;
      if (cursor) {
        cursorObj = { id: cursor };
      }
      
      // [FETCH] Get messages between the two users
      const messages = await fastify.prisma.message.findMany({
        where: {
          OR: [
            { senderId: request.user.id, receiverId: userId },
            { senderId: userId, receiverId: request.user.id },
          ],
        },
        include: {
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
      
      // [UPDATE] Mark received messages as read
      const messagesToUpdate = messagesToReturn
        .filter(msg => msg.senderId === userId && msg.receiverId === request.user.id && !msg.readAt)
        .map(msg => msg.id);
      
      if (messagesToUpdate.length > 0) {
        await fastify.prisma.message.updateMany({
          where: {
            id: { in: messagesToUpdate },
          },
          data: {
            readAt: new Date(),
          },
        });
      }
      
      // [RESPOND] Return messages with pagination info
      return reply.send({
        success: true,
        messages: messagesToReturn,
        nextCursor,
      });
    } catch (error) {
      logger.error('Error fetching messages:', error);
      throw error;
    }
  });
  
  /**
   * [READ] Mark messages as read
   * POST /api/messages/:userId/read
   */
  fastify.post('/:userId/read', {
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
            success: { type: 'boolean' },
            count: { type: 'integer' },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { userId } = request.params;
      
      // [UPDATE] Mark all messages from the specified user as read
      const result = await fastify.prisma.message.updateMany({
        where: {
          senderId: userId,
          receiverId: request.user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });
      
      // [RESPOND] Return success with count of updated messages
      return reply.send({
        success: true,
        count: result.count,
      });
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  });
  
  /**
   * [REACT] Add a reaction to a message
   * POST /api/messages/:messageId/react
   */
  fastify.post('/:messageId/react', {
    schema: {
      params: {
        type: 'object',
        required: ['messageId'],
        properties: {
          messageId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['emoji'],
        properties: {
          emoji: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            reaction: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                emoji: { type: 'string' },
                messageId: { type: 'string' },
                userId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { messageId } = request.params;
      const { emoji } = request.body;
      
      // [VERIFY] Check if message exists and user has access
      const message = await fastify.prisma.message.findUnique({
        where: { id: messageId },
      });
      
      if (!message) {
        throw new AppError('Message not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [PERM] Check if user has access to this message
      if (message.senderId !== request.user.id && message.receiverId !== request.user.id) {
        throw new AppError('Cannot access this message', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [UPSERT] Add or update reaction
      const reaction = await fastify.prisma.reaction.upsert({
        where: {
          messageId_userId_emoji: {
            messageId,
            userId: request.user.id,
            emoji,
          },
        },
        update: {},
        create: {
          emoji,
          messageId,
          userId: request.user.id,
        },
      });
      
      // [RESPOND] Return the reaction
      return reply.send({
        success: true,
        reaction,
      });
    } catch (error) {
      logger.error('Error adding reaction:', error);
      throw error;
    }
  });
  
  /**
   * [REMOVE] Remove a reaction from a message
   * DELETE /api/messages/:messageId/react/:emoji
   */
  fastify.delete('/:messageId/react/:emoji', {
    schema: {
      params: {
        type: 'object',
        required: ['messageId', 'emoji'],
        properties: {
          messageId: { type: 'string' },
          emoji: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { messageId, emoji } = request.params;
      
      // [DELETE] Remove the reaction
      await fastify.prisma.reaction.deleteMany({
        where: {
          messageId,
          userId: request.user.id,
          emoji,
        },
      });
      
      // [RESPOND] Confirm deletion
      return reply.send({
        success: true,
      });
    } catch (error) {
      logger.error('Error removing reaction:', error);
      throw error;
    }
  });
  
  /**
   * [DELETE] Delete a message
   * DELETE /api/messages/:messageId
   */
  fastify.delete('/:messageId', {
    schema: {
      params: {
        type: 'object',
        required: ['messageId'],
        properties: {
          messageId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      const { messageId } = request.params;
      
      // [VERIFY] Check if message exists and user is the sender
      const message = await fastify.prisma.message.findUnique({
        where: { id: messageId },
      });
      
      if (!message) {
        throw new AppError('Message not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [PERM] Only sender can delete their own messages
      if (message.senderId !== request.user.id) {
        throw new AppError('Cannot delete this message', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [DELETE] Remove the message
      await fastify.prisma.message.delete({
        where: { id: messageId },
      });
      
      // [RESPOND] Confirm deletion
      return reply.send({
        success: true,
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  });
});

export default messageRoutes;
