"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetCurrentUserQuery, User } from "@/state/api";

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser ] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { data: currentUser , isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated, // Пропустить запрос, если не аутентифицирован
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Запрос текущего пользователя
      if (currentUser ) {
        setUser (currentUser );
      }
    } else {
      setIsAuthenticated(false);
      setUser (null);
    }
  }, [currentUser ]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser (userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
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