"use client";

import InboxWrapper from "./inboxWrapper";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const HomePage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin"); // Перенаправление на страницу входа, если пользователь не аутентифицирован
    }
  }, [isAuthenticated, router]);

  return (
    <InboxWrapper>
      <h1 className="text-2xl font-bold">Добро пожаловать в Inbox!</h1>
      {/* Здесь будет отображаться содержимое Inbox */}
    </InboxWrapper>
  );
};

export default HomePage;