// HomePage.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import InboxWrapper from "./inboxWrapper";


const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Можно добавить индикатор загрузки
  }

  return (
    <InboxWrapper>
      <h1 className="text-2xl font-bold">Добро пожаловать в Inbox!</h1>
      {/* Здесь будет отображаться содержимое Inbox */}
    </InboxWrapper>
  );
};

export default HomePage;