'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';

interface ThemeState {
  theme: Theme;
  systemPreference: Theme;
  prefersReducedMotion: boolean;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_SYSTEM_PREFERENCE'; payload: Theme }
  | { type: 'SET_REDUCED_MOTION'; payload: boolean };

interface ThemeContextValue extends ThemeState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'theme-preference';

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SYSTEM_PREFERENCE':
      return { ...state, systemPreference: action.payload };
    case 'SET_REDUCED_MOTION':
      return { ...state, prefersReducedMotion: action.payload };
    default:
      return state;
  }
}

const initialState: ThemeState = {
  theme: 'light',
  systemPreference: 'light',
  prefersReducedMotion: false,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [state, dispatch] = useReducer(themeReducer, {
    ...initialState,
    theme: defaultTheme,
  });

  // Set theme on document element
  const applyTheme = useCallback((theme: Theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  // Initialize from localStorage and system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get stored preference
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'high-contrast'].includes(stored)) {
      dispatch({ type: 'SET_THEME', payload: stored });
      applyTheme(stored);
    }

    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemPref: Theme = mediaQuery.matches ? 'dark' : 'light';
    dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: systemPref });

    // If no stored preference, use system preference
    if (!stored) {
      dispatch({ type: 'SET_THEME', payload: systemPref });
      applyTheme(systemPref);
    }

    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      const newPref: Theme = e.matches ? 'dark' : 'light';
      dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: newPref });
    };
    mediaQuery.addEventListener('change', handleChange);

    // Detect reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    dispatch({ type: 'SET_REDUCED_MOTION', payload: motionQuery.matches });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_REDUCED_MOTION', payload: e.matches });
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [applyTheme]);

  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    applyTheme(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['light', 'dark', 'high-contrast'];
    const currentIndex = themes.indexOf(state.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [state.theme, setTheme]);

  const value: ThemeContextValue = {
    ...state,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
