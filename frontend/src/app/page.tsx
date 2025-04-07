"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import InboxWrapper from "./inboxWrapper";

const HomePage = () => {
  const router = useRouter();
  // const { user, isAuthenticated, isLoading } = useAuth(); // Получаем состояние аутентификации

  // useEffect(() => {
  //   if (isLoading) return;

  //   if (!isAuthenticated) {
  //     router.push("/auth/signin");
  //   }
  // }, [isAuthenticated, isLoading, router]);

  // if (isLoading || (isAuthenticated && !user)) {
  //   return <div className="p-10 text-lg">Загрузка...</div>;
  // }

  return (
    <InboxWrapper>
      <h1 className="text-2xl font-bold">Добро пожаловать в Inbox!</h1>
      {/* Здесь будет отображаться содержимое Inbox */}
    </InboxWrapper>
  );
};

export default HomePage;