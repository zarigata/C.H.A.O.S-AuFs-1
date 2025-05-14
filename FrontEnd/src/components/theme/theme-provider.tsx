// =============================================
// ============== CODEX THEME ================
// =============================================
// Theme provider for C.H.A.O.S.
// Handles theme management and persistence

import { createContext, useContext, useEffect, useState } from "react";

// Theme types
type Theme = "light" | "dark" | "theme-msn-classic";

// Theme context props
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

// Theme context type
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Create theme context
const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

// Theme provider component
export function ThemeProvider({
  children,
  defaultTheme = "theme-msn-classic",
  storageKey = "chaos-theme",
  ...props
}: ThemeProviderProps) {
  // Initialize theme state
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Update theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove("light", "dark", "theme-msn-classic");
    
    // Add new theme class
    root.classList.add(theme);
    
    // Store theme in localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Create context value
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  // Render provider
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Theme hook for easy access
export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
