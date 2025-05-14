// =============================================
// ============== CODEX WEBSOCKET =============
// =============================================
// WebSocket handler for real-time communication
// Manages connections, events, and message broadcasting

import { FastifyInstance } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { verify } from '@fastify/jwt';
import { Redis } from 'redis';

// Connection store to track active users
interface Connection {
  socket: SocketStream;
  userId: string;
}

// In-memory connection store (would use Redis in production)
const connections: Map<string, Connection> = new Map();

// Initialize Redis client
let redisClient: Redis | null = null;

// Initialize Redis if configured
async function initRedis() {
  if (process.env.REDIS_URL) {
    const { createClient } = await import('redis');
    redisClient = createClient({
      url: process.env.REDIS_URL
    }) as Redis;
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    
    await redisClient.connect();
    console.log('Redis connected successfully');
  }
}

// WebSocket event types
export enum WebSocketEventType {
  USER_STATUS = 'user:status',
  USER_TYPING = 'user:typing',
  MESSAGE_NEW = 'message:new',
  MESSAGE_UPDATE = 'message:update',
  MESSAGE_DELETE = 'message:delete',
  HUB_UPDATE = 'hub:update',
  CHANNEL_UPDATE = 'channel:update',
  FRIEND_REQUEST = 'friend:request',
  FRIEND_UPDATE = 'friend:update',
}

// WebSocket message interface
interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
}

// Setup WebSocket handlers
export default function setupWebsocketHandlers(server: FastifyInstance) {
  // Initialize Redis
  initRedis();
  
  // WebSocket route
  server.register(async function(fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
      // Extract token from query params
      const token = req.query.token as string;
      
      if (!token) {
        connection.socket.end();
        return;
      }
      
      try {
        // Verify JWT token
        const decoded = verify(token, process.env.JWT_SECRET || 'supersecretkey');
        const userId = (decoded as any).userId;
        
        if (!userId) {
          connection.socket.end();
          return;
        }
        
        // Store connection
        connections.set(userId, { socket: connection, userId });
        
        // Update user status to online
        updateUserStatus(userId, 'ONLINE');
        
        console.log(`User ${userId} connected`);
        
        // Handle incoming messages
        connection.socket.on('message', async (message) => {
          try {
            const data: WebSocketMessage = JSON.parse(message.toString());
            handleWebSocketMessage(userId, data);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        });
        
        // Handle disconnection
        connection.socket.on('close', () => {
          connections.delete(userId);
          updateUserStatus(userId, 'OFFLINE');
          console.log(`User ${userId} disconnected`);
        });
        
        // Send initial connection success message
        sendToUser(userId, {
          type: WebSocketEventType.USER_STATUS,
          payload: { status: 'connected' }
        });
      } catch (err) {
        console.error('WebSocket authentication error:', err);
        connection.socket.end();
      }
    });
  });
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(userId: string, message: WebSocketMessage) {
  switch (message.type) {
    case WebSocketEventType.USER_STATUS:
      updateUserStatus(userId, message.payload.status);
      break;
    case WebSocketEventType.USER_TYPING:
      broadcastTypingStatus(userId, message.payload.recipientId, message.payload.isTyping);
      break;
    case WebSocketEventType.MESSAGE_NEW:
      broadcastNewMessage(message.payload);
      break;
    default:
      console.log(`Unhandled message type: ${message.type}`);
  }
}

// Update user status
async function updateUserStatus(userId: string, status: string) {
  // Update in database (would implement with Prisma)
  
  // Update in Redis if available
  if (redisClient) {
    await redisClient.hSet('user:status', userId, status);
  }
  
  // Broadcast to friends (simplified - would filter to friends only)
  broadcastToAll({
    type: WebSocketEventType.USER_STATUS,
    payload: { userId, status }
  });
}

// Broadcast typing status to recipient
function broadcastTypingStatus(userId: string, recipientId: string, isTyping: boolean) {
  sendToUser(recipientId, {
    type: WebSocketEventType.USER_TYPING,
    payload: { userId, isTyping }
  });
}

// Broadcast new message to relevant users
function broadcastNewMessage(messageData: any) {
  if (messageData.channelId) {
    // Channel message - would filter to channel members
    broadcastToAll({
      type: WebSocketEventType.MESSAGE_NEW,
      payload: messageData
    });
  } else if (messageData.directMessageId) {
    // DM - send only to participants
    sendToUser(messageData.recipientId, {
      type: WebSocketEventType.MESSAGE_NEW,
      payload: messageData
    });
  }
}

// Send message to specific user
function sendToUser(userId: string, message: WebSocketMessage) {
  const connection = connections.get(userId);
  if (connection) {
    connection.socket.socket.send(JSON.stringify(message));
  }
}

// Broadcast message to all connected users
function broadcastToAll(message: WebSocketMessage) {
  connections.forEach((connection) => {
    connection.socket.socket.send(JSON.stringify(message));
  });
}
