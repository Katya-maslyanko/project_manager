"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import InboxWrapper from "./inboxWrapper";

const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(); // Получаем состояние аутентификации

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/auth/signin"); // Перенаправляем на страницу входа, если не аутентифицирован
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Индикатор загрузки
  }

  return (
    <InboxWrapper>
      <h1 className="text-2xl font-bold">Добро пожаловать в Inbox!</h1>
      {/* Здесь будет отображаться содержимое Inbox */}
    </InboxWrapper>
  );
};

export default HomePage;