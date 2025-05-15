// =============================================
// ======== CODEX OLLAMA SERVICE v1.0.1 =======
// =============================================
// ########## ENCRYPTED OLLAMA API ############
// ###### (c) 2025 - C.H.A.O.S. TEAM #########
// #########################################
// Neural text generation using Ollama API
// Cross-platform compatible (Windows/Linux)
// Default model: llama3.2

import axios from 'axios';
import { getAIConfig, AIConfig } from './config';

export interface OllamaCompletionOptions {
  prompt: string;
  model?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
    seed?: number;
  };
  system?: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * OllamaService Class
 * 
 * Provides integration with Ollama API for AI text generation
 * Compatible with both Windows and Linux environments
 * Configurable through ai-config.json or environment variables
 */
export class OllamaService {
  private config: AIConfig;
  
  /**
   * Initialize the Ollama service with configuration
   * Falls back to default config if none provided
   */
  constructor(config?: AIConfig) {
    this.config = config || getAIConfig();
  }
  
  /**
   * Generate text completion from Ollama API
   * 
   * @param prompt - User input text
   * @param messageHistory - Previous conversation history for context
   * @returns Generated text response
   */
  async generateCompletion(prompt: string, messageHistory: any[] = []): Promise<string> {
    // Skip if AI is disabled
    if (!this.config.enabled) {
      return "AI is currently disabled. Please check your configuration.";
    }
    
    try {
      // Format conversation history if provided
      const systemPrompt = this.config.systemPrompt;
      let formattedPrompt = prompt;
      
      if (messageHistory.length > 0) {
        formattedPrompt = messageHistory.map(msg => 
          `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
        ).join('\n') + `\nHuman: ${prompt}\nAssistant:`;
      }
      
      // Prepare request payload
      const payload: OllamaCompletionOptions = {
        model: this.config.modelName,
        prompt: formattedPrompt,
        options: {
          temperature: this.config.temperature,
          top_p: this.config.topP,
          num_predict: this.config.maxTokens,
        },
        system: systemPrompt,
      };
      
      // Add preprompt if configured
      if (this.config.preprompt) {
        payload.prompt = this.config.preprompt + '\n\n' + payload.prompt;
      }
      
      // Make API request
      console.log(`[OLLAMA-SVC] Generating completion with model: ${this.config.modelName}`);
      const response = await axios.post(`${this.config.baseUrl}/api/generate`, payload);
      
      return response.data.response;
    } catch (error: any) {
      console.error('[OLLAMA-ERROR] Failed to generate completion:', error.message);
      
      // Check if Ollama is running
      if (error.code === 'ECONNREFUSED') {
        return "Error: Unable to connect to Ollama. Please ensure the Ollama service is running.";
      }
      
      // Check if model exists
      if (error.response?.status === 404) {
        return `Error: Model "${this.config.modelName}" not found. Please run: ollama pull ${this.config.modelName}`;
      }
      
      return `Error: ${error.message}`;
    }
  }
  
  /**
   * Generate streaming text completion from Ollama API
   * 
   * @param prompt - User input text
   * @param callback - Callback function for streaming responses
   * @param messageHistory - Previous conversation history for context
   */
  async generateStreamingCompletion(
    prompt: string,
    callback: (text: string, done: boolean) => void,
    messageHistory: any[] = []
  ): Promise<void> {
    // Skip if AI is disabled
    if (!this.config.enabled) {
      callback("AI is currently disabled. Please check your configuration.", true);
      return;
    }
    
    try {
      // Format conversation history if provided
      const systemPrompt = this.config.systemPrompt;
      let formattedPrompt = prompt;
      
      if (messageHistory.length > 0) {
        formattedPrompt = messageHistory.map(msg => 
          `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
        ).join('\n') + `\nHuman: ${prompt}\nAssistant:`;
      }
      
      // Prepare request payload
      const payload: OllamaCompletionOptions = {
        model: this.config.modelName,
        prompt: formattedPrompt,
        stream: true,
        options: {
          temperature: this.config.temperature,
          top_p: this.config.topP,
          num_predict: this.config.maxTokens,
        },
        system: systemPrompt,
      };
      
      // Add preprompt if configured
      if (this.config.preprompt) {
        payload.prompt = this.config.preprompt + '\n\n' + payload.prompt;
      }
      
      console.log(`[OLLAMA-SVC] Generating streaming completion with model: ${this.config.modelName}`);
      
      // Make streaming API request
      const response = await axios.post(`${this.config.baseUrl}/api/generate`, payload, {
        responseType: 'stream',
      });
      
      // Process the stream
      let buffer = '';
      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf-8');
        
        // Process complete JSON objects
        let startIdx = 0;
        let endIdx = buffer.indexOf('\n', startIdx);
        
        while (endIdx !== -1) {
          const line = buffer.substring(startIdx, endIdx).trim();
          startIdx = endIdx + 1;
          
          if (line) {
            try {
              const data = JSON.parse(line) as OllamaResponse;
              callback(data.response, data.done);
              
              if (data.done) {
                buffer = '';
                break;
              }
            } catch (err) {
              console.error('[OLLAMA-ERROR] Error parsing streaming response:', err);
            }
          }
          
          endIdx = buffer.indexOf('\n', startIdx);
        }
        
        // Keep remaining partial data
        if (startIdx < buffer.length) {
          buffer = buffer.substring(startIdx);
        } else {
          buffer = '';
        }
      });
      
      response.data.on('end', () => {
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer) as OllamaResponse;
            callback(data.response, true);
          } catch (err) {
            console.error('[OLLAMA-ERROR] Error parsing final streaming response:', err);
            callback('', true);
          }
        } else {
          callback('', true);
        }
      });
    } catch (error: any) {
      console.error('[OLLAMA-ERROR] Failed to generate streaming completion:', error.message);
      
      // Check if Ollama is running
      if (error.code === 'ECONNREFUSED') {
        callback("Error: Unable to connect to Ollama. Please ensure the Ollama service is running.", true);
        return;
      }
      
      // Check if model exists
      if (error.response?.status === 404) {
        callback(`Error: Model "${this.config.modelName}" not found. Please run: ollama pull ${this.config.modelName}`, true);
        return;
      }
      
      callback(`Error: ${error.message}`, true);
    }
  }
  
  /**
   * Update service configuration
   * 
   * @param newConfig - New configuration options
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    
    console.log('[OLLAMA-SVC] Configuration updated:', this.config.modelName);
  }
  
  /**
   * Check if Ollama service is available
   * 
   * @returns Boolean indicating if service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.config.baseUrl}/api/version`);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * List available models from Ollama
   * 
   * @returns Array of available model names
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`);
      return response.data.models.map((model: any) => model.name);
    } catch (error) {
      console.error('[OLLAMA-ERROR] Failed to list models:', error);
      return [];
    }
  }
}
