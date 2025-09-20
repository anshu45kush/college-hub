import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = apiService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        apiService.clearToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};