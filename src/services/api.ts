import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Types & Interfaces
export interface User {
  _id: string;
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  isPro: boolean;
  walletBalance: number;
  avatar: string;
  password?: string;
}

export interface Transaction {
  _id: string;
  id: string;
  user: string;
  amount: number;
  type: 'recharge' | 'withdrawal' | 'subscription' | 'pro' | 'product';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Reply {
  id: string | number;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  likedBy: (string | number)[];
}

export interface DebateMessage {
  id: string | number;
  author: string;
  authorId: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  time: string;
  likes: number;
  likedBy: (string | number)[];
  replies: Reply[];
}

export type Message = DebateMessage;

export interface Debate {
  _id: string;
  id: string | number;
  title: string;
  description: string;
  images: string[];
  category: string;
  participants: number;
  lastActivity: string;
  author: { id: string | number, username: string, avatar: string };
  authorId: string;
  likes: number;
  likedBy: (string | number)[];
  messages: DebateMessage[];
  createdAt: string;
}

// Axios instance configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle connection errors and switch to fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || !error.response) {
      console.log('API Connection failed - using fallback mode');
      localStorage.setItem('fallbackMode', 'true');
    }
    return Promise.reject(error);
  }
);

// --- Auth Services ---
export const register = async (userData: any) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'user',
        isPro: false,
        walletBalance: 0,
        avatar: ''
      };
      localStorage.setItem('fallbackUser', JSON.stringify(newUser));
      return { token: 'mock-token', user: newUser };
    }
    throw error;
  }
};

export const login = async (credentials: any) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      // Basic mock login for testing
      const mockUser: User = {
        _id: 'mock-id',
        id: 'mock-id',
        email: credentials.email,
        username: credentials.email.split('@')[0],
        role: credentials.email.includes('admin') ? 'admin' : 'user',
        isPro: credentials.email.includes('pro'),
        walletBalance: 100,
        avatar: ''
      };
      localStorage.setItem('fallbackUser', JSON.stringify(mockUser));
      return { token: 'mock-token', user: mockUser };
    }
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      return JSON.parse(localStorage.getItem('fallbackUser') || 'null');
    }
    throw error;
  }
};

export const updateUser = async (updates: any) => {
  try {
    const response = await api.put('/users/me', updates);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const user = JSON.parse(localStorage.getItem('fallbackUser') || '{}');
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('fallbackUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw error;
  }
};

// --- Admin Services ---
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      return JSON.parse(localStorage.getItem('pronobox_users') || '[]');
    }
    throw error;
  }
};

export const updateUserByAdmin = async (userId: string, updates: any) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const users = JSON.parse(localStorage.getItem('pronobox_users') || '[]');
      const index = users.findIndex((u: any) => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('pronobox_users', JSON.stringify(users));
        return users[index];
      }
      throw new Error('User not found');
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
      return JSON.parse(localStorage.getItem('pronobox_admin_transactions') || '[]');
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
      return JSON.parse(localStorage.getItem('pronobox_admin_withdrawals') || '[]');
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
      return JSON.parse(localStorage.getItem('pronobox_support_messages') || '[]');
    }
    throw error;
  }
};

export const updateWithdrawalStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`/admin/withdrawals/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const withdrawals = JSON.parse(localStorage.getItem('pronobox_admin_withdrawals') || '[]');
      const index = withdrawals.findIndex((w: any) => w.id === id);
      if (index !== -1) {
        withdrawals[index].status = status;
        localStorage.setItem('pronobox_admin_withdrawals', JSON.stringify(withdrawals));
        return withdrawals[index];
      }
      throw new Error('Withdrawal not found');
    }
    throw error;
  }
};

export const sendAdminSupportMessage = async (data: any) => {
  try {
    const response = await api.post('/admin/support/send', data);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const messages = JSON.parse(localStorage.getItem('pronobox_support_messages') || '[]');
      const newMessage = { id: Date.now(), ...data, sender: 'agent', time: new Date().toLocaleTimeString() };
      messages.push(newMessage);
      localStorage.setItem('pronobox_support_messages', JSON.stringify(messages));
      return newMessage;
    }
    throw error;
  }
};

// --- Transaction Services ---
export const createTransaction = async (data: any) => {
  try {
    const response = await api.post('/transactions', data);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const transactions = JSON.parse(localStorage.getItem('pronobox_transactions') || '[]');
      const newTransaction = { id: `tr-${Date.now()}`, ...data, status: 'completed', createdAt: new Date().toISOString() };
      transactions.push(newTransaction);
      localStorage.setItem('pronobox_transactions', JSON.stringify(transactions));
      return newTransaction;
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
      return JSON.parse(localStorage.getItem('pronobox_transactions') || '[]');
    }
    throw error;
  }
};

// --- Channel Services ---
export const getChannels = async () => {
  try {
    const response = await api.get('/channels');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      return JSON.parse(localStorage.getItem('pronobox_channels') || '[]');
    }
    throw error;
  }
};

export const getChannel = async (id: string | number) => {
  try {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const channels = JSON.parse(localStorage.getItem('pronobox_channels') || '[]');
      return channels.find((c: any) => String(c.id) === String(id));
    }
    throw error;
  }
};

export const createChannel = async (data: any) => {
  try {
    const response = await api.post('/channels', data);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const channels = JSON.parse(localStorage.getItem('pronobox_channels') || '[]');
      const newChannel = { id: `ch-${Date.now()}`, ...data, members: 1, createdAt: new Date().toISOString() };
      channels.push(newChannel);
      localStorage.setItem('pronobox_channels', JSON.stringify(channels));
      return newChannel;
    }
    throw error;
  }
};

export const updateChannel = async (id: string | number, data: any) => {
  try {
    const response = await api.put(`/channels/${id}`, data);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const channels = JSON.parse(localStorage.getItem('pronobox_channels') || '[]');
      const index = channels.findIndex((c: any) => String(c.id) === String(id));
      if (index !== -1) {
        channels[index] = { ...channels[index], ...data };
        localStorage.setItem('pronobox_channels', JSON.stringify(channels));
        return channels[index];
      }
    }
    throw error;
  }
};

export const deleteChannel = async (id: string | number) => {
  try {
    await api.delete(`/channels/${id}`);
    return true;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const channels = JSON.parse(localStorage.getItem('pronobox_channels') || '[]');
      const filtered = channels.filter((c: any) => String(c.id) !== String(id));
      localStorage.setItem('pronobox_channels', JSON.stringify(filtered));
      return true;
    }
    throw error;
  }
};

export const joinChannel = async (id: string | number) => {
  // Always persist locally — compact {channelId: memberIds[]} format
  const persistJoin = () => {
    try {
      const membership: Record<string, string[]> = JSON.parse(localStorage.getItem('pronobox_membership') || '{}');
      const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('fallbackUser') || 'null');
      const userId = user?.id ? String(user.id) : null;
      if (userId) {
        const channelKey = String(id);
        const members = membership[channelKey] || [];
        if (!members.includes(userId)) {
          membership[channelKey] = [...members, userId];
          localStorage.setItem('pronobox_membership', JSON.stringify(membership));
        }
      }
    } catch { /* quota or parse error — skip */ }
  };

  try {
    const response = await api.post(`/channels/${id}/join`);
    persistJoin();
    return response.data;
  } catch (error) {
    persistJoin(); // Still persist locally even if backend fails
    return { success: true };
  }
};

export const leaveChannel = async (id: string | number) => {
  // Always remove from local membership cache
  const persistLeave = () => {
    try {
      const membership: Record<string, string[]> = JSON.parse(localStorage.getItem('pronobox_membership') || '{}');
      const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('fallbackUser') || 'null');
      const userId = user?.id ? String(user.id) : null;
      if (userId) {
        const channelKey = String(id);
        membership[channelKey] = (membership[channelKey] || []).filter(uid => uid !== userId);
        localStorage.setItem('pronobox_membership', JSON.stringify(membership));
      }
    } catch { /* quota or parse error — skip */ }
  };

  try {
    const response = await api.post(`/channels/${id}/leave`);
    persistLeave();
    return response.data;
  } catch (error) {
    persistLeave(); // Still remove locally even if backend fails
    return { success: true };
  }
};


export const sendMessage = async (channelId: string | number, text: string) => {
  try {
    const response = await api.post(`/channels/${channelId}/messages`, { text });
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      return { id: Date.now(), text, time: new Date().toLocaleTimeString(), sender: 'me' };
    }
    throw error;
  }
};

// --- Debate Services ---
export const getDebates = async () => {
  try {
    const response = await api.get('/debates');
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      return JSON.parse(localStorage.getItem('pronobox_debates') || '[]');
    }
    throw error;
  }
};

export const createDebate = async (data: any) => {
  try {
    const response = await api.post('/debates', data);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const debates = JSON.parse(localStorage.getItem('pronobox_debates') || '[]');
      const user = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
      const newDebate: Debate = {
        _id: `mock-${Date.now()}`,
        id: Date.now(),
        ...data,
        participants: 1,
        lastActivity: "À l'instant",
        author: { id: user?.id || 'unknown', username: user?.username || 'Anonyme', avatar: user?.avatar || '' },
        authorId: user?.id || 'unknown',
        likes: 0,
        likedBy: [],
        messages: [],
        createdAt: new Date().toISOString()
      };
      debates.push(newDebate);
      localStorage.setItem('pronobox_debates', JSON.stringify(debates));
      return newDebate;
    }
    throw error;
  }
};

export const updateDebate = async (id: string | number, updates: any) => {
  try {
    const response = await api.put(`/debates/${id}`, updates);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const debates = JSON.parse(localStorage.getItem('pronobox_debates') || '[]');
      const index = debates.findIndex((d: Debate) => String(d.id) === String(id));
      if (index !== -1) {
        debates[index] = { ...debates[index], ...updates };
        localStorage.setItem('pronobox_debates', JSON.stringify(debates));
        return debates[index];
      }
      throw new Error('Debate not found');
    }
    throw error;
  }
};

export const deleteDebate = async (id: string | number) => {
  try {
    await api.delete(`/debates/${id}`);
    return true;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const debates = JSON.parse(localStorage.getItem('pronobox_debates') || '[]');
      const filtered = debates.filter((d: Debate) => String(d.id) !== String(id));
      localStorage.setItem('pronobox_debates', JSON.stringify(filtered));
      return true;
    }
    throw error;
  }
};

export const likeDebate = async (id: string | number) => {
  try {
    const response = await api.post(`/debates/${id}/like`);
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const user = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
      const debates = JSON.parse(localStorage.getItem('pronobox_debates') || '[]');
      const index = debates.findIndex((d: Debate) => String(d.id) === String(id));
      if (index !== -1) {
        const debate = debates[index];
        const userLiked = debate.likedBy.some((lid: any) => String(lid) === String(user?.id));
        if (userLiked) {
          debate.likedBy = debate.likedBy.filter((lid: any) => String(lid) !== String(user?.id));
          debate.likes = Math.max(0, debate.likes - 1);
        } else {
          debate.likedBy.push(user?.id);
          debate.likes += 1;
        }
        localStorage.setItem('pronobox_debates', JSON.stringify(debates));
        return debate;
      }
      throw new Error('Debate not found');
    }
    throw error;
  }
};

export const addDebateMessage = async (debateId: string | number, text: string) => {
  try {
    const response = await api.post(`/debates/${debateId}/messages`, { text });
    return response.data;
  } catch (error) {
    if (localStorage.getItem('fallbackMode') === 'true') {
      const user = JSON.parse(localStorage.getItem('fallbackUser') || 'null');
      const debates = JSON.parse(localStorage.getItem('pronobox_debates') || '[]');
      const index = debates.findIndex((d: Debate) => String(d.id) === String(debateId));
      if (index !== -1) {
        const newMessage: DebateMessage = {
          id: Date.now(),
          author: user?.username || 'Anonyme',
          authorId: user?.id || 'unknown',
          user: user?.username || 'Anonyme',
          avatar: user?.avatar || '',
          text,
          timestamp: new Date().toISOString(),
          time: "À l'instant",
          likes: 0,
          likedBy: [],
          replies: []
        };
        debates[index].messages.push(newMessage);
        localStorage.setItem('pronobox_debates', JSON.stringify(debates));
        return debates[index];
      }
      throw new Error('Debate not found');
    }
    throw error;
  }
};

export default api;
