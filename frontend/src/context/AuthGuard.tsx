"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Импортируйте хук для доступа к контексту аутентификации

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Если идет загрузка, ничего не делаем
    if (isLoading) return;

    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Если идет загрузка, можно отобразить индикатор загрузки или ничего не рендерить
  if (isLoading) {
    return <p>Загрузка...</p>; // Или любой другой индикатор загрузки
  }

  return <>{children}</>; // Если пользователь аутентифицирован, рендерим дочерние компоненты
};

export default AuthGuard;