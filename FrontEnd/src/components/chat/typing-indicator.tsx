// =============================================
// ============== CODEX TYPING ===============
// =============================================
// Typing indicator component for C.H.A.O.S.
// Classic MSN Messenger "X is typing..." indicator

import React from 'react';
import { cn } from '../../lib/utils';

interface TypingIndicatorProps {
  username?: string;
  className?: string;
}

/**
 * TypingIndicator component
 * 
 * Shows the classic MSN-style typing animation
 * with "X is typing..." text and animated dots
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  username = 'Someone',
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 text-xs text-msn-blue italic',
      className
    )}>
      <div className="flex items-center text-xs">
        {username} is typing
        <span className="typing-animation ml-0.5">.</span>
        <span className="typing-animation ml-0.5 animation-delay-200">.</span>
        <span className="typing-animation ml-0.5 animation-delay-400">.</span>
      </div>
      
      {/* Animated pencil icon - classic MSN style */}
      <div className="w-4 h-4 typing-pencil">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="feather feather-edit-2"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      </div>
      
      <style jsx>{`
        .typing-animation {
          opacity: 0;
          animation: typingDots 1.4s infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .typing-pencil {
          animation: typingPencil 1s infinite;
        }
        @keyframes typingDots {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes typingPencil {
          0% { transform: translateX(0) translateY(0) rotate(0); }
          25% { transform: translateX(-1px) translateY(-1px) rotate(-5deg); }
          75% { transform: translateX(1px) translateY(1px) rotate(5deg); }
          100% { transform: translateX(0) translateY(0) rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
