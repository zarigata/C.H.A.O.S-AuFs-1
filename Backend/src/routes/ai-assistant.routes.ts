// =============================================
// ========= CODEX AI ASSISTANT ROUTES =========
// =============================================
// AI Assistant routes for C.H.A.O.S.
// Handles Ollama integration for AI responses

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OllamaService } from '../services/ai/ollama-service';
import { getAIConfig, saveAIConfig, AIConfig } from '../services/ai/config';
import { authMiddleware } from '../middlewares/auth';

interface AIMessageRequest {
  message: string;
  conversationId?: string;
  messageHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface AIConfigUpdateRequest {
  config: Partial<AIConfig>;
}

/**
 * AI Assistant routes handler
 * Provides routes for interacting with the AI assistant
 * and configuring the AI settings
 */
export async function aiAssistantRoutes(fastify: FastifyInstance) {
  // Initialize Ollama service
  const ollamaService = new OllamaService();
  
  // Get AI configuration
  fastify.get('/api/ai/config', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = getAIConfig();
      
      // Don't send the system prompt to the client for security reasons
      const clientConfig = {
        ...config,
        systemPrompt: undefined
      };
      
      return reply.send({
        success: true,
        config: clientConfig
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to get AI configuration'
      });
    }
  });
  
  // Update AI configuration (admin only)
  fastify.put(
    '/api/ai/config',
    {
      preHandler: [authMiddleware],
      schema: {
        body: {
          type: 'object',
          required: ['config'],
          properties: {
            config: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                modelName: { type: 'string' },
                baseUrl: { type: 'string' },
                temperature: { type: 'number' },
                topP: { type: 'number' },
                maxTokens: { type: 'number' },
                preprompt: { type: 'string' }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: AIConfigUpdateRequest }>, reply: FastifyReply) => {
      try {
        const { config } = request.body;
        
        // Get user from request (added by authMiddleware)
        const user = (request as any).user;
        
        // Only allow admins to update configuration
        if (user.role !== 'ADMIN') {
          return reply.status(403).send({
            success: false,
            error: 'Only administrators can update AI configuration'
          });
        }
        
        // Update service config
        ollamaService.updateConfig(config);
        
        // Save to file
        await saveAIConfig(config);
        
        return reply.send({
          success: true,
          message: 'AI configuration updated successfully'
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to update AI configuration'
        });
      }
    }
  );
  
  // Send message to AI assistant
  fastify.post(
    '/api/ai/message',
    {
      preHandler: [authMiddleware],
      schema: {
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' },
            conversationId: { type: 'string' },
            messageHistory: {
              type: 'array',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: AIMessageRequest }>, reply: FastifyReply) => {
      try {
        const { message, messageHistory = [] } = request.body;
        
        // Get AI response
        const response = await ollamaService.generateCompletion(message, messageHistory);
        
        return reply.send({
          success: true,
          response
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: error.message || 'Failed to get AI response'
        });
      }
    }
  );
  
  // Stream message to AI assistant
  fastify.post(
    '/api/ai/stream',
    {
      preHandler: [authMiddleware],
      schema: {
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' },
            conversationId: { type: 'string' },
            messageHistory: {
              type: 'array',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: AIMessageRequest }>, reply: FastifyReply) => {
      try {
        const { message, messageHistory = [] } = request.body;
        
        // Set headers for SSE
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        
        // Send stream events as they come
        await ollamaService.generateStreamingCompletion(
          message,
          (text, done) => {
            reply.raw.write(`data: ${JSON.stringify({ text, done })}\n\n`);
            
            if (done) {
              reply.raw.end();
            }
          },
          messageHistory
        );
      } catch (error: any) {
        // If we haven't started streaming yet, send error as JSON
        if (!reply.sent) {
          return reply.status(500).send({
            success: false,
            error: error.message || 'Failed to stream AI response'
          });
        }
        
        // Otherwise send error as SSE event
        reply.raw.write(`data: ${JSON.stringify({ 
          text: `Error: ${error.message || 'Failed to stream AI response'}`, 
          done: true,
          error: true
        })}\n\n`);
        reply.raw.end();
      }
    }
  );
  
  // Check if Ollama is available
  fastify.get('/api/ai/status', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isAvailable = await ollamaService.isAvailable();
      
      return reply.send({
        success: true,
        available: isAvailable
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to check AI status'
      });
    }
  });
  
  // List available models
  fastify.get('/api/ai/models', { preHandler: [authMiddleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const models = await ollamaService.listModels();
      
      return reply.send({
        success: true,
        models
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to list AI models'
      });
    }
  });
}
