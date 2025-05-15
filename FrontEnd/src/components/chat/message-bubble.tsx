// =============================================
// ============== CODEX MESSAGE BUBBLE ========
// =============================================
// Message bubble component for C.H.A.O.S.
// Displays chat messages in MSN Messenger style

import React from 'react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isEncrypted?: boolean;
  showSender?: boolean;
  className?: string;
}

/**
 * MessageBubble component
 * 
 * MSN Messenger-style message display with:
 * - Different styling for sent/received messages
 * - Sender info (optional)
 * - Timestamp
 * - Encrypted message indicator
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  isEncrypted = false,
  showSender = false,
  className,
}) => {
  // Generate initial letters for sender avatar fallback
  const initials = message.sender?.displayName
    ? message.sender.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';
  
  return (
    <div 
      className={cn(
        'flex',
        isOwnMessage ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div className={cn(
        'max-w-[80%]',
        isOwnMessage ? 'message-out' : 'message-in'
      )}>
        {/* Message container */}
        <div className="flex gap-2">
          {/* Sender avatar (only for received messages when showing sender) */}
          {!isOwnMessage && showSender && (
            <div className="w-8 h-8 rounded-full bg-msn-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              {message.sender?.avatar ? (
                <img 
                  src={message.sender.avatar} 
                  alt={message.sender.displayName} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xs font-medium">{initials}</span>
              )}
            </div>
          )}
          
          {/* Message content */}
          <div className={cn(
            'rounded-2xl p-3 inline-block',
            isOwnMessage 
              ? 'bg-msn-blue text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-foreground',
            isEncrypted && 'border-2 border-msn-green'
          )}>
            {/* Sender name (if showing sender) */}
            {showSender && message.sender && !isOwnMessage && (
              <div className="font-medium text-xs mb-1 text-msn-blue dark:text-msn-lightBlue">
                {message.sender.displayName}
              </div>
            )}
            
            {/* Message text */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
              
              {/* Encrypted indicator */}
              {isEncrypted && (
                <span className="ml-2 text-xs">
                  🔒
                </span>
              )}
            </div>
            
            {/* Timestamp */}
            <div className={cn(
              'text-[10px] mt-1',
              isOwnMessage ? 'text-blue-100' : 'text-slate-500'
            )}>
              {formatRelativeTime(message.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
