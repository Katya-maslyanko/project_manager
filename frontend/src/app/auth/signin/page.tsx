"use client";

import { useState } from "react";
import { useLoginMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const { login: setAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({ email, password }).unwrap();
      // Убедитесь, что токен и пользовательские данные возвращаются
      if (response.access && response.user) {
        setAuth(response); // Устанавливаем аутентификацию
        router.push("/"); // Перенаправление на главную страницу
      } else {
        setError("Ошибка входа. Пожалуйста, проверьте свои учетные данные.");
      }
    } catch (err) {
      setError("Ошибка входа. Пожалуйста, проверьте свои учетные данные.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Вход</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email" // Измените тип на email
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Войти
          </button>
        </form>
        <p className="text-center">
          У вас нет аккаунта?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;