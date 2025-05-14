/**
 * ██████████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. WEBSOCKET SERVER                                  █
 * █ Real-time communication layer for the messaging platform     █
 * ██████████████████████████████████████████████████████████████████
 * 
 * This module implements the WebSocket server functionality for C.H.A.O.S.
 * It manages real-time connections, presence updates, message delivery,
 * and typing indicators - bringing the nostalgic MSN experience with 
 * modern capabilities.
 */

import { FastifyInstance } from 'fastify';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/auth';
import { prisma } from '../plugins/database';
import { Socket } from 'socket.io';

// [TYPES] Connection tracking map types
interface ConnectedUser {
  userId: string;
  username: string;
  socketId: string;
  status: 'ONLINE' | 'IDLE' | 'DO_NOT_DISTURB' | 'INVISIBLE' | 'OFFLINE' | 'CUSTOM';
  statusMessage?: string;
  lastActivity: Date;
}

// [STATE] In-memory connection tracking
const connectedUsers = new Map<string, ConnectedUser>();
const userSockets = new Map<string, Set<string>>();

/**
 * [EVENT] Message event handler
 * Processes and delivers messages to recipients
 */
const handleMessage = async (socket: Socket, data: any) => {
  try {
    const { userId } = socket.data;
    const { receiverId, content, channelId } = data;
    
    if (!userId) {
      return socket.emit('error', { message: 'Unauthorized' });
    }

    // [VALID] Validate incoming message data
    if ((!receiverId && !channelId) || !content) {
      return socket.emit('error', { message: 'Invalid message data' });
    }

    // [PERSIST] Store message in database
    let newMessage;
    
    if (receiverId) {
      // [DM] Direct message
      newMessage = await prisma.message.create({
        data: {
          content,
          senderId: userId,
          receiverId,
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
      });
      
      // [DELIVER] Deliver to recipient if online
      const recipientSockets = userSockets.get(receiverId);
      if (recipientSockets) {
        recipientSockets.forEach(socketId => {
          socket.to(socketId).emit('message', newMessage);
        });
      }
    } else if (channelId) {
      // [CHANNEL] Channel message
      newMessage = await prisma.message.create({
        data: {
          content,
          senderId: userId,
          channelId,
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
          channel: true,
        },
      });
      
      // [BROADCAST] Broadcast to channel
      socket.to(`channel:${channelId}`).emit('message', newMessage);
    }
    
    // [CONFIRM] Confirm message sent to sender
    socket.emit('message:sent', { id: newMessage?.id, timestamp: new Date() });
    
    // [UPDATE] Update user's last activity
    if (connectedUsers.has(userId)) {
      const user = connectedUsers.get(userId)!;
      user.lastActivity = new Date();
      connectedUsers.set(userId, user);
    }
  } catch (error) {
    logger.error('Error handling message:', error);
    socket.emit('error', { message: 'Failed to process message' });
  }
};

/**
 * [EVENT] Typing indicator handler
 * Broadcasts typing status to recipients
 */
const handleTyping = (socket: Socket, data: any) => {
  try {
    const { userId } = socket.data;
    const { receiverId, channelId, isTyping } = data;
    
    if (!userId) {
      return socket.emit('error', { message: 'Unauthorized' });
    }

    if (!receiverId && !channelId) {
      return socket.emit('error', { message: 'Invalid typing data' });
    }

    if (receiverId) {
      // [DM] Direct message typing indicator
      const recipientSockets = userSockets.get(receiverId);
      if (recipientSockets) {
        recipientSockets.forEach(socketId => {
          socket.to(socketId).emit('typing', {
            userId,
            isTyping,
          });
        });
      }
    } else if (channelId) {
      // [CHANNEL] Channel typing indicator
      socket.to(`channel:${channelId}`).emit('typing', {
        userId,
        channelId,
        isTyping,
      });
    }
  } catch (error) {
    logger.error('Error handling typing indicator:', error);
  }
};

/**
 * [EVENT] Status update handler
 * Updates and broadcasts user status changes
 */
const handleStatusUpdate = async (socket: Socket, data: any) => {
  try {
    const { userId } = socket.data;
    const { status, statusMessage } = data;
    
    if (!userId || !status) {
      return socket.emit('error', { message: 'Invalid status update' });
    }

    // [UPDATE] Update user status in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status,
        statusMessage: statusMessage || null
      },
    });

    // [UPDATE] Update in-memory status
    if (connectedUsers.has(userId)) {
      const user = connectedUsers.get(userId)!;
      user.status = status;
      user.statusMessage = statusMessage;
      connectedUsers.set(userId, user);
    }

    // [BROADCAST] Broadcast status update to friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId1: userId },
          { userId2: userId },
        ],
      },
      select: {
        userId1: true,
        userId2: true,
      },
    });

    // [NOTIFY] Compile list of friends to notify
    const friendIds = friendships.map(f => 
      f.userId1 === userId ? f.userId2 : f.userId1
    );

    // [DELIVER] Send status updates to online friends
    friendIds.forEach(friendId => {
      const friendSockets = userSockets.get(friendId);
      if (friendSockets) {
        friendSockets.forEach(socketId => {
          socket.to(socketId).emit('status:update', {
            userId,
            status,
            statusMessage,
          });
        });
      }
    });

    // [CONFIRM] Confirm status update to sender
    socket.emit('status:updated', { status, statusMessage });
  } catch (error) {
    logger.error('Error handling status update:', error);
    socket.emit('error', { message: 'Failed to update status' });
  }
};

/**
 * [EVENT] Channel join/leave handler
 * Manages user presence in channel rooms
 */
const handleChannelJoin = (socket: Socket, data: any) => {
  try {
    const { channelId } = data;
    if (!channelId) {
      return socket.emit('error', { message: 'Invalid channel' });
    }
    
    // [JOIN] Add user to channel room
    socket.join(`channel:${channelId}`);
    socket.emit('channel:joined', { channelId });
    
    // [ANNOUNCE] Notify channel of new user
    socket.to(`channel:${channelId}`).emit('channel:user:joined', {
      channelId,
      userId: socket.data.userId,
    });
  } catch (error) {
    logger.error('Error handling channel join:', error);
  }
};

const handleChannelLeave = (socket: Socket, data: any) => {
  try {
    const { channelId } = data;
    if (!channelId) {
      return socket.emit('error', { message: 'Invalid channel' });
    }
    
    // [LEAVE] Remove user from channel room
    socket.leave(`channel:${channelId}`);
    socket.emit('channel:left', { channelId });
    
    // [ANNOUNCE] Notify channel of user leaving
    socket.to(`channel:${channelId}`).emit('channel:user:left', {
      channelId,
      userId: socket.data.userId,
    });
  } catch (error) {
    logger.error('Error handling channel leave:', error);
  }
};

/**
 * [CORE] Setup WebSocket connection handling
 * Initializes the WebSocket server and registers event handlers
 */
export const initializeWebSocketServer = (server: FastifyInstance) => {
  // [ROUTE] Register WebSocket route with authentication
  server.get('/ws', { websocket: true }, (connection, req) => {
    const { socket } = connection;
    
    // [AUTH] Authenticate the WebSocket connection
    const token = req.headers['sec-websocket-protocol'] || 
                  req.query.token as string;
    
    if (!token) {
      socket.send(JSON.stringify({ event: 'error', data: { message: 'Authentication required' }}));
      return socket.close(1008, 'Authentication required');
    }
    
    // [VERIFY] Verify user token
    let userId: string;
    try {
      const decoded = verifyToken(token);
      userId = decoded.userId;
      
      if (!userId) {
        socket.send(JSON.stringify({ event: 'error', data: { message: 'Invalid token' }}));
        return socket.close(1008, 'Invalid token');
      }
      
      // [ATTACH] Store user ID with socket
      socket.data = { userId };
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      socket.send(JSON.stringify({ event: 'error', data: { message: 'Authentication failed' }}));
      return socket.close(1008, 'Authentication failed');
    }
    
    // [CONNECT] Handle new connection
    handleConnection(socket, userId);
    
    // [EVENTS] Register event handlers
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { event, payload } = data;
        
        switch (event) {
          case 'message':
            handleMessage(socket, payload);
            break;
          case 'typing':
            handleTyping(socket, payload);
            break;
          case 'status:update':
            handleStatusUpdate(socket, payload);
            break;
          case 'channel:join':
            handleChannelJoin(socket, payload);
            break;
          case 'channel:leave':
            handleChannelLeave(socket, payload);
            break;
          default:
            logger.warn(`Unknown WebSocket event: ${event}`);
        }
      } catch (error) {
        logger.error('Error processing WebSocket message:', error);
      }
    });
    
    // [DISCONNECT] Handle client disconnection
    socket.on('close', () => {
      handleDisconnection(userId, socket);
    });
  });
};

/**
 * [HELPER] Handle new user connection
 * Updates presence tracking and notifies friends
 */
const handleConnection = async (socket: any, userId: string) => {
  try {
    // [FETCH] Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        status: true,
        statusMessage: true,
      },
    });
    
    if (!user) {
      return socket.close(1008, 'User not found');
    }
    
    // [TRACK] Add to connected users if not already
    const connectionInfo: ConnectedUser = {
      userId: user.id,
      username: user.username,
      socketId: socket.id,
      status: (user.status as any) || 'ONLINE',
      statusMessage: user.statusMessage || undefined,
      lastActivity: new Date(),
    };
    
    connectedUsers.set(userId, connectionInfo);
    
    // [MULTI] Track multiple connections per user
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);
    
    // [LOG] Log connection
    logger.info(`WebSocket client connected: ${user.username} (${userId})`);
    
    // [STATUS] Update user status in database if coming online
    if (user.status === 'OFFLINE') {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'ONLINE' },
      });
    }
    
    // [WELCOME] Send initial data to client
    socket.send(JSON.stringify({
      event: 'connection:established',
      data: {
        userId: user.id,
        status: user.status,
      },
    }));
    
    // [PRESENCE] Notify friends about user coming online
    notifyFriendsAboutPresence(userId, true);
  } catch (error) {
    logger.error('Error handling WebSocket connection:', error);
    socket.close(1011, 'Server error');
  }
};

/**
 * [HELPER] Handle user disconnection
 * Updates presence and notifies contacts
 */
const handleDisconnection = async (userId: string, socket: any) => {
  try {
    // [CLEANUP] Remove socket from tracking
    if (userSockets.has(userId)) {
      userSockets.get(userId)!.delete(socket.id);
      
      // [CHECK] If no more sockets for this user, they're fully disconnected
      if (userSockets.get(userId)!.size === 0) {
        userSockets.delete(userId);
        connectedUsers.delete(userId);
        
        // [UPDATE] Update user status in database
        await prisma.user.update({
          where: { id: userId },
          data: { status: 'OFFLINE' },
        });
        
        // [NOTIFY] Tell friends this user is offline
        notifyFriendsAboutPresence(userId, false);
        
        logger.info(`User disconnected: ${userId}`);
      }
    }
  } catch (error) {
    logger.error('Error handling disconnect:', error);
  }
};

/**
 * [HELPER] Notify friends about presence changes
 */
const notifyFriendsAboutPresence = async (userId: string, isOnline: boolean) => {
  try {
    // [FETCH] Find all friendship relationships for this user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId1: userId },
          { userId2: userId },
        ],
      },
      select: {
        userId1: true,
        userId2: true,
      },
    });
    
    // [GET] Get user info for the presence notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        displayName: true,
        status: true,
        statusMessage: true,
      },
    });
    
    if (!user) return;
    
    // [NOTIFY] For each friend, send presence update if they're online
    const eventType = isOnline ? 'user:online' : 'user:offline';
    const status = isOnline ? (user.status || 'ONLINE') : 'OFFLINE';
    
    // [LOOP] Compile list of friends to notify
    friendships.forEach(friendship => {
      const friendId = friendship.userId1 === userId ? friendship.userId2 : friendship.userId1;
      
      // [SEND] If friend is online, notify them about status change
      if (userSockets.has(friendId)) {
        const friendSocketIds = userSockets.get(friendId)!;
        
        friendSocketIds.forEach(socketId => {
          const server = (global as any).io;
          server.to(socketId).emit(eventType, {
            userId,
            username: user.username,
            displayName: user.displayName,
            status,
            statusMessage: user.statusMessage,
          });
        });
      }
    });
  } catch (error) {
    logger.error('Error notifying friends about presence:', error);
  }
};

// [MAINTENANCE] Setup periodic cleanup of stale connections
setInterval(async () => {
  const now = new Date();
  const idleTimeout = 5 * 60 * 1000; // 5 minutes
  
  for (const [userId, user] of connectedUsers.entries()) {
    const idleTime = now.getTime() - user.lastActivity.getTime();
    
    // [IDLE] If user has been inactive for 5+ minutes, mark as idle
    if (idleTime >= idleTimeout && user.status === 'ONLINE') {
      try {
        // [UPDATE] Change status to IDLE
        await prisma.user.update({
          where: { id: userId },
          data: { status: 'IDLE' },
        });
        
        // [UPDATE] Update in-memory status
        user.status = 'IDLE';
        connectedUsers.set(userId, user);
        
        // [NOTIFY] Notify friends about status change
        const friendships = await prisma.friendship.findMany({
          where: {
            OR: [
              { userId1: userId },
              { userId2: userId },
            ],
          },
          select: {
            userId1: true,
            userId2: true,
          },
        });
        
        friendships.forEach(friendship => {
          const friendId = friendship.userId1 === userId ? friendship.userId2 : friendship.userId1;
          if (userSockets.has(friendId)) {
            const friendSocketIds = userSockets.get(friendId)!;
            friendSocketIds.forEach(socketId => {
              const server = (global as any).io;
              server.to(socketId).emit('status:update', {
                userId,
                status: 'IDLE',
                statusMessage: user.statusMessage,
              });
            });
          }
        });
      } catch (error) {
        logger.error('Error updating idle status:', error);
      }
    }
  }
}, 60000); // Check every minute
