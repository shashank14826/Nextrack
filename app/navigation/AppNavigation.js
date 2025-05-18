import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

// Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SplashScreen from '../screens/SplashScreen';

// Tab Navigator
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator();

const AppNavigation = () => {
  const auth = useAuth();

  // Show splash screen while auth is initializing
  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  const { isLoading, userToken } = auth;

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        // Authenticated user screens - Using the Tab Navigator
        <Stack.Screen name="Main" component={AppNavigator} />
      ) : (
        // Authentication screens
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigation; 