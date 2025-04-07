"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useGetCurrentUserQuery } from "@/state/api"; // Предполагается, что это ваш API для получения текущего пользователя
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Добавляем состояние загрузки

  // Получаем данные текущего пользователя
  const { data: currentUser , isLoading: userLoading, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated, // Пропускаем запрос, если не аутентифицирован
  });

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser (null);
    }
    setIsLoading(false); // Устанавливаем состояние загрузки в false после проверки токена
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser ) {
      setUser (currentUser );
    } else {
      setUser (null); // Обнуляем пользователя, если не аутентифицирован
    }
  }, [isAuthenticated, currentUser ]);

  const login = async (token: AuthResponse) => {
    Cookies.set('accessToken', token.access);
    Cookies.set('refreshToken', token.refresh);
  
    setUser(token.user); // можно сразу временно поставить user
    setIsAuthenticated(true);
      await refetch(); 
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