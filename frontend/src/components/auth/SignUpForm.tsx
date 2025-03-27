// src/components/auth/SignUpForm.tsx
"use client";
import { useState } from "react";
import { useRegisterMutation } from "@/state/api"; // Импортируем хук для регистрации
import { useRouter } from "next/navigation"; // Импортируем useRouter

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [register] = useRegisterMutation(); // Используем хук для регистрации
  const router = useRouter(); // Инициализируем useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register({ username, email, password }).unwrap();
      // Успешная регистрация, перенаправление на InboxWrapper
      console.log("Registration successful");
      router.push("/inbox"); // Убедитесь, что у вас есть маршрут для Inbox
    } catch (err) {
      setError("Ошибка регистрации. Попробуйте еще раз.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Регистрация</h1>
      {error && <p>{error}</p>}
      <label>Имя пользователя</label>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <label>Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label>Пароль</label>
      <input type="password" value={password} onChange ={(e) => setPassword(e.target.value)} required />
      <button type="submit">Зарегистрироваться</button>
    </form>
  );
}