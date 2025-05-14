// =============================================
// ============== CODEX AUTH =================
// =============================================
// Authentication context for C.H.A.O.S.
// Handles user authentication state and token management
// Provides login, register, and logout functionality

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// User type definition
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  customStatus?: string;
}

// Authentication context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Authentication provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component
 * Provides authentication functionality to the application
 * Handles token storage, user state, and API requests
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // State for user, loading, and authentication
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  // Load user from local storage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('chaos-token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get user data with the token
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user data');
        }
        
        const userData = await response.json();
        
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('chaos-token');
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  /**
   * Login function
   * Authenticates user with email and password
   * Stores token and user data on success
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies for refresh token
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token
      localStorage.setItem('chaos-token', data.accessToken);
      
      // Set user data
      setUser({
        id: data.id,
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        avatar: data.avatar,
        status: data.status,
        customStatus: data.customStatus,
      });
      
      setIsAuthenticated(true);
      
      // Navigate to dashboard on success
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Register function
   * Creates a new user account
   * Logs in automatically on success
   */
  const register = async (
    username: string, 
    email: string, 
    password: string, 
    displayName: string
  ) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, displayName }),
        credentials: 'include', // Include cookies for refresh token
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store token
      localStorage.setItem('chaos-token', data.accessToken);
      
      // Set user data
      setUser({
        id: data.id,
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        avatar: data.avatar,
        status: data.status || 'ONLINE',
        customStatus: data.customStatus,
      });
      
      setIsAuthenticated(true);
      
      // Navigate to dashboard on success
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logout function
   * Clears user data and token
   * Redirects to login page
   */
  const logout = async () => {
    try {
      const token = localStorage.getItem('chaos-token');
      
      if (token) {
        // Call logout API to invalidate token on server
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include', // Include cookies for refresh token
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('chaos-token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login page
      navigate('/login');
    }
  };
  
  /**
   * Update user data
   * Updates user state with new data
   */
  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, ...userData };
    });
  };
  
  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };
  
  // Provide context to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook
 * Custom hook to access the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
