// =============================================
// ============== CODEX HEADER ===============
// =============================================
// Header component for C.H.A.O.S.
// MSN Messenger-style header with user status and profile

import React, { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, getInitials } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { useWebSocket, WebSocketEventType } from '../../context/websocket-context';
import { UserStatus } from '../../types';

interface HeaderProps {
  className?: string;
}

/**
 * Header component
 * 
 * Classic MSN Messenger-style header with:
 * - User avatar and profile info
 * - Status selector dropdown
 * - Custom status message
 * - Settings and logout options
 */
const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, logout, updateUser } = useAuth();
  const { sendMessage } = useWebSocket();
  const navigate = useNavigate();
  
  // Status dropdown state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isEditingCustomStatus, setIsEditingCustomStatus] = useState(false);
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  
  // Status options mapping
  const statusOptions: { value: UserStatus; label: string; color: string }[] = [
    { value: 'ONLINE', label: 'Online', color: 'bg-msn-green' },
    { value: 'AWAY', label: 'Away', color: 'bg-msn-yellow' },
    { value: 'BUSY', label: 'Busy', color: 'bg-msn-red' },
    { value: 'OFFLINE', label: 'Appear Offline', color: 'bg-msn-gray' },
  ];
  
  // Get user initials for avatar fallback
  const initials = user ? getInitials(user.displayName) : '??';
  
  // Handle status change
  const handleStatusChange = (status: UserStatus) => {
    if (!user) return;
    
    // Update local state first
    updateUser({ status });
    
    // Close status dropdown
    setIsStatusDropdownOpen(false);
    
    // Send status change to server
    sendMessage({
      type: WebSocketEventType.USER_STATUS,
      payload: { status },
    });
  };
  
  // Handle custom status update
  const handleCustomStatusUpdate = () => {
    if (!user) return;
    
    // Update local state
    updateUser({ customStatus });
    
    // Exit edit mode
    setIsEditingCustomStatus(false);
    
    // TODO: Send custom status update to server
  };
  
  // Handle navigation to settings
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // If no user is logged in, show minimal header
  if (!user) {
    return (
      <div className={cn('flex items-center justify-between p-4 bg-msn-blue text-white', className)}>
        <div className="text-lg font-bold">C.H.A.O.S.</div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      'msn-window-header',
      className
    )}>
      <div className="flex items-center gap-3">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-white text-msn-blue flex items-center justify-center overflow-hidden">
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
        
        {/* User info and status */}
        <div className="flex flex-col">
          <span className="font-medium text-sm text-white">{user.displayName}</span>
          
          {/* Status dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                statusOptions.find(option => option.value === user.status)?.color || 'bg-msn-green'
              )} />
              <span>{statusOptions.find(option => option.value === user.status)?.label || 'Online'}</span>
            </button>
            
            {/* Status dropdown */}
            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-slate-200">
                <div className="py-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-slate-100"
                    >
                      <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Custom status message (editable) */}
          <div className="flex items-center mt-0.5">
            {isEditingCustomStatus ? (
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                onBlur={handleCustomStatusUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomStatusUpdate();
                  }
                }}
                placeholder="Set custom status..."
                className="text-xs bg-transparent border-b border-white/50 text-white w-full focus:outline-none"
                maxLength={40}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingCustomStatus(true)}
                className="text-xs text-white/70 hover:text-white truncate max-w-[150px]"
              >
                {user.customStatus ? user.customStatus : "Click to set status message..."}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSettingsClick}
          className="p-1.5 rounded hover:bg-white/10"
          title="Settings"
        >
          <Settings size={18} className="text-white" />
        </button>
        
        <button
          onClick={handleLogout}
          className="p-1.5 rounded hover:bg-white/10"
          title="Logout"
        >
          <LogOut size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Header;
