// src/components/auth/SignInForm.tsx
"use client";
import { useState } from "react";
import { useLoginMutation } from "@/state/api"; // Импортируем хук для входа
import { useRouter } from "next/navigation"; // Импортируем useRouter

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login] = useLoginMutation(); // Используем хук для входа
  const router = useRouter(); // Инициализируем useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({ email, password }).unwrap();
      // Сохраните токен и выполните другие действия после успешного входа
      console.log("Login successful:", response.token);
      // Перенаправление на InboxWrapper
      router.push("/inbox"); // Убедитесь, что у вас есть маршрут для Inbox
    } catch (err) {
      setError("Неверные учетные данные.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Вход в систему</h1>
      {error && <p>{error}</p>}
      <label>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label>Пароль</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Войти</button>
    </form>
  );
}