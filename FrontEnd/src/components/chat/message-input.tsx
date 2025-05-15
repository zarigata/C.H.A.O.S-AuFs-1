// =============================================
// ============== CODEX MESSAGE INPUT =========
// =============================================
// Message input component for C.H.A.O.S.
// MSN Messenger style input with typing indicator and emoji support

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { SmileFace, Send, Paperclip, Lock } from 'lucide-react';
import { useWebSocket, WebSocketEventType } from '../../context/websocket-context';
import { useAuth } from '../../context/auth-context';

interface MessageInputProps {
  recipientId: string;
  isDirect?: boolean;
  isEncrypted?: boolean;
  onSendMessage: (content: string, encrypted: boolean) => void;
  className?: string;
  placeholder?: string;
}

/**
 * MessageInput component
 * 
 * MSN Messenger-style message input with:
 * - Classic MSN formatting
 * - Emoji picker support
 * - Typing indicator
 * - Encryption toggle
 * - File attachment (UI only)
 */
const MessageInput: React.FC<MessageInputProps> = ({
  recipientId,
  isDirect = false,
  isEncrypted: initialEncrypted = false,
  onSendMessage,
  className,
  placeholder = "Type a message...",
}) => {
  // State for message content, encryption, and typing status
  const [message, setMessage] = useState<string>("");
  const [isEncrypted, setIsEncrypted] = useState<boolean>(initialEncrypted);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Access auth and websocket contexts
  const { user } = useAuth();
  const { sendMessage } = useWebSocket();
  
  // Effect for handling click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle sending typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendMessage({
        type: WebSocketEventType.USER_TYPING,
        payload: {
          recipientId,
          isTyping: true,
        },
      });
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendMessage({
        type: WebSocketEventType.USER_TYPING,
        payload: {
          recipientId,
          isTyping: false,
        },
      });
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  // Handle text input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };
  
  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle sending message
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    onSendMessage(trimmedMessage, isEncrypted);
    setMessage("");
    
    // Focus input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle adding emoji
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
    
    // Focus input after emoji selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle encryption toggle
  const toggleEncryption = () => {
    setIsEncrypted(prev => !prev);
  };
  
  // Classic MSN emoji mapping
  const classicEmojis = [
    { code: ':)', emoji: '😊' },
    { code: ':(', emoji: '😞' },
    { code: ':D', emoji: '😃' },
    { code: '8)', emoji: '😎' },
    { code: ':P', emoji: '😛' },
    { code: ';)', emoji: '😉' },
    { code: ':O', emoji: '😮' },
    { code: ':@', emoji: '😠' },
    { code: ':S', emoji: '😕' },
    { code: ':|', emoji: '😐' },
    { code: '(H)', emoji: '♥️' },
    { code: '(Y)', emoji: '👍' },
    { code: '(N)', emoji: '👎' },
  ];
  
  return (
    <div className={cn(
      'border-t bg-white dark:bg-slate-900 p-3 msn-window',
      className
    )}>
      {/* Message input area with MSN styling */}
      <div className="flex flex-col">
        {/* Text input area */}
        <div className="relative">
          <textarea 
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[80px] max-h-[200px] p-3 pr-10 rounded border-slate-300 focus:border-msn-blue focus:ring-1 focus:ring-msn-blue resize-none msn-input"
            style={{ 
              fontFamily: "'Segoe UI', Arial, sans-serif" // Classic MSN font
            }}
          />
          
          {/* Emoji picker button */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            {isEncrypted && (
              <span className="text-msn-green" title="Encrypted message">
                🔒
              </span>
            )}
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between mt-2">
          {/* Left side controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 msn-button"
              title="Insert emoji"
            >
              <SmileFace size={18} className="text-msn-blue" />
            </button>
            
            <button 
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 msn-button"
              title="Attach file"
            >
              <Paperclip size={18} className="text-msn-blue" />
            </button>
            
            {isDirect && (
              <button 
                onClick={toggleEncryption}
                className={cn(
                  "p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 msn-button",
                  isEncrypted && "bg-green-50 text-msn-green"
                )}
                title={isEncrypted ? "Encryption enabled" : "Enable encryption"}
              >
                <Lock size={18} className={isEncrypted ? "text-msn-green" : "text-msn-blue"} />
              </button>
            )}
          </div>
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={cn(
              "px-4 py-1.5 rounded font-medium msn-button",
              message.trim() ? "bg-msn-blue text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-1">
              <Send size={16} />
              <span>Send</span>
            </div>
          </button>
        </div>
        
        {/* Emoji Picker */}
        {isEmojiPickerOpen && (
          <div 
            ref={emojiPickerRef} 
            className="absolute bottom-full left-0 bg-white border border-slate-200 rounded-md shadow-lg p-2 z-10"
          >
            <div className="grid grid-cols-7 gap-1">
              {classicEmojis.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(item.emoji)}
                  className="p-2 hover:bg-slate-100 rounded text-lg"
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
