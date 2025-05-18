import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Configure typography
const fontConfig = {
  displayLarge: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 57,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 45,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

// Create light theme
const lightTheme = {
  ...MD3LightTheme,
  ...NavigationDefaultTheme,
  dark: false,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#2196F3',
    secondary: '#03DAC6',
    error: '#B00020',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    onSurface: '#000000',
    onSurfaceVariant: '#666666',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#FF1744',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F5F5F5',
      level3: '#EEEEEE',
      level4: '#E0E0E0',
      level5: '#D5D5D5',
    },
  },
};

// Create dark theme
const darkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  dark: true,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#90CAF9',
    secondary: '#03DAC6',
    error: '#CF6679',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#B0B0B0',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#CF6679',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#2D2D2D',
      level3: '#333333',
      level4: '#404040',
      level5: '#4D4D4D',
    },
  },
};

// Create context
const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};

export const useThemeToggle = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: lightTheme,
      isDarkMode: false,
      toggleTheme: () => console.log('Theme context not available'),
    };
  }
  return context;
}; 