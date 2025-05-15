// =============================================================================
// ======================== CODEX v1.0.3 DASHBOARD ============================
// =============================================================================
// c0d3z by: CHAOS Dev Team
// FR33 COMMUNICATION IN 2025 - UPLD: 05/14/2025
// VX-MSN-ENGINE VERSION: 1.0.3-STABLE
// ***************************************************************************
// This component implements the main dashboard interface
// Classic MSN Messenger inspired with modern features
// Uses the WebSocket context for real-time communications
// ***************************************************************************

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Search, Bell, Send, Smile, Shield } from 'lucide-react';

import MainLayout from '../components/layout/main-layout';
import ContactsList from '../components/layout/contacts-list';
import MessageBubble from '../components/chat/message-bubble';
import MessageInput from '../components/chat/message-input';
import TypingIndicator from '../components/chat/typing-indicator';
import { useAuth } from '../context/auth-context';
import { useWebSocket, WebSocketEventType } from '../context/websocket-context';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isEncrypted: boolean;
}

interface Conversation {
  id: string;
  displayName: string;
  avatar?: string;
  status: 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  isTyping: boolean;
  unreadCount: number;
  lastMessage?: string;
  messages: Message[];
}

/**
 * Dashboard Page Component
 * 
 * The main interface of the C.H.A.O.S. application featuring:
 * - Contact list with online/offline groupings
 * - Chat area with message bubbles
 * - Message input with emoji and encryption support
 * - Real-time typing indicators and online status
 */
const Dashboard: React.FC = () => {
  // Auth and navigation hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected, sendMessage } = useWebSocket();
  
  // Application state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Fetch conversations on mount
  useEffect(() => {
    if (user && connected) {
      // In a real app, we would fetch conversations from the server
      // For now, we'll use mock data
      
      // Send request to server to get conversations
      sendMessage({
        type: WebSocketEventType.GET_CONVERSATIONS,
        payload: {},
      });
      
      // Mock response
      const mockConversations: Conversation[] = [
        {
          id: '1',
          displayName: 'Alice Smith',
          status: 'ONLINE',
          isTyping: false,
          unreadCount: 2,
          lastMessage: 'Hey, how are you doing?',
          messages: [
            {
              id: '101',
              senderId: '1',
              content: 'Hey there! How are you?',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              isEncrypted: false,
            },
            {
              id: '102',
              senderId: user.id, // Current user's sent message
              content: 'I\'m good, thanks! Working on that project we discussed.',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              isEncrypted: false,
            },
            {
              id: '103',
              senderId: '1',
              content: 'That sounds great! When do you think you\'ll be finished?',
              createdAt: new Date(Date.now() - 900000).toISOString(),
              isEncrypted: false,
            }
          ],
        },
        {
          id: '2',
          displayName: 'Bob Johnson',
          status: 'BUSY',
          isTyping: false,
          unreadCount: 0,
          messages: [
            {
              id: '201',
              senderId: '2',
              content: 'Did you see the game last night?',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              isEncrypted: false,
            }
          ],
        },
        {
          id: '3',
          displayName: 'Carol Williams',
          status: 'AWAY',
          isTyping: true,
          unreadCount: 0,
          lastMessage: 'See you tomorrow!',
          messages: [
            {
              id: '301',
              senderId: '3',
              content: 'Hey, are we still meeting tomorrow?',
              createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              isEncrypted: false,
            },
            {
              id: '302',
              senderId: user.id,
              content: 'Yes, 2pm at the coffee shop works for me.',
              createdAt: new Date(Date.now() - 172700000).toISOString(),
              isEncrypted: false,
            },
            {
              id: '303',
              senderId: '3',
              content: 'Perfect! See you tomorrow!',
              createdAt: new Date(Date.now() - 172600000).toISOString(),
              isEncrypted: false,
            }
          ],
        },
      ];
      
      setConversations(mockConversations);
      
      // Set first conversation as active if none is selected
      if (!activeConversation && mockConversations.length > 0) {
        setActiveConversation(mockConversations[0].id);
      }
    }
  }, [user, connected, activeConversation, sendMessage]);
  
  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    if (!activeConversation || !content.trim()) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || '',
      content,
      createdAt: new Date().toISOString(),
      isEncrypted,
    };
    
    // Update local state
    setConversations(conversations.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: content,
          unreadCount: 0,
        };
      }
      return conv;
    }));
    
    // Send message to server
    sendMessage({
      type: WebSocketEventType.SEND_MESSAGE,
      payload: {
        conversationId: activeConversation,
        content,
        isEncrypted,
      },
    });
    
    // When user sends a message, we can assume they've read all messages in the conversation
    // So we reset the unread count
    setConversations(conversations.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          unreadCount: 0,
        };
      }
      return conv;
    }));
  };
  
  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark conversation as read
    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
        };
      }
      return conv;
    }));
    
    // Send read receipts to server
    sendMessage({
      type: WebSocketEventType.MARK_AS_READ,
      payload: {
        conversationId,
      },
    });
  };
  
  // Filter conversations by search query
  const filteredConversations = searchQuery
    ? conversations.filter(c => 
        c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;
  
  // Get the active conversation object
  const currentConversation = conversations.find(
    c => c.id === activeConversation
  );
  
  // Render the dashboard layout with contacts sidebar
  return (
    <MainLayout
      sidebar={
        <div className="flex flex-col h-full">
          {/* Search and user profile area */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="msn-input pl-10 w-full"
              />
            </div>
          </div>
          
          {/* Contacts list */}
          <div className="flex-1 overflow-y-auto">
            <ContactsList
              conversations={filteredConversations}
              activeConversationId={activeConversation}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          
          {/* User controls */}
          <div className="p-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
              title="Settings"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
              title="Profile"
              onClick={() => navigate('/profile')}
            >
              <User size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
              title="Notifications"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      }
    >
      {/* Main chat area */}
      {currentConversation ? (
        <div className="flex flex-col h-full">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-slate-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-msn-blue flex items-center justify-center text-white font-medium mr-3">
                {currentConversation.avatar ? (
                  <img 
                    src={currentConversation.avatar} 
                    alt={currentConversation.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentConversation.displayName.charAt(0)
                )}
              </div>
              <div>
                <h2 className="font-semibold">{currentConversation.displayName}</h2>
                <div className="flex items-center">
                  <span className={cn(
                    'w-2 h-2 rounded-full mr-1.5',
                    currentConversation.status === 'ONLINE' && 'bg-msn-green',
                    currentConversation.status === 'BUSY' && 'bg-msn-red',
                    currentConversation.status === 'AWAY' && 'bg-msn-yellow',
                    currentConversation.status === 'OFFLINE' && 'bg-msn-gray',
                  )}></span>
                  <span className="text-xs text-gray-500">
                    {currentConversation.status.charAt(0) + currentConversation.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
            {currentConversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === user?.id}
                senderName={message.senderId === user?.id ? 'You' : currentConversation.displayName}
              />
            ))}
            
            {/* Typing indicator */}
            {currentConversation.isTyping && (
              <TypingIndicator username={currentConversation.displayName} />
            )}
          </div>
          
          {/* Message input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-3">
            <MessageInput 
              onSendMessage={handleSendMessage} 
              isEncrypted={isEncrypted}
              onToggleEncryption={() => setIsEncrypted(!isEncrypted)}
            />
            
            {/* Encryption indicator */}
            {isEncrypted && (
              <div className="flex items-center justify-center mt-1">
                <Shield size={12} className="text-msn-green mr-1" />
                <span className="text-xs text-msn-green">End-to-end encrypted</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No conversation selected */
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-slate-900">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-msn-blue/10 flex items-center justify-center">
              <Send size={28} className="text-msn-blue" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No conversation selected</h2>
            <p className="text-gray-500 max-w-sm">
              Select a contact from the list to start chatting or create a new conversation.
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
