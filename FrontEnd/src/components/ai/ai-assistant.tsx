// =============================================
// ========== CODEX AI ASSISTANT v2.0 ==========
// =============================================
// ########## NEURAL CONVERSATION #############
// ######## POWERED BY OLLAMA/LLAMA3 ##########
// #########################################
// AI Assistant component for C.H.A.O.S.
// Neural text generation using Ollama integration
// Default model: llama3.2 as per specification

import React, { useState, useEffect, useRef } from 'react';
import { Bot, SendHorizontal, Settings, X, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { cn } from '../../lib/utils';
import { useWebSocket } from '../../context/websocket-context';
import axios from 'axios';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AIConfig {
  enabled: boolean;
  modelName: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

/**
 * AI Assistant Component
 * 
 * MSN-styled AI assistant powered by Ollama with:
 * - Chat interface for interacting with AI
 * - Conversation history
 * - Streaming responses
 * - Model configuration options
 */
const AIAssistant: React.FC = () => {
  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean>(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // When the component mounts, check AI status and config
  useEffect(() => {
    if (isOpen) {
      checkAIStatus();
      fetchAIConfig();
      fetchAvailableModels();
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Hello! I am C.H.A.O.S. AI Assistant. How can I help you today?',
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [isOpen]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check if Ollama AI service is available
  const checkAIStatus = async () => {
    try {
      const response = await axios.get('/api/ai/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiAvailable(response.data.available);
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiAvailable(false);
    }
  };
  
  // Fetch AI configuration
  const fetchAIConfig = async () => {
    try {
      const response = await axios.get('/api/ai/config', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiConfig(response.data.config);
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
    }
  };
  
  // Fetch available AI models
  const fetchAvailableModels = async () => {
    try {
      const response = await axios.get('/api/ai/models', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableModels(response.data.models);
    } catch (error) {
      console.error('Failed to fetch available models:', error);
    }
  };
  
  // Update AI configuration
  const updateAIConfig = async (newConfig: Partial<AIConfig>) => {
    try {
      await axios.put('/api/ai/config', 
        { config: newConfig },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      // Update local state
      setAiConfig(prev => prev ? { ...prev, ...newConfig } : null);
      
      // Add system message
      setMessages(prev => [
        ...prev,
        {
          id: `system_${Date.now()}`,
          role: 'system',
          content: `AI configuration updated. Model: ${newConfig.modelName || aiConfig?.modelName}`,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Failed to update AI config:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'system',
          content: 'Failed to update AI configuration. You may not have permission.',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !aiAvailable) return;
    
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Create a placeholder for the AI response
    const aiMessageId = `ai_${Date.now()}`;
    const aiMessage: AIMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    
    // Update messages state
    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get message history for context (last 10 messages)
      const messageHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Use streaming API for more interactive feel
      const eventSource = new EventSource(`/api/ai/stream?message=${encodeURIComponent(input)}&history=${encodeURIComponent(JSON.stringify(messageHistory))}`);
      
      let fullResponse = '';
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        fullResponse += data.text;
        
        // Update the AI message content
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullResponse, isStreaming: !data.done } 
            : msg
        ));
        
        // If streaming is done, close the connection
        if (data.done) {
          eventSource.close();
          setIsLoading(false);
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
        
        // Update the AI message to show error
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: 'Sorry, I encountered an error while processing your request. Please try again later.', 
                isStreaming: false 
              } 
            : msg
        ));
      };
    } catch (error) {
      console.error('Failed to send message to AI:', error);
      setIsLoading(false);
      
      // Update the AI message to show error
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error while processing your request. Please try again later.', 
              isStreaming: false 
            } 
          : msg
      ));
    }
  };
  
  // Clear conversation
  const clearConversation = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversation cleared. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Toggle AI assistant
  const toggleAssistant = () => {
    setIsOpen(prev => !prev);
  };
  
  // Render the component
  return (
    <>
      {/* Floating button to open AI assistant */}
      {!isOpen && (
        <button
          onClick={toggleAssistant}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-msn-blue text-white flex items-center justify-center shadow-lg hover:bg-msn-darkBlue transition-colors"
          title="AI Assistant"
        >
          <Bot size={24} />
        </button>
      )}
      
      {/* AI assistant dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-md shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-slate-800">
          {/* Header */}
          <div className="bg-msn-blue p-3 text-white flex items-center justify-between">
            <div className="flex items-center">
              <Bot size={20} className="mr-2" />
              <h3 className="font-semibold">C.H.A.O.S. AI Assistant</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 rounded hover:bg-white/10"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={toggleAssistant}
                className="p-1 rounded hover:bg-white/10"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* AI not available message */}
          {!aiAvailable && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
                <Shield size={14} className="mr-1 flex-shrink-0" /> 
                AI service is unavailable. Please check if Ollama is running.
              </p>
            </div>
          )}
          
          {/* Settings panel */}
          {showSettings && (
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 overflow-y-auto">
              <h4 className="font-medium mb-3">AI Settings</h4>
              
              {/* Model selection */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <select
                  value={aiConfig?.modelName || 'llama3.2'}
                  onChange={(e) => updateAIConfig({ modelName: e.target.value })}
                  className="msn-input w-full"
                  disabled={availableModels.length === 0}
                >
                  {availableModels.length > 0 ? (
                    availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))
                  ) : (
                    <option value="llama3.2">llama3.2 (Default)</option>
                  )}
                </select>
              </div>
              
              {/* Temperature setting */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temperature: {aiConfig?.temperature.toFixed(1) || '0.7'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiConfig?.temperature || 0.7}
                  onChange={(e) => updateAIConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={clearConversation}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center"
                >
                  <RefreshCw size={14} className="mr-1" /> Clear Chat
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-sm bg-msn-blue text-white px-3 py-1 rounded hover:bg-msn-darkBlue"
                >
                  Done
                </button>
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "mb-3 max-w-[85%] rounded-lg p-3",
                  message.role === 'user' && "ml-auto bg-msn-blue text-white",
                  message.role === 'assistant' && "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700",
                  message.role === 'system' && "mx-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm py-1 px-3"
                )}
              >
                {message.content}
                {message.isStreaming && (
                  <div className="mt-1 flex space-x-1">
                    <div className="w-1 h-1 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
            <div className="flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-msn-blue resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                rows={1}
                disabled={isLoading || !aiAvailable}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !aiAvailable || !input.trim()}
                className={cn(
                  "ml-2 p-2 rounded-full",
                  (isLoading || !aiAvailable || !input.trim())
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-msn-blue text-white hover:bg-msn-darkBlue"
                )}
              >
                <SendHorizontal size={18} />
              </button>
            </div>
            
            {/* Powered by message */}
            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Powered by Ollama + {aiConfig?.modelName || 'llama3.2'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
