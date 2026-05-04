import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent long waiting
  timeout: 10000
});
// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);
    if (error.code === 'ECONNABORTED') {
      console.log('Request timeout - using fallback mode');
      // Mark as fallback mode
      localStorage.setItem('fallbackMode', 'true');
    }
    if (!error.response) {
      console.log('Network error - using fallback mode');
      // Mark as fallback mode
      localStorage.setItem('fallbackMode', 'true');
    }
    return Promise.reject(error);
  }
);
// Function to get fallback users with current user sync
const getFallbackUsers = () => {
  const baseUsers = [
    {
      _id: 'admin-fallback',
      id: 'admin-fallback',
      email: 'admin@pronosbox.com',
      username: 'Admin',
      password: 'admin123',
      role: 'admin',
      isPro: true,
      walletBalance: 1000,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    {
      _id: 'user-fallback',
      id: 'user-fallback',
      email: 'user@pronosbox.com',
      username: 'User',
      password: 'user123',
      role: 'user',
      isPro: false,
      walletBalance: 50,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    {
      _id: 'pro-fallback',
      id: 'pro-fallback',
      email: 'pro@pronosbox.com',
      username: 'ProUser',
      password: 'pro123',
      role: 'user',
      isPro: true,
      walletBalance: 250,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    }
  ];

  const currentUser = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
  if (currentUser) {
    const userIndex = baseUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      baseUsers[userIndex] = { ...baseUsers[userIndex], ...currentUser };
    }
  }
  return baseUsers;
};

const fallbackUsers = getFallbackUsers();

// Fallback login
const fallbackLogin = (credentials) => {
  const user = fallbackUsers.find((u) => u.email === credentials.email && u.password === credentials.password);
  if (user) {
    const token = `fallback-token-${user.id}`;
    localStorage.setItem('fallbackUser', JSON.stringify(user));
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isPro: user.isPro,
        avatar: user.avatar,
        walletBalance: user.walletBalance
      }
    };
  }
  throw new Error('Invalid credentials');
};
// Fallback register
const fallbackRegister = (userData) => {
  // Check if user already exists
  const existingUser = fallbackUsers.find((u) => u.email === userData.email || u.username === userData.username);
  if (existingUser) {
    throw new Error('User already exists');
  }
  // Create new user
  const newUser = {
    _id: `user-${Date.now()}`,
    id: `user-${Date.now()}`,
    email: userData.email,
    username: userData.username,
    password: userData.password,
    role: 'user',
    isPro: false,
    walletBalance: 100,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  };
  fallbackUsers.push(newUser);
  localStorage.setItem('fallbackUser', JSON.stringify(newUser));
  const token = `fallback-token-${newUser.id}`;
  return {
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      isPro: newUser.isPro,
      avatar: newUser.avatar,
      walletBalance: newUser.walletBalance
    }
  };
};
// Fallback getCurrentUser
const fallbackGetCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
// Auth services
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    localStorage.removeItem('fallbackMode');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback register');
      return fallbackRegister(userData);
    }
    throw error;
  }
};
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.removeItem('fallbackMode');
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || !error.response || localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback login');
      return fallbackLogin(credentials);
    }
    throw error;
  }
};
// User services
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    localStorage.removeItem('fallbackMode');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getCurrentUser');
      return fallbackGetCurrentUser();
    }
    throw error;
  }
};
export const updateUser = async (updates) => {
  try {
    const response = await api.put('/users/me', updates);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback updateUser');
      const user = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
      if (!user) {
        throw new Error('User not found');
      }
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('fallbackUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw error;
  }
};
// Admin services
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getUsers');
      // Synchroniser l'utilisateur actuel avec la liste fallback pour que les changements (avatar, etc.) soient visibles
      const currentUser = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
      if (currentUser) {
        const userIndex = fallbackUsers.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
          fallbackUsers[userIndex] = { ...fallbackUsers[userIndex], ...currentUser };
        }
      }
      return fallbackUsers;
    }
    throw error;
  }
};
export const updateUserByAdmin = async (userId, updates) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback updateUserByAdmin');
      const userIndex = fallbackUsers.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      fallbackUsers[userIndex] = { ...fallbackUsers[userIndex], ...updates };
      return fallbackUsers[userIndex];
    }
    throw error;
  }
};
export const getAdminTransactions = async () => {
  try {
    const response = await api.get('/admin/transactions');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getAdminTransactions');
      return JSON.parse(localStorage.getItem('fallbackTransactions') || '[]');
    }
    throw error;
  }
};
export const getAdminWithdrawals = async () => {
  try {
    const response = await api.get('/admin/withdrawals');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getAdminWithdrawals');
      const transactions = JSON.parse(localStorage.getItem('fallbackTransactions') || '[]');
      return transactions.filter((t) => t.type === 'withdrawal');
    }
    throw error;
  }
};
export const getSupportMessages = async () => {
  try {
    const response = await api.get('/admin/support/messages');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getSupportMessages');
      return [];
    }
    throw error;
  }
};
export const updateWithdrawalStatus = async (withdrawalId, status) => {
  try {
    const response = await api.put(`/admin/withdrawals/${withdrawalId}`, { status });
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback updateWithdrawalStatus');
      return { success: true };
    }
    throw error;
  }
};
export const sendAdminSupportMessage = async (userId, message) => {
  try {
    const response = await api.post(`/admin/support/messages/${userId}`, { message });
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback sendAdminSupportMessage');
      return { success: true };
    }
    throw error;
  }
};
// Transaction services
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback createTransaction');
      const user = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
      if (!user) {
        throw new Error('User not found');
      }
      // Update user wallet balance
      if (transactionData.type === 'recharge') {
        user.walletBalance += transactionData.amount;
      } else if (['withdrawal', 'subscription', 'pro', 'product'].includes(transactionData.type)) {
        user.walletBalance -= transactionData.amount;
      }
      // Update user Pro status if applicable
      if (transactionData.type === 'subscription' || transactionData.type === 'pro') {
        user.isPro = true;
      }
      localStorage.setItem('fallbackUser', JSON.stringify(user));
      const transaction = {
        _id: `transaction-${Date.now()}`,
        id: `transaction-${Date.now()}`,
        user: user.id,
        ...transactionData,
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      // Store transaction in localStorage
      const transactions = JSON.parse(localStorage.getItem('fallbackTransactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('fallbackTransactions', JSON.stringify(transactions));
      return transaction;
    }
    throw error;
  }
};
export const getTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getTransactions');
      return JSON.parse(localStorage.getItem('fallbackTransactions') || '[]');
    }
    throw error;
  }
};
// Channel services
export const createChannel = async (channelData) => {
  try {
    const response = await api.post('/channels', channelData);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback createChannel');
      // Implement fallback logic if needed
      throw new Error('Cannot create channel in fallback mode');
    }
    throw error;
  }
};
export const getChannels = async () => {
  try {
    const response = await api.get('/channels');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getChannels');
      // Return empty array in fallback mode
      return [];
    }
    throw error;
  }
};
export const getChannel = async (channelId) => {
  try {
    const response = await api.get(`/channels/${channelId}`);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback getChannel');
      throw new Error('Channel not available in fallback mode');
    }
    throw error;
  }
};
export const joinChannel = async (channelId) => {
  try {
    const response = await api.post(`/channels/${channelId}/join`);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback joinChannel');
      throw new Error('Cannot join channel in fallback mode');
    }
    throw error;
  }
};
export const sendMessage = async (channelId, message) => {
  try {
    const response = await api.post(`/channels/${channelId}/messages`, { text: message });
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      console.log('Using fallback sendMessage');
      throw new Error('Cannot send message in fallback mode');
    }
    throw error;
  }
};
export default api;