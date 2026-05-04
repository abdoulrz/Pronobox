import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  updateUser as apiUpdateUser } from
'../services/api';
export type User = {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  isPro: boolean;
  avatar: string;
  walletBalance?: number;
  bio?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    matches: boolean;
    channels: boolean;
  };
  paymentMethods?: Array<{
    id: string;
    type: 'card' | 'mobile' | 'crypto';
    name: string;
    details: string;
    icon: string;
  }>;
};
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  login: (credentials: {email: string;password: string;}) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<User | void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<User | void>;
  isFallbackMode: boolean;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  useEffect(() => {
    // Check if we're in fallback mode
    const fallbackMode = localStorage.getItem('fallbackMode') === 'true';
    setIsFallbackMode(fallbackMode);
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch current user data
      getCurrentUser().
      then((userData: any) => {
        setUser({
          id: userData._id || userData.id,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          isPro: userData.isPro,
          avatar: userData.avatar,
          walletBalance: userData.walletBalance,
          bio: userData.bio,
          notifications: userData.notifications || {
            email: false,
            push: true,
            matches: true,
            channels: true
          }
        });
        // If we successfully retrieved user data, we're not in fallback mode
        if (fallbackMode && !userData.fallback) {
          localStorage.removeItem('fallbackMode');
          setIsFallbackMode(false);
        }
      }).
      catch((error) => {
        console.error('Error fetching user data:', error);
        // If we're in fallback mode, try to get user from localStorage
        if (fallbackMode) {
          const fallbackUser = JSON.parse(
            localStorage.getItem('fallbackUser') || 'null'
          );
          if (fallbackUser) {
            setUser({
              id: fallbackUser.id,
              email: fallbackUser.email,
              username: fallbackUser.username,
              role: fallbackUser.role,
              isPro: fallbackUser.isPro,
              avatar: fallbackUser.avatar,
              walletBalance: fallbackUser.walletBalance,
              bio: fallbackUser.bio,
              notifications: fallbackUser.notifications || {
                email: false,
                push: true,
                matches: true,
                channels: true
              }
            });
          } else {
            localStorage.removeItem('token');
          }
        } else {
          localStorage.removeItem('token');
        }
      }).
      finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);
  const login = async (credentials: {email: string;password: string;}) => {
    try {
      const data = await apiLogin(credentials);
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      // Set user data
      setUser({
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        role: data.user.role,
        isPro: data.user.isPro,
        avatar: data.user.avatar,
        walletBalance: data.user.walletBalance,
        bio: data.user.bio,
        notifications: data.user.notifications || {
          email: false,
          push: true,
          matches: true,
          channels: true
        },
        paymentMethods: data.user.paymentMethods || []
      });
      // Check if we're in fallback mode
      setIsFallbackMode(localStorage.getItem('fallbackMode') === 'true');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const data = await apiRegister(userData);
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      // Set user data
      setUser({
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        role: data.user.role,
        isPro: data.user.isPro,
        avatar: data.user.avatar,
        walletBalance: data.user.walletBalance,
        bio: data.user.bio,
        notifications: data.user.notifications || {
          email: false,
          push: true,
          matches: true,
          channels: true
        }
      });
      // Check if we're in fallback mode
      setIsFallbackMode(localStorage.getItem('fallbackMode') === 'true');
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('fallbackUser');
    // Clear user data
    setUser(null);
  };
  const updateUser = async (data: Partial<User>) => {
    if (user) {
      try {
        const updatedUserData = await apiUpdateUser(data);
        // Update local user state
        setUser({
          id: updatedUserData._id || updatedUserData.id,
          email: updatedUserData.email,
          username: updatedUserData.username,
          role: updatedUserData.role,
          isPro: updatedUserData.isPro,
          avatar: updatedUserData.avatar,
          walletBalance: updatedUserData.walletBalance,
          bio: updatedUserData.bio,
          notifications: updatedUserData.notifications || {
            email: false,
            push: true,
            matches: true,
            channels: true
          },
          paymentMethods: updatedUserData.paymentMethods || []
        });
        return updatedUserData;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    }
  };
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isPro = user?.isPro === true;
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isPro,
        login,
        register,
        logout,
        updateUser,
        isFallbackMode
      }}>

      {!loading && children}
    </AuthContext.Provider>);

};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};