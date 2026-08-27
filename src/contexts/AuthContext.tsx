import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  googleLogin as apiGoogleLogin,
  getCurrentUser,
  updateUser as apiUpdateUser,
  upgradeUserRole as apiUpgradeUserRole
} from '../services/api';
export type User = {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  accountType?: 'standard' | 'tipster' | 'wildcard';
  isPro: boolean;
  isCertified?: boolean;
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
  unlockedResources?: string[];
};
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  isTipster: boolean;
  isWildcard: boolean;
  isCertified: boolean;
  login: (credentials: {email: string;password: string;}) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    accountType?: 'standard' | 'tipster' | 'wildcard';
  }) => Promise<User | void>;
  loginWithGoogle: (credential: string, accountType?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<User | void>;
  upgradeToTipster: () => Promise<void>;
  isFallbackMode: boolean;
  clearFallbackMode: () => void;
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
          accountType: userData.accountType || 'standard',
          isPro: userData.isPro || false,
          isCertified: userData.isCertified || false,
          avatar: userData.avatar,
          walletBalance: userData.walletBalance,
          bio: userData.bio,
          notifications: userData.notifications || {
            email: false,
            push: true,
            matches: true,
            channels: true
          },
          unlockedResources: userData.unlockedResources || []
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
              accountType: fallbackUser.accountType || 'standard',
              isPro: fallbackUser.isPro || false,
              isCertified: fallbackUser.isCertified || false,
              avatar: fallbackUser.avatar,
              walletBalance: fallbackUser.walletBalance,
              bio: fallbackUser.bio,
              notifications: fallbackUser.notifications || {
                email: false,
                push: true,
                matches: true,
                channels: true
              },
              unlockedResources: fallbackUser.unlockedResources || []
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

  useEffect(() => {
    const handleFallbackChange = () => {
      const mode = localStorage.getItem('fallbackMode') === 'true';
      setIsFallbackMode(mode);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('fallback-mode-changed', handleFallbackChange);
      window.addEventListener('storage', handleFallbackChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('fallback-mode-changed', handleFallbackChange);
        window.removeEventListener('storage', handleFallbackChange);
      }
    };
  }, []);

  const clearFallbackMode = () => {
    localStorage.removeItem('fallbackMode');
    setIsFallbackMode(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('fallback-mode-changed'));
    }
  };
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
        accountType: data.user.accountType || 'standard',
        isPro: data.user.isPro || false,
        isCertified: data.user.isCertified || false,
        avatar: data.user.avatar,
        walletBalance: data.user.walletBalance,
        bio: data.user.bio,
        notifications: data.user.notifications || {
          email: false,
          push: true,
          matches: true,
          channels: true
        },
        paymentMethods: data.user.paymentMethods || [],
        unlockedResources: data.user.unlockedResources || []
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
    accountType?: 'standard' | 'tipster' | 'wildcard';
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
        accountType: data.user.accountType || userData.accountType || 'standard',
        isPro: data.user.isPro || false,
        isCertified: data.user.isCertified || false,
        avatar: data.user.avatar,
        walletBalance: data.user.walletBalance,
        bio: data.user.bio,
        notifications: data.user.notifications || {
          email: false,
          push: true,
          matches: true,
          channels: true
        },
        unlockedResources: data.user.unlockedResources || []
      });
      // Check if we're in fallback mode
      setIsFallbackMode(localStorage.getItem('fallbackMode') === 'true');
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  const loginWithGoogle = async (credential: string, accountType?: string) => {
    try {
      const data = await apiGoogleLogin(credential, accountType);
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      // Set user data
      setUser({
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        role: data.user.role,
        accountType: data.user.accountType || 'standard',
        isPro: data.user.isPro || false,
        isCertified: data.user.isCertified || false,
        avatar: data.user.avatar,
        walletBalance: data.user.walletBalance,
        bio: data.user.bio,
        notifications: data.user.notifications || {
          email: false,
          push: true,
          matches: true,
          channels: true
        },
        paymentMethods: data.user.paymentMethods || [],
        unlockedResources: data.user.unlockedResources || []
      });
      // Check if we're in fallback mode
      setIsFallbackMode(localStorage.getItem('fallbackMode') === 'true');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('fallbackUser');
    localStorage.removeItem('fallbackMode');
    // Clear user data
    setUser(null);
    setIsFallbackMode(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('fallback-mode-changed'));
    }
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
          accountType: updatedUserData.accountType || user.accountType || 'standard',
          isPro: updatedUserData.isPro !== undefined ? updatedUserData.isPro : user.isPro,
          isCertified: updatedUserData.isCertified !== undefined ? updatedUserData.isCertified : user.isCertified,
          avatar: updatedUserData.avatar,
          walletBalance: updatedUserData.walletBalance,
          bio: updatedUserData.bio,
          notifications: updatedUserData.notifications || {
            email: false,
            push: true,
            matches: true,
            channels: true
          },
          paymentMethods: updatedUserData.paymentMethods || [],
          unlockedResources: updatedUserData.unlockedResources || []
        });
        return updatedUserData;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    }
  };
  const upgradeToTipster = async () => {
    try {
      const response = await apiUpgradeUserRole('tipster');
      if (response && response.user) {
        setUser({
          id: response.user.id || response.user._id,
          email: response.user.email,
          username: response.user.username,
          role: response.user.role,
          accountType: 'tipster',
          isPro: true,
          isCertified: response.user.isCertified || false,
          avatar: response.user.avatar,
          walletBalance: response.user.walletBalance,
          bio: response.user.bio,
          notifications: response.user.notifications || {
            email: false,
            push: true,
            matches: true,
            channels: true
          },
          paymentMethods: response.user.paymentMethods || [],
          unlockedResources: response.user.unlockedResources || []
        });
      }
    } catch (error) {
      console.error('Error upgrading to tipster:', error);
      throw error;
    }
  };
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isPro = user?.isPro === true;
  const isTipster = user?.accountType === 'tipster' || user?.isPro === true;
  const isWildcard = user?.accountType === 'wildcard';
  const isCertified = user?.isCertified === true;
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isPro,
        isTipster,
        isWildcard,
        isCertified,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        upgradeToTipster,
        isFallbackMode,
        clearFallbackMode
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