// =============================================
// ============== CODEX CONTACT ==============
// =============================================
// Contact card component for C.H.A.O.S.
// MSN Messenger-style contact display with status indicator

import React from 'react';
import { cn } from '../../lib/utils';
import StatusIndicator from './status-indicator';
import { User } from '../../types';

interface ContactCardProps {
  user: User;
  isSelected?: boolean;
  showCustomStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * ContactCard component
 * 
 * Classic MSN Messenger-style contact display with:
 * - User avatar/initials
 * - Username and display name
 * - Online status indicator
 * - Custom status message
 */
const ContactCard: React.FC<ContactCardProps> = ({
  user,
  isSelected = false,
  showCustomStatus = true,
  onClick,
  className,
}) => {
  // Generate initial letters for avatar fallback
  const initials = user.displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <div
      className={cn(
        'p-2.5 rounded-md cursor-pointer transition-colors relative',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        isSelected && 'bg-slate-100 dark:bg-slate-800',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-msn-blue text-white flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">{initials}</span>
            )}
          </div>
          
          {/* Status indicator positioned at bottom-right of avatar */}
          <div className="absolute -bottom-0.5 -right-0.5 border-2 border-background rounded-full">
            <StatusIndicator status={user.status} size="sm" />
          </div>
        </div>
        
        {/* User info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{user.displayName}</span>
            {user.status === 'AWAY' && (
              <span className="text-xs text-msn-yellow">Away</span>
            )}
          </div>
          
          {/* Username or custom status */}
          <span className="text-xs text-muted-foreground truncate">
            {showCustomStatus && user.customStatus 
              ? user.customStatus 
              : `@${user.username}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
