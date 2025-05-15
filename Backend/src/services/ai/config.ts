// =============================================
// ============ CODEX AI CONFIG ===============
// =============================================
// AI Service configuration for C.H.A.O.S.
// Ollama integration with customizable settings

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Default AI configuration
 * - Uses llama3.2 as default model
 * - Provides settings for temperature, top_p, etc.
 * - Supports platform-independent operation
 */
export interface AIConfig {
  enabled: boolean;
  modelName: string;
  baseUrl: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  preprompt: string;
}

// Default configuration that will be used if no config file exists
const defaultConfig: AIConfig = {
  enabled: true,
  modelName: 'llama3.2', // Default model as specified
  baseUrl: 'http://localhost:11434', // Default Ollama API URL
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  systemPrompt: "You are CHAOS-AI, a helpful AI assistant integrated into the C.H.A.O.S messaging application. Your purpose is to assist users with information, answer questions, and help with tasks.",
  preprompt: ""
};

/**
 * Get AI configuration from file or environment variables
 * Falls back to default configuration if not found
 * Ensures cross-platform compatibility by using path.join
 */
export function getAIConfig(): AIConfig {
  // Load environment variables
  dotenv.config();
  
  // Check if we have environment variables for this
  if (process.env.AI_MODEL_NAME || process.env.AI_BASE_URL) {
    return {
      enabled: process.env.AI_ENABLED !== 'false',
      modelName: process.env.AI_MODEL_NAME || defaultConfig.modelName,
      baseUrl: process.env.AI_BASE_URL || defaultConfig.baseUrl,
      temperature: parseFloat(process.env.AI_TEMPERATURE || defaultConfig.temperature.toString()),
      topP: parseFloat(process.env.AI_TOP_P || defaultConfig.topP.toString()),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || defaultConfig.maxTokens.toString()),
      systemPrompt: process.env.AI_SYSTEM_PROMPT || defaultConfig.systemPrompt,
      preprompt: process.env.AI_PREPROMPT || defaultConfig.preprompt,
    };
  }
  
  // Check for config file
  const configPath = path.join(__dirname, '..', '..', '..', 'config', 'ai-config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return {
        ...defaultConfig,
        ...fileConfig
      };
    }
  } catch (error) {
    console.error('Error loading AI config:', error);
  }
  
  return defaultConfig;
}

/**
 * Save AI configuration to file
 * Creates the config directory if it doesn't exist
 */
export async function saveAIConfig(config: Partial<AIConfig>): Promise<void> {
  const configDir = path.join(__dirname, '..', '..', '..', 'config');
  const configPath = path.join(configDir, 'ai-config.json');
  
  const updatedConfig = {
    ...defaultConfig,
    ...config
  };
  
  try {
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write config to file
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
  } catch (error) {
    console.error('Error saving AI config:', error);
    throw error;
  }
}
