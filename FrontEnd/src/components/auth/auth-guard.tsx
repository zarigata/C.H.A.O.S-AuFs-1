// =============================================
// ============== CODEX AUTH GUARD ===========
// =============================================
// Authentication guard component for C.H.A.O.S.
// Protects routes from unauthorized access
// Redirects to login if not authenticated

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard component
 * Protects routes from unauthorized access
 * Redirects to login if not authenticated
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Store the attempted URL for redirecting back after login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localStorage.setItem('chaos-redirect', location.pathname);
    }
  }, [isAuthenticated, isLoading, location]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-foreground">Loading CHAOS...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render protected content
  return <>{children}</>;
};

export default AuthGuard;
