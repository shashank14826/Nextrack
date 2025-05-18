import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// API URL - using localhost for iOS simulator and IP address for Android
// For physical devices, you'll need to use your computer's IP address
const API_URL = Platform.OS === 'ios' 
  ? 'http://localhost:5001/api'
  : 'http://192.168.135.50:5001/api';

export const AuthContext = createContext();

// Add useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password
      });
      
      const { token, user, message } = response.data;
      setUserToken(token);
      setUserInfo(user);
      
      // Save token and user info to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Return the success message
      return { success: true, message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', error);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (name, email, password, phoneNumber) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
        phoneNumber
      });
      
      const { token, user, message } = response.data;
      setUserToken(token);
      setUserInfo(user);
      
      // Save token and user info to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Return the success message
      return { success: true, message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Register error:', error);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the signout endpoint
      if (userToken) {
        const response = await axios.post(`${API_URL}/auth/signout`);
        console.log(response.data.message); // Log the signout message
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Clear user data regardless of signout API success
      setUserToken(null);
      setUserInfo(null);
      
      // Remove data from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      
      delete axios.defaults.headers.common['Authorization'];
      
      setIsLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { 
        success: true, 
        message: response.data.message,
        tempPassword: response.data.tempPassword,
        note: response.data.note
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      console.error('Forgot password error:', error);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is logged in on app load
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      
      if (storedToken && storedUserInfo) {
        setUserToken(storedToken);
        setUserInfo(JSON.parse(storedUserInfo));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('isLoggedIn error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        error,
        login,
        register,
        logout,
        forgotPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 