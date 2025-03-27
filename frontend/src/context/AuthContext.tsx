"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// Определите интерфейс для профиля пользователя
interface UserProfile {
  id: number; // или string, в зависимости от вашего API
  username: string;
  email: string;
  profile_image?: string; // Если изображение профиля может отсутствовать
  role: 'admin' | 'project_manager' | 'team_leader' | 'team_member'; // Используйте перечисление для ролей
}

// Определите интерфейс для контекста аутентификации
interface AuthContextType {
  user: UserProfile | null; // Пользователь может быть null, если не аутентифицирован
  login: (userData: UserProfile) => void; // Метод для входа
  logout: () => void; // Метод для выхода
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser ] = useState<UserProfile | null>(null); // Изначально пользователь null

  const login = (userData: UserProfile) => setUser (userData); // Устанавливаем пользователя
  const logout = () => setUser (null); // Выход

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};