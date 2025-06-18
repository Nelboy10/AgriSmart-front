'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, removeToken as removeTokenStorage, setToken as setTokenStorage } from '@/lib/auth';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      // Decode token to get user info
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      setUser(payload);
    }
  }, []);

  const login = (newToken: string) => {
    setTokenStorage(newToken);
    setToken(newToken);
    const payload = JSON.parse(atob(newToken.split('.')[1]));
    setUser(payload);
  };

  const logout = () => {
    removeTokenStorage();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};