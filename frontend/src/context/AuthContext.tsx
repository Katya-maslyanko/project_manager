// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetCurrentUserQuery, User } from "@/state/api"; // Импортируйте хук и интерфейс User

interface AuthContextType {
  user: User | null; // Используйте интерфейс User
  login: (token: string, user: User) => void; // Используйте интерфейс User
  logout: () => void;
  isAuthenticated: boolean; // Добавьте это свойство
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser ] = useState<User | null>(null); // Используйте интерфейс User
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Используем хук для получения текущего пользователя
  const { data: currentUser , isLoading } = useGetCurrentUserQuery();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      if (currentUser ) {
        setUser (currentUser );
      }
    }
  }, [currentUser ]);

  const login = (token: string, userData: User) => { // Используйте интерфейс User
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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