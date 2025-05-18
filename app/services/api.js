import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
const API_CONFIG = {
  PORT: 5001,
  IP_ADDRESS: '192.168.135.50', // Your current IP address
  FALLBACK_IP: '10.0.2.2', // Android emulator fallback
  TIMEOUT: 10000, // 10 seconds
};

// API URL - using localhost for iOS simulator and IP address for Android
const getApiUrl = () => {
  if (Platform.OS === 'ios') {
    return `http://localhost:${API_CONFIG.PORT}/api`;
  }
  
  // For Android, try the configured IP first, then fallback
  try {
    // You can update this to test connectivity to the IP
    return `http://${API_CONFIG.IP_ADDRESS}:${API_CONFIG.PORT}/api`;
  } catch (error) {
    console.warn('Using fallback IP address for Android');
    return `http://${API_CONFIG.FALLBACK_IP}:${API_CONFIG.PORT}/api`;
  }
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error adding auth token:', error);
    return config;
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server might be down or unreachable');
    } else if (!error.response) {
      console.error('Network error - please check your connection and server status');
    } else if (error.response.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - please login again');
      // You might want to trigger a logout here
    }
    return Promise.reject(error);
  }
);

// Account APIs
export const accountApi = {
  // Get all accounts
  getAccounts: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  // Create new account
  createAccount: async (accountData) => {
    const response = await api.post('/accounts', accountData);
    return response.data;
  },

  // Update account
  updateAccount: async (id, accountData) => {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data;
  },

  // Delete account
  deleteAccount: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },

  // Get account balance
  getAccountBalance: async (id) => {
    const response = await api.get(`/accounts/${id}/balance`);
    return response.data;
  }
};

// Transaction APIs
export const transactionApi = {
  // Get all transactions
  getTransactions: async (filters = {}) => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get transaction summary
  getTransactionSummary: async (filters = {}) => {
    const response = await api.get('/transactions/summary', { params: filters });
    return response.data;
  }
};

export default api; 