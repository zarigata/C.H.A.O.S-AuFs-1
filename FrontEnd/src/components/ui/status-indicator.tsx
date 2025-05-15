// =============================================
// ============== CODEX STATUS ===============
// =============================================
// Status indicator component for C.H.A.O.S.
// Displays user online/offline status with classic MSN-style visuals

import React from 'react';
import { cn } from '../../lib/utils';
import { UserStatus } from '../../types';

interface StatusIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withAnimation?: boolean;
  withLabel?: boolean;
}

/**
 * StatusIndicator component
 * 
 * Displays online status with MSN-style indicators:
 * - Green: Online
 * - Yellow: Away (with blinking animation)
 * - Red: Busy
 * - Gray: Offline
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  className,
  withAnimation = true,
  withLabel = false,
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  // Status class mapping (MSN Messenger style)
  const statusClasses = {
    ONLINE: 'bg-msn-green',
    AWAY: withAnimation ? 'bg-msn-yellow animate-status-blink' : 'bg-msn-yellow',
    BUSY: 'bg-msn-red',
    OFFLINE: 'bg-msn-gray',
  };
  
  // Status labels
  const statusLabels = {
    ONLINE: 'Online',
    AWAY: 'Away',
    BUSY: 'Busy',
    OFFLINE: 'Offline',
  };
  
  return (
    <div className="flex items-center gap-1.5">
      <div 
        className={cn(
          'rounded-full',
          sizeClasses[size],
          statusClasses[status],
          className
        )}
      />
      {withLabel && (
        <span className="text-xs font-medium">{statusLabels[status]}</span>
      )}
    </div>
  );
};

export default StatusIndicator;
