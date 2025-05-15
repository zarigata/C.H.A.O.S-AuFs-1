// =============================================
// ============== CODEX REGISTER =============
// =============================================
// Registration page component for C.H.A.O.S.
// MSN Messenger-style signup screen with validation

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

/**
 * Register Page Component
 * 
 * Provides MSN Messenger-style registration experience with:
 * - Classic blue gradient background
 * - Form validation
 * - Error handling
 * - Automatic login on successful registration
 */
const Register: React.FC = () => {
  // Form state
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get auth context and navigation
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle registration submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!username || !email || !password || !confirmPassword || !displayName) {
      setError('Please fill out all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Attempt registration
    setIsLoading(true);
    try {
      await register(username, email, password, displayName);
      // Redirect handled by AuthProvider
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-msn-blue to-msn-lightBlue p-4">
      <div className="w-full max-w-md">
        {/* Registration container */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-msn-blue p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-msn-blue"
              >
                <circle cx="12" cy="12" r="10" fill="#245EDC" stroke="currentColor" />
                <path d="M7 9a5 5 0 0 0 10 0M7 15a5 5 0 0 0 10 0" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="#1C3E9C" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Create Account</h1>
            <p className="text-blue-100 mt-1 text-sm">Join C.H.A.O.S. and connect with friends</p>
          </div>
          
          {/* Registration form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* Display name field */}
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="msn-input w-full"
                placeholder="Your Name"
                required
              />
              <p className="mt-1 text-xs text-gray-500">This is how you'll appear to others</p>
            </div>
            
            {/* Username field */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="msn-input w-full"
                placeholder="cooluser123"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Must be unique, no spaces allowed</p>
            </div>
            
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
            <div className="mb-4">
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
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>
            
            {/* Confirm password field */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="msn-input w-full"
                placeholder="••••••••"
                required
              />
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full msn-button bg-msn-blue hover:bg-msn-darkBlue text-white py-2 rounded-md transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            {/* Login link */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-msn-blue hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-white">
          <p>© 2025 C.H.A.O.S. - Communication Hub for Animated Online Socializing</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
