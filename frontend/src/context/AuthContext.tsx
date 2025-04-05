"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useGetCurrentUserQuery } from "@/state/api";
import { User, AuthResponse } from "@/state/api";

interface AuthContextType {
  user: User | null;
  login: (token: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser ] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { data: currentUser , isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser (null);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser ) {
      setUser (currentUser );
    } else {
      setUser (null);
    }
  }, [isAuthenticated, currentUser ]);

  const login = (token: AuthResponse) => {
    Cookies.set('accessToken', token.access);
    Cookies.set('refreshToken', token.refresh);
    setIsAuthenticated(true);
    setUser (token.user);
    console.log('Logged in user:', token.user); // Для отладки
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setIsAuthenticated(false);
    setUser (null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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