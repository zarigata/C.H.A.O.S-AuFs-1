/**
 * ███████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. ERROR HANDLER                                   █
 * █ Global error handling middleware for consistent responses  █
 * ███████████████████████████████████████████████████████████████
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * [TYPES] Custom error class for application-specific errors
 * Allows attaching status codes and custom error codes
 */
export class AppError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * [CONFIG] Error mapping between error types and HTTP status codes
 */
const ERROR_TYPES = {
  VALIDATION_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  NOT_FOUND_ERROR: 404,
  RATE_LIMIT_ERROR: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * [UTIL] Format Zod validation errors into user-friendly format
 */
const formatZodError = (error: ZodError) => {
  return {
    message: 'Validation error',
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
};

/**
 * [CORE] Global error handler middleware for Fastify
 * Processes all uncaught errors and returns appropriate responses
 */
export const errorHandler = (
  error: FastifyError | Error | AppError | ZodError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // [LOG] Log all errors for debugging and monitoring
  logger.error(`Error handling request to ${request.url}:`, error);

  // [AUTH] JWT authentication errors
  if (error.name === 'UnauthorizedError' || error.message.includes('authorization')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
      },
    });
  }

  // [VAL] Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        ...formatZodError(error),
      },
    });
  }

  // [APP] Custom application errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
      },
    });
  }

  // [HTTP] Fastify HTTP errors
  if ('statusCode' in error && error.statusCode) {
    const statusCode = error.statusCode;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.name || 'API_ERROR',
        message: error.message,
      },
    });
  }

  // [FALLBACK] Unhandled errors (500 Internal Server Error)
  // In production, we hide detailed error messages for security
  const isProd = process.env.NODE_ENV === 'production';
  
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProd 
        ? 'An unexpected error occurred' 
        : error.message || 'Unknown error',
      ...(isProd ? {} : { stack: error.stack }),
    },
  });
};
