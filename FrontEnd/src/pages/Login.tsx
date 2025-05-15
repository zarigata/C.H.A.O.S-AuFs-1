// =============================================
// ============== CODEX LOGIN ================
// =============================================
// Login page component for C.H.A.O.S.
// MSN Messenger-style login screen with animated background

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

/**
 * Login Page Component
 * 
 * Provides MSN Messenger-style login experience with:
 * - Classic blue gradient background
 * - Email/password login form
 * - Error handling and validation
 * - Remember me functionality
 * - Link to registration
 */
const Login: React.FC = () => {
  // Form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get auth context and navigation
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Load remembered email if exists
    const savedEmail = localStorage.getItem('chaos-remembered-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [isAuthenticated, navigate]);
  
  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('chaos-remembered-email', email);
    } else {
      localStorage.removeItem('chaos-remembered-email');
    }
    
    // Attempt login
    setIsLoading(true);
    try {
      await login(email, password);
      // Redirect handled by AuthProvider
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Play classic MSN login sound on component mount
  useEffect(() => {
    try {
      const loginSound = new Audio('/sounds/msn-login.mp3');
      loginSound.volume = 0.5; // 50% volume
      loginSound.play().catch(err => console.error('Error playing sound:', err));
    } catch (error) {
      console.error('Error playing login sound:', error);
    }
  }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-msn-blue to-msn-lightBlue p-4">
      <div className="w-full max-w-md">
        {/* Login container */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-msn-blue p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12 text-msn-blue"
              >
                <circle cx="12" cy="12" r="10" fill="#245EDC" stroke="currentColor" />
                <path d="M7 9a5 5 0 0 0 10 0M7 15a5 5 0 0 0 10 0" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="#1C3E9C" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">C.H.A.O.S.</h1>
            <p className="text-blue-100 mt-1 text-sm">Communication Hub for Animated Online Socializing</p>
          </div>
          
          {/* Login form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* Email field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="msn-input w-full"
                placeholder="email@example.com"
                required
              />
            </div>
            
            {/* Password field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="msn-input w-full"
                placeholder="••••••••"
                required
              />
            </div>
            
            {/* Remember me checkbox */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-msn-blue focus:ring-msn-blue border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full msn-button bg-msn-blue hover:bg-msn-darkBlue text-white py-2 rounded-md transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            {/* Register link */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-msn-blue hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-white">
          <p>© 2025 C.H.A.O.S. - Enjoy the nostalgia!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
