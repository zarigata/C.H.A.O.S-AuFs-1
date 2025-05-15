// =============================================
// =========== CODEX AUTH MIDDLEWARE ===========
// =============================================
// ########## SECURE AUTH TOKEN VALIDATOR ######
// ##### JWT VERIFICATION & SESSION CONTROL ####
// #########################################
// Authentication middleware for C.H.A.O.S.
// Cross-platform token verification system

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

const prisma = new PrismaClient();

/**
 * Authentication middleware
 * 
 * Verifies JWT tokens in Authorization header
 * Adds user object to request for downstream handlers
 * Blocks unauthorized access to protected routes
 */
export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Extract and verify JWT token
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      });
    }
    
    // Decode and verify token
    try {
      const decoded = request.server.jwt.verify(token);
      const userId = (decoded as any).id;
      
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          status: true,
          customStatus: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'User not found or token invalid'
        });
      }
      
      // Add user to request object for downstream handlers
      (request as any).user = user;
      
    } catch (tokenError) {
      // Token verification failed
      return reply.status(401).send({
        success: false,
        error: 'Authentication failed. Token expired or invalid.'
      });
    }
  } catch (error) {
    // Unexpected error
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

/**
 * Role-based authorization middleware
 * 
 * Ensures the authenticated user has the required role
 * Can restrict access to admin-only routes
 * 
 * @param roles - Array of roles allowed to access the route
 */
export const roleMiddleware = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!roles.includes(user.role)) {
      return reply.status(403).send({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }
  };
};

/**
 * Admin-only middleware
 * 
 * Shorthand for roleMiddleware(['ADMIN'])
 * Restricts routes to administrators only
 */
export const adminMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required'
    });
  }
  
  if (user.role !== 'ADMIN') {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required'
    });
  }
};

/**
 * Fastify plugin for authentication
 * 
 * Registers JWT verification and sets up authentication hooks
 */
export default fp(async (fastify) => {
  // Register JWT plugin if not already registered
  if (!fastify.hasPlugin('jwt')) {
    fastify.register(require('@fastify/jwt'), {
      secret: process.env.JWT_SECRET || 'super_secret_key_change_in_production'
    });
  }
  
  // Register authentication decorator
  fastify.decorate('authenticate', authMiddleware);
  fastify.decorate('authorizeAdmin', adminMiddleware);
  fastify.decorate('authorizeRoles', roleMiddleware);
});
