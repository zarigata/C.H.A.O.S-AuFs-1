/**
 * ███████████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. FRIEND ROUTES                                       █
 * █ Friend relationship management, inspired by MSN Messenger       █
 * ███████████████████████████████████████████████████████████████████
 * 
 * [CODEX] Friend management is core to the social experience 
 * of C.H.A.O.S, bringing back the nostalgia of MSN contacts
 * lists with modern implementation. This module handles all
 * friend-related operations including requests, confirmations
 * and organization.
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { verifyToken, extractTokenFromRequest } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// [SCHEMAS] Input validation schemas
const sendFriendRequestSchema = z.object({
  userId: z.string().uuid(),
});

const respondToRequestSchema = z.object({
  requestId: z.string().uuid(),
  accept: z.boolean(),
});

const updateFriendGroupSchema = z.object({
  friendId: z.string().uuid(),
  groupName: z.string().min(1).max(30),
});

/**
 * [AUTH] Authentication middleware
 * Secures all friend management routes
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
 * [ROUTES] Friend management routes plugin
 * Handles friend relationships and requests
 */
const friendRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  // [HOOK] Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticate);
  
  /**
   * [LIST] Get friends list
   * GET /api/friends
   */
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            friends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  displayName: { type: 'string' },
                  avatarUrl: { type: 'string', nullable: true },
                  status: { type: 'string' },
                  statusMessage: { type: 'string', nullable: true },
                  friendshipId: { type: 'string' },
                  createdAt: { type: 'string' },
                  // [MSN] Group name is reminiscent of MSN contact groups
                  groupName: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [FETCH] Get all friendships for the current user
      const friendships = await fastify.prisma.friendship.findMany({
        where: {
          OR: [
            { userId1: request.user.id },
            { userId2: request.user.id },
          ],
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              status: true,
              statusMessage: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              status: true,
              statusMessage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // [TRANSFORM] Map friendships to friend objects
      const friends = friendships.map(friendship => {
        const friend = friendship.userId1 === request.user.id 
          ? friendship.user2 
          : friendship.user1;
          
        return {
          id: friend.id,
          username: friend.username,
          displayName: friend.displayName,
          avatarUrl: friend.avatarUrl,
          status: friend.status,
          statusMessage: friend.statusMessage,
          friendshipId: friendship.id,
          createdAt: friendship.createdAt,
          // [MSN] This would come from a FriendGroup table in a full implementation
          groupName: 'Friends',
        };
      });
      
      // [RESPOND] Return friends list
      return reply.send({
        success: true,
        friends,
      });
    } catch (error) {
      logger.error('Error fetching friends list:', error);
      throw error;
    }
  });
  
  /**
   * [REQUEST] Send friend request
   * POST /api/friends/requests
   */
  fastify.post('/requests', {
    schema: {
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            request: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                senderId: { type: 'string' },
                receiverId: { type: 'string' },
                status: { type: 'string' },
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
      const { userId } = sendFriendRequestSchema.parse(request.body);
      
      // [CHECK] Cannot send request to self
      if (userId === request.user.id) {
        throw new AppError('Cannot send friend request to yourself', 400, 'VALIDATION_ERROR');
      }
      
      // [VERIFY] Check if the recipient exists
      const recipient = await fastify.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!recipient) {
        throw new AppError('User not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Check if already friends
      const existingFriendship = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId1: request.user.id, userId2: userId },
            { userId1: userId, userId2: request.user.id },
          ],
        },
      });
      
      if (existingFriendship) {
        throw new AppError('Already friends with this user', 400, 'VALIDATION_ERROR');
      }
      
      // [CHECK] Check if there's already a pending request
      const existingRequest = await fastify.prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: request.user.id, receiverId: userId },
            { senderId: userId, receiverId: request.user.id },
          ],
          status: 'PENDING',
        },
      });
      
      if (existingRequest) {
        // [MSN-STYLE] If recipient already sent a request, auto-accept it
        if (existingRequest.senderId === userId) {
          // Create friendship
          const friendship = await fastify.prisma.friendship.create({
            data: {
              userId1: request.user.id,
              userId2: userId,
            },
          });
          
          // Update request status
          await fastify.prisma.friendRequest.update({
            where: { id: existingRequest.id },
            data: { status: 'ACCEPTED' },
          });
          
          return reply.send({
            success: true,
            message: 'Friend request automatically accepted',
            friendship,
          });
        }
        
        throw new AppError('Friend request already pending', 400, 'VALIDATION_ERROR');
      }
      
      // [CREATE] Create the friend request
      const friendRequest = await fastify.prisma.friendRequest.create({
        data: {
          senderId: request.user.id,
          receiverId: userId,
          status: 'PENDING',
        },
      });
      
      // [RESPOND] Return the created request
      return reply.code(201).send({
        success: true,
        request: friendRequest,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error sending friend request:', error);
      throw error;
    }
  });
  
  /**
   * [PENDING] Get pending friend requests
   * GET /api/friends/requests
   */
  fastify.get('/requests', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            received: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
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
                },
              },
            },
            sent: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                  receiver: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      displayName: { type: 'string' },
                      avatarUrl: { type: 'string', nullable: true },
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
      // [FETCH] Get received requests
      const receivedRequests = await fastify.prisma.friendRequest.findMany({
        where: {
          receiverId: request.user.id,
          status: 'PENDING',
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // [FETCH] Get sent requests
      const sentRequests = await fastify.prisma.friendRequest.findMany({
        where: {
          senderId: request.user.id,
          status: 'PENDING',
        },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // [RESPOND] Return both types of requests
      return reply.send({
        success: true,
        received: receivedRequests,
        sent: sentRequests,
      });
    } catch (error) {
      logger.error('Error fetching friend requests:', error);
      throw error;
    }
  });
  
  /**
   * [RESPOND] Accept or decline friend request
   * POST /api/friends/requests/:requestId/respond
   */
  fastify.post('/requests/:requestId/respond', {
    schema: {
      params: {
        type: 'object',
        required: ['requestId'],
        properties: {
          requestId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['accept'],
        properties: {
          accept: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            friendship: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                userId1: { type: 'string' },
                userId2: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: any, reply) => {
    try {
      // [PARSE] Get parameters
      const { requestId } = request.params;
      const { accept } = respondToRequestSchema.parse({
        requestId,
        ...request.body,
      });
      
      // [VERIFY] Find and verify the request
      const friendRequest = await fastify.prisma.friendRequest.findUnique({
        where: { id: requestId },
      });
      
      if (!friendRequest) {
        throw new AppError('Friend request not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [CHECK] Ensure user is the recipient
      if (friendRequest.receiverId !== request.user.id) {
        throw new AppError('Cannot respond to this request', 403, 'AUTHORIZATION_ERROR');
      }
      
      // [CHECK] Ensure request is still pending
      if (friendRequest.status !== 'PENDING') {
        throw new AppError('This request has already been processed', 400, 'VALIDATION_ERROR');
      }
      
      let friendship = null;
      
      // [PROCESS] Handle accept/decline
      if (accept) {
        // [ACCEPT] Create friendship
        friendship = await fastify.prisma.friendship.create({
          data: {
            userId1: friendRequest.senderId,
            userId2: friendRequest.receiverId,
          },
        });
        
        // [UPDATE] Update request status
        await fastify.prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' },
        });
        
        // [MSN-STYLE] Play "friend online" notification sound on the sender's client
        // (This would be handled via WebSocket in the actual implementation)
      } else {
        // [DECLINE] Update request status
        await fastify.prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: 'DECLINED' },
        });
      }
      
      // [RESPOND] Return result
      return reply.send({
        success: true,
        message: accept ? 'Friend request accepted' : 'Friend request declined',
        friendship,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error responding to friend request:', error);
      throw error;
    }
  });
  
  /**
   * [REMOVE] Remove a friend
   * DELETE /api/friends/:friendId
   */
  fastify.delete('/:friendId', {
    schema: {
      params: {
        type: 'object',
        required: ['friendId'],
        properties: {
          friendId: { type: 'string' },
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
      const { friendId } = request.params;
      
      // [VERIFY] Find the friendship
      const friendship = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId1: request.user.id, userId2: friendId },
            { userId1: friendId, userId2: request.user.id },
          ],
        },
      });
      
      if (!friendship) {
        throw new AppError('Friendship not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [DELETE] Remove the friendship
      await fastify.prisma.friendship.delete({
        where: { id: friendship.id },
      });
      
      // [RESPOND] Confirm removal
      return reply.send({
        success: true,
        message: 'Friend removed successfully',
      });
    } catch (error) {
      logger.error('Error removing friend:', error);
      throw error;
    }
  });
  
  /**
   * [GROUP] Update friend group (MSN Messenger style)
   * This is a simplified version - a full implementation would manage
   * custom friend groups like "Family", "Coworkers", etc.
   */
  fastify.post('/:friendId/group', {
    schema: {
      params: {
        type: 'object',
        required: ['friendId'],
        properties: {
          friendId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['groupName'],
        properties: {
          groupName: { type: 'string', minLength: 1, maxLength: 30 },
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
      // [PARSE] Get parameters
      const { friendId } = request.params;
      const { groupName } = updateFriendGroupSchema.parse({
        friendId,
        ...request.body,
      });
      
      // [VERIFY] Check friendship exists
      const friendship = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            { userId1: request.user.id, userId2: friendId },
            { userId1: friendId, userId2: request.user.id },
          ],
        },
      });
      
      if (!friendship) {
        throw new AppError('Friendship not found', 404, 'NOT_FOUND_ERROR');
      }
      
      // [NOTE] In a full implementation, we would update a FriendGroup table here
      // For this MVP, we'll just acknowledge the request
      
      // [RESPOND] Confirm update
      return reply.send({
        success: true,
        message: `Friend moved to group "${groupName}"`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      logger.error('Error updating friend group:', error);
      throw error;
    }
  });
});

export default friendRoutes;
