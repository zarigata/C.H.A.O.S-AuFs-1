// =============================================
// ============== CODEX WEBSOCKET ============
// =============================================
// WebSocket context for C.H.A.O.S.
// Handles real-time communication and events
// Core component for status updates and messaging

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

// WebSocket event types
export enum WebSocketEventType {
  USER_STATUS = 'user:status',
  USER_TYPING = 'user:typing',
  MESSAGE_NEW = 'message:new',
  MESSAGE_UPDATE = 'message:update',
  MESSAGE_DELETE = 'message:delete',
  HUB_UPDATE = 'hub:update',
  CHANNEL_UPDATE = 'channel:update',
  FRIEND_REQUEST = 'friend:request',
  FRIEND_UPDATE = 'friend:update',
}

// WebSocket message interface
export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
}

// WebSocket context type
interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastEvent: WebSocketMessage | null;
}

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws';

// WebSocket provider props
interface WebSocketProviderProps {
  children: React.ReactNode;
}

/**
 * WebSocketProvider component
 * Manages WebSocket connection and message handling
 * Handles reconnection and authentication
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  // State for connection status and messages
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketMessage | null>(null);
  
  // Get authentication state
  const { user, isAuthenticated } = useAuth();
  
  // Connect to WebSocket when authenticated
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    
    // Function to connect to WebSocket
    const connect = () => {
      const token = localStorage.getItem('chaos-token');
      
      if (!isAuthenticated || !token) {
        return;
      }
      
      // Create WebSocket connection with token
      ws = new WebSocket(`${WS_URL}?token=${token}`);
      
      // Handle connection open
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send initial status update
        if (user) {
          ws.send(JSON.stringify({
            type: WebSocketEventType.USER_STATUS,
            payload: { status: user.status },
          }));
        }
      };
      
      // Handle incoming messages
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastEvent(message);
          
          // Handle specific message types
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Handle connection close
      ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        setIsConnected(false);
        
        // Attempt to reconnect after delay
        reconnectTimeout = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      // Handle connection error
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws?.close();
      };
      
      setSocket(ws);
    };
    
    connect();
    
    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated, user]);
  
  // Handle different message types
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case WebSocketEventType.USER_STATUS:
        // Update user status in UI
        console.log('User status update:', message.payload);
        break;
        
      case WebSocketEventType.MESSAGE_NEW:
        // Handle new message
        console.log('New message:', message.payload);
        // Play notification sound for new messages
        playNotificationSound('message');
        break;
        
      case WebSocketEventType.FRIEND_REQUEST:
        // Handle friend request
        console.log('Friend request:', message.payload);
        // Play notification sound for friend requests
        playNotificationSound('notification');
        break;
        
      default:
        console.log('Unhandled message type:', message.type);
    }
  };
  
  // Play notification sounds (MSN Messenger style)
  const playNotificationSound = (type: 'message' | 'login' | 'notification') => {
    const sounds = {
      message: '/sounds/msn-message.mp3',
      login: '/sounds/msn-login.mp3',
      notification: '/sounds/msn-notification.mp3',
    };
    
    try {
      const sound = new Audio(sounds[type]);
      sound.volume = 0.5; // 50% volume
      sound.play().catch(err => console.error('Error playing sound:', err));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };
  
  // Send message through WebSocket
  const sendMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  };
  
  // Context value
  const value = {
    isConnected,
    sendMessage,
    lastEvent,
  };
  
  // Provide context to children
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * useWebSocket hook
 * Custom hook to access the WebSocket context
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
};
