import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  paper: string;
  paperTexture: string;
  highlight: string;
  annotation: string;
}

const lightTheme: Theme = {
  primary: '#8B5A2B',
  secondary: '#D4AF37',
  accent: '#E91E63',
  background: '#FFF8E7',
  surface: '#FFFFFF',
  text: '#2C1810',
  textSecondary: '#6B4423',
  border: '#E8DCC0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  paper: '#FFFEF7',
  paperTexture: '#F9F6ED',
  highlight: '#FFE082',
  annotation: '#FFB74D',
};

const darkTheme: Theme = {
  primary: '#D4AF37',
  secondary: '#8B5A2B',
  accent: '#FF4081',
  background: '#1A1611',
  surface: '#2D2520',
  text: '#F5E6D3',
  textSecondary: '#C4A572',
  border: '#3D342B',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  paper: '#252016',
  paperTexture: '#2A2318',
  highlight: '#FFF176',
  annotation: '#FFB74D',
};

const romanticTheme: Theme = {
  primary: '#8E4162',
  secondary: '#D4AF37',
  accent: '#E91E63',
  background: '#FDF2F8',
  surface: '#FFFFFF',
  text: '#4A1E3A',
  textSecondary: '#8E4162',
  border: '#F3D5E7',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  paper: '#FFFBFD',
  paperTexture: '#FEF7FA',
  highlight: '#F9A8D4',
  annotation: '#EC4899',
};

interface ThemeContextType {
  currentTheme: Theme;
  isDark: boolean;
  themeName: 'light' | 'dark' | 'romantic' | 'adaptive';
  setTheme: (theme: 'light' | 'dark' | 'romantic' | 'adaptive') => void;
  setAdaptiveTheme: (colors: Partial<Theme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<'light' | 'dark' | 'romantic' | 'adaptive'>('light');
  const [adaptiveColors, setAdaptiveColors] = useState<Partial<Theme>>({});
  const [isDark, setIsDark] = useState(false);

  // const getCurrentTheme = (): Theme => {
  //   switch (themeName) {
  //     case 'dark':
  //       setIsDark(true);
  //       return darkTheme;
  //     case 'romantic':
  //       setIsDark(false);
  //       return romanticTheme;
  //     case 'adaptive':
  //       setIsDark(false);
  //       return { ...lightTheme, ...adaptiveColors };
  //     default:
  //       setIsDark(false);
  //       return lightTheme;
  //   }
  // };
  const getCurrentTheme = (): Theme => {
    switch (themeName) {
      case 'dark':
        return darkTheme;
      case 'romantic':
        return romanticTheme;
      case 'adaptive':
        return darkTheme;
      default:
        return darkTheme;
    }
  };
  

  const setTheme = async (theme: 'light' | 'dark' | 'romantic' | 'adaptive') => {
    setThemeName(theme);
    await AsyncStorage.setItem('selectedTheme', theme);
  };

  const setAdaptiveTheme = (colors: Partial<Theme>) => {
    setAdaptiveColors(colors);
    setThemeName('adaptive');
  };

  // useEffect(() => {
  //   const loadTheme = async () => {
  //     const saved = await AsyncStorage.getItem('selectedTheme');
  //     if (saved) {
  //       setThemeName(saved as any);
  //     }
  //   };
  //   loadTheme();
  // }, []);

  useEffect(() => {
    // Update isDark state based on themeName
    setIsDark(themeName === 'dark');
  }, [themeName]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: getCurrentTheme(),
        isDark,
        themeName,
        setTheme,
        setAdaptiveTheme,
      }}>
      {children}
    </ThemeContext.Provider>

  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}