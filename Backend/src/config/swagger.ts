/**
 * ████████████████████████████████████████████████████████████
 * █ C.H.A.O.S. SWAGGER CONFIG                               █
 * █ API documentation configuration                         █
 * ████████████████████████████████████████████████████████████
 */

import { SwaggerOptions } from '@fastify/swagger';

/**
 * [CONFIG] Configure Swagger/OpenAPI documentation 
 * Provides interactive API documentation for frontend developers
 */
export const configureSwagger = (): SwaggerOptions => {
  return {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'C.H.A.O.S. API Documentation',
        description: `
          Communication Hub for Animated Online Socializing
          
          ## Overview
          This API provides the backend services for the C.H.A.O.S. messaging platform.
          The platform combines nostalgic MSN Messenger-like features with modern Discord-like
          capabilities for a unique social communication experience.
          
          ## Authentication
          Most endpoints require authentication via JWT Bearer token.
          Use the /api/auth routes to register and obtain access tokens.
          
          ## Realtime Communication
          WebSocket connections are available at /ws for real-time messaging and status updates.
        `,
        version: '0.1.0',
        contact: {
          name: 'C.H.A.O.S. Development Team',
        },
      },
      externalDocs: {
        url: '/docs',
        description: 'Full API Documentation',
      },
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter your bearer token in the format "Bearer {token}"',
        },
      },
      security: [{ bearerAuth: [] }],
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
    exposeRoute: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
    uiHooks: {
      onRequest: function(request, reply, next) { next(); },
      preHandler: function(request, reply, next) { next(); },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  };
};
