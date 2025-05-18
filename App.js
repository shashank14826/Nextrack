import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { AuthProvider } from './app/context/AuthContext';
import { ThemeProvider, useThemeToggle, fontConfig } from './app/context/ThemeContext';
import AppNavigation from './app/navigation/AppNavigation';

// Create a combined theme for both Paper and Navigation
const createCombinedTheme = (isDark) => {
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

  return {
    ...paperTheme,
    ...navigationTheme,
    fonts: configureFonts({config: fontConfig}),
    colors: {
      ...paperTheme.colors,
      ...navigationTheme.colors,
      primary: isDark ? '#90CAF9' : '#2196F3',
      secondary: '#03DAC6',
      error: isDark ? '#CF6679' : '#B00020',
      background: isDark ? '#121212' : '#FFFFFF',
      surface: isDark ? '#1E1E1E' : '#FFFFFF',
      surfaceVariant: isDark ? '#2D2D2D' : '#F5F5F5',
      onSurface: isDark ? '#FFFFFF' : '#000000',
      onSurfaceVariant: isDark ? '#B0B0B0' : '#666666',
      card: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#000000',
      border: isDark ? '#333333' : '#E0E0E0',
      notification: isDark ? '#CF6679' : '#FF1744',
    },
  };
};

const AppContent = () => {
  const { isDarkMode } = useThemeToggle();
  const theme = createCombinedTheme(isDarkMode);
  
  return (
    <NavigationContainer theme={theme}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppNavigation />
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </AuthProvider>
      </PaperProvider>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
