// =================================================
// ======== CODEX v1.0.5 MAIN APP CONTROLLER =======
// =================================================
// ############ C.H.A.O.S ENGINE CORE #############
// ######### SECURE COMMUNICATION PLATFORM #########
// #############################################
// Main App component for C.H.A.O.S.
// Provides primary routing and context providers

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme/theme-provider';
import { AuthProvider } from './context/auth-context';
import { WebSocketProvider } from './context/websocket-context';
import AuthGuard from './components/auth/auth-guard';
import AIAssistant from './components/ai/ai-assistant';

// Page imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Import types
import { Theme } from './types';

/**
 * Main App Component
 * 
 * Provides:
 * - Authentication context
 * - WebSocket real-time connection
 * - Theme management
 * - Route configuration
 * - AI Assistant integration
 */
function App() {
  // Theme state (default, dark, or msn-classic)
  const [theme, setTheme] = useState<Theme>('theme-msn-classic');

  // Effect to load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('chaos-theme');
    if (savedTheme) {
      setTheme(savedTheme as Theme);
    }
  }, []);

  // Effect to save theme to localStorage
  useEffect(() => {
    localStorage.setItem('chaos-theme', theme);
    
    // Apply theme to document
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <ThemeProvider defaultTheme={theme} storageKey="chaos-theme">
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <div className="min-h-screen">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes - wrapped with AuthGuard */}
                <Route path="/" element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } />
                
                <Route path="/settings" element={
                  <AuthGuard>
                    <Settings />
                  </AuthGuard>
                } />
                
                <Route path="/profile" element={
                  <Navigate to="/settings" replace />
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              
              {/* AI Assistant is available globally */}
              <AIAssistant />
            </div>
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
