/**
 * ██████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. AUTHENTICATION UTILITIES                       █
 * █ Security and token management for user authentication     █
 * ██████████████████████████████████████████████████████████████
 */

import { FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';

// [TYPES] Token payload structure
interface TokenPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * [HASH] Generate password hash
 * Creates a secure bcrypt hash of user passwords
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Industry-standard security level
  return bcrypt.hash(password, saltRounds);
};

/**
 * [VERIFY] Compare password with hash
 * Verifies a password against its stored hash
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * [TOKEN] Generate JWT access token
 * Creates a short-lived JWT for API authentication
 */
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * [REFRESH] Generate refresh token 
 * Creates a long-lived token for refreshing access tokens
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_key';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * [VERIFY] Verify JWT token
 * Validates and decodes a JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401, 'AUTHENTICATION_ERROR');
  }
};

/**
 * [VERIFY] Verify refresh token
 * Validates and decodes a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_key';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401, 'AUTHENTICATION_ERROR');
  }
};

/**
 * [EXTRACT] Get token from request
 * Extracts JWT token from authorization header
 */
export const extractTokenFromRequest = (request: FastifyRequest): string | null => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * [GENERATE] Create random token
 * Utility for generating secure random tokens
 */
export const generateRandomToken = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
};
