/**
 * ███████████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. AUTHENTICATION ROUTES                               █
 * █ User registration, login, and token management endpoints       █
 * ███████████████████████████████████████████████████████████████████
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fp from 'fastify-plugin';
import { hashPassword, verifyPassword, generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// [SCHEMAS] Input validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

/**
 * [ROUTES] Authentication routes plugin
 * Handles user registration, login, token refresh, and logout
 */
const authRoutes: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  /**
   * [REGISTER] Create new user account
   * POST /api/auth/register
   */
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 30 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 100 },
          displayName: { type: 'string', minLength: 1, maxLength: 50 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                displayName: { type: 'string' },
              },
            },
            token: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // [PARSE] Validate request body
      const { username, email, password, displayName } = registerSchema.parse(request.body);
      
      // [CHECK] Check for existing user with same email or username
      const existingUser = await fastify.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
          ],
        },
      });
      
      if (existingUser) {
        throw new AppError(
          existingUser.email === email 
            ? 'Email already registered' 
            : 'Username already taken',
          400,
          'VALIDATION_ERROR'
        );
      }
      
      // [HASH] Hash the password
      const hashedPassword = await hashPassword(password);
      
      // [CREATE] Create new user record
      const newUser = await fastify.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          displayName: displayName || username,
          status: 'ONLINE',
        },
      });
      
      // [GENERATE] Create auth tokens
      const tokenPayload = { userId: newUser.id, username: newUser.username };
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      
      // [STORE] Save refresh token to database
      await fastify.prisma.session.create({
        data: {
          userId: newUser.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
        },
      });
      
      // [RESPOND] Return user data and tokens
      return reply.status(201).send({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          displayName: newUser.displayName,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      // [ERROR] Pass validation errors to global handler
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      // [LOG] Log unexpected errors
      logger.error('Registration error:', error);
      throw error;
    }
  });
  
  /**
   * [LOGIN] Authenticate user and issue tokens
   * POST /api/auth/login
   */
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
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                displayName: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
                status: { type: 'string' },
                statusMessage: { type: 'string', nullable: true },
              },
            },
            token: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // [PARSE] Validate request body
      const { email, password } = loginSchema.parse(request.body);
      
      // [FIND] Find user by email
      const user = await fastify.prisma.user.findUnique({
        where: { email },
      });
      
      // [CHECK] Verify user exists and password is correct
      if (!user) {
        throw new AppError('Invalid email or password', 401, 'AUTHENTICATION_ERROR');
      }
      
      const passwordValid = await verifyPassword(password, user.password);
      if (!passwordValid) {
        throw new AppError('Invalid email or password', 401, 'AUTHENTICATION_ERROR');
      }
      
      // [GENERATE] Create auth tokens
      const tokenPayload = { userId: user.id, username: user.username };
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      
      // [UPDATE] Update user status to ONLINE
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ONLINE' },
      });
      
      // [STORE] Save refresh token to database
      await fastify.prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
        },
      });
      
      // [RESPOND] Return user data and tokens
      return reply.send({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: 'ONLINE',
          statusMessage: user.statusMessage,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      // [ERROR] Pass validation errors to global handler
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      // [LOG] Log unexpected errors
      logger.error('Login error:', error);
      throw error;
    }
  });
  
  /**
   * [REFRESH] Issue new access token using refresh token
   * POST /api/auth/refresh
   */
  fastify.post('/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // [PARSE] Validate request body
      const { refreshToken } = refreshTokenSchema.parse(request.body);
      
      // [VERIFY] Decode and verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // [FIND] Check if token exists in database
      const session = await fastify.prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });
      
      if (!session || session.userId !== decoded.userId) {
        throw new AppError('Invalid refresh token', 401, 'AUTHENTICATION_ERROR');
      }
      
      if (new Date() > session.expiresAt) {
        // [CLEANUP] Remove expired session
        await fastify.prisma.session.delete({
          where: { id: session.id },
        });
        throw new AppError('Refresh token expired', 401, 'AUTHENTICATION_ERROR');
      }
      
      // [GENERATE] Create new access token
      const tokenPayload = { userId: session.userId, username: session.user.username };
      const newToken = generateToken(tokenPayload);
      
      // [RESPOND] Return new access token
      return reply.send({
        success: true,
        token: newToken,
      });
    } catch (error) {
      // [ERROR] Pass validation errors to global handler
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      // [LOG] Log unexpected errors
      logger.error('Token refresh error:', error);
      throw error;
    }
  });
  
  /**
   * [LOGOUT] Invalidate refresh token
   * POST /api/auth/logout
   */
  fastify.post('/logout', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
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
  }, async (request, reply) => {
    try {
      // [PARSE] Validate request body
      const { refreshToken } = refreshTokenSchema.parse(request.body);
      
      // [DELETE] Remove session from database
      await fastify.prisma.session.deleteMany({
        where: { refreshToken },
      });
      
      // [RESPOND] Confirm logout
      return reply.send({
        success: true,
        message: 'Successfully logged out',
      });
    } catch (error) {
      // [ERROR] Pass validation errors to global handler
      if (error instanceof z.ZodError) {
        throw error;
      }
      
      // [LOG] Log unexpected errors
      logger.error('Logout error:', error);
      throw error;
    }
  });
});

export default authRoutes;
