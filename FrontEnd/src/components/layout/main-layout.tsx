// =============================================
// ============== CODEX LAYOUT ===============
// =============================================
// Main layout component for C.H.A.O.S.
// Classic MSN Messenger-inspired window layout

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import Header from './header';

interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarWidth?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * MainLayout component
 * 
 * Provides the classic MSN Messenger window layout with:
 * - Header with user info
 * - Optional sidebar (typically contacts list)
 * - Main content area
 * - Consistent window styling
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebar,
  sidebarWidth = 280,
  showHeader = true,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col h-screen max-h-screen bg-slate-100 dark:bg-slate-900',
      'msn-window',
      className
    )}>
      {/* Header with user info and controls */}
      {showHeader && <Header />}
      
      {/* Main content area with optional sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (if provided) */}
        {sidebar && (
          <div 
            className="msn-sidebar" 
            style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
          >
            {sidebar}
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
