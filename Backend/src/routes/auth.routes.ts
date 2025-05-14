// =============================================
// ============== CODEX AUTH =================
// =============================================
// Authentication routes for C.H.A.O.S.
// Handles user registration, login, token refresh, and logout

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fastifyPlugin from 'fastify-plugin';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Auth routes plugin
export default fastifyPlugin(async (fastify: FastifyInstance) => {
  // =============================================
  // ============== USER REGISTRATION ===========
  // =============================================
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password', 'displayName'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 30 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          displayName: { type: 'string', minLength: 1, maxLength: 50 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate request body
      const { username, email, password, displayName } = registerSchema.parse(request.body);
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
          ],
        },
      });
      
      if (existingUser) {
        return reply.code(409).send({ 
          error: 'User already exists',
          field: existingUser.username === username ? 'username' : 'email'
        });
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          displayName,
          status: 'OFFLINE',
        },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatar: true,
          status: true,
          createdAt: true,
        },
      });
      
      // Generate tokens
      const tokens = generateTokens(user.id);
      
      // Set refresh token cookie
      reply.setCookie('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      
      return reply.code(201).send({
        ...user,
        accessToken: tokens.accessToken,
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
  // ============== USER LOGIN ==================
  // =============================================
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            accessToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate request body
      const { email, password } = loginSchema.parse(request.body);
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      
      // Generate tokens
      const tokens = generateTokens(user.id);
      
      // Set refresh token cookie
      reply.setCookie('refreshToken', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      
      // Update user status to online
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ONLINE' },
      });
      
      return reply.code(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        status: 'ONLINE',
        accessToken: tokens.accessToken,
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
  // ============== TOKEN REFRESH ===============
  // =============================================
  fastify.post('/refresh', {
    schema: {
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Get refresh token from cookie or request body
      const refreshToken = request.cookies.refreshToken || 
        (request.body as { refreshToken?: string })?.refreshToken;
      
      if (!refreshToken) {
        return reply.code(401).send({ error: 'Refresh token required' });
      }
      
      // Verify refresh token
      let decoded: any;
      
      try {
        decoded = fastify.jwt.verify(refreshToken);
      } catch (error) {
        return reply.code(401).send({ error: 'Invalid refresh token' });
      }
      
      // Check if token is refresh token
      if (decoded.type !== 'refresh') {
        return reply.code(401).send({ error: 'Invalid token type' });
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      
      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }
      
      // Generate new access token
      const accessToken = fastify.jwt.sign(
        { userId: user.id, type: 'access' },
        { expiresIn: '15m' }
      );
      
      return reply.code(200).send({ accessToken });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // =============================================
  // ============== USER LOGOUT =================
  // =============================================
  fastify.post('/logout', {
    schema: {
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
      // Clear refresh token cookie
      reply.clearCookie('refreshToken', { path: '/' });
      
      // Get user ID from token if available
      let userId: string | undefined;
      
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const decoded = fastify.jwt.verify(token) as { userId: string };
          userId = decoded.userId;
          
          // Update user status to offline
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: { status: 'OFFLINE' },
            });
          }
        } catch (error) {
          // Token verification failed, but we still want to clear the cookie
        }
      }
      
      return reply.code(200).send({ message: 'Logged out successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // Helper function to generate tokens
  function generateTokens(userId: string) {
    const accessToken = fastify.jwt.sign(
      { userId, type: 'access' },
      { expiresIn: '15m' }
    );
    
    const refreshToken = fastify.jwt.sign(
      { userId, type: 'refresh' },
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
});
