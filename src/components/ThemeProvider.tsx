'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyThemeToDocument(targetTheme: Theme) {
  const isDark = targetTheme === 'dark';
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  root.setAttribute('data-theme', targetTheme);
  root.style.colorScheme = targetTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Synchronize with active DOM class on mount and follow OS preference when unset
  useEffect(() => {
    let resolved: Theme = 'light';
    try {
      const saved =
        localStorage.getItem('compixor-theme') || localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'true') {
        resolved = 'dark';
      } else if (saved === 'light' || saved === 'false') {
        resolved = 'light';
      } else {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
    } catch {
      resolved = 'light';
    }
    setThemeState(resolved);
    applyThemeToDocument(resolved);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('compixor-theme', newTheme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
    applyThemeToDocument(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

