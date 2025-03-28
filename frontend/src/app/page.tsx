// app/page.tsx
"use client";

import InboxWrapper from "./inboxWrapper"; // Импортируйте ваш InboxWrapper
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin"); // Перенаправляем на страницу входа, если пользователь не аутентифицирован
    }
  }, [router]);

  return (
    <InboxWrapper>
      <h1 className="text-2xl font-bold">Добро пожаловать в Inbox!</h1>
      {/* Здесь будет отображаться содержимое Inbox */}
    </InboxWrapper>
  );
};

export default HomePage;