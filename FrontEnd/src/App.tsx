// =============================================
// ============== CODEX APP ==================
// =============================================
// Main App component for C.H.A.O.S.
// Handles routing, authentication, and theme management

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Hub from './pages/Hub';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Import components
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/toaster';
import AuthGuard from './components/auth/auth-guard';

// Import context
import { AuthProvider } from './context/auth-context';
import { WebSocketProvider } from './context/websocket-context';

// Import types
import { Theme } from './types/theme';

/**
 * Main App component
 * Handles routing, authentication, and theme management
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
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              
              <Route path="/chat/:id" element={
                <AuthGuard>
                  <Chat />
                </AuthGuard>
              } />
              
              <Route path="/hub/:id/*" element={
                <AuthGuard>
                  <Hub />
                </AuthGuard>
              } />
              
              <Route path="/settings" element={
                <AuthGuard>
                  <Settings setTheme={setTheme} />
                </AuthGuard>
              } />
              
              {/* Redirect to dashboard if logged in and accessing root */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster />
          </div>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
