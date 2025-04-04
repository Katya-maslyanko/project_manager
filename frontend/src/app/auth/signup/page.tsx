"use client";

import { useState } from "react";
import { useRegisterMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Импортируйте контекст аутентификации

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
 const [error, setError] = useState("");
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const { login: setAuth } = useAuth(); // Получите метод login из контекста

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }).unwrap();
      // Убедитесь, что токен и пользовательские данные возвращаются
      if (response.access && response.user) { // Измените на response.access
        setAuth(response); // Устанавливаем аутентификацию
        router.push("/"); // Перенаправление на главную страницу после регистрации
      } else {
        setError("Ошибка регистрации. Пожалуйста, проверьте свои данные.");
      }
    } catch (err) {
      setError("Ошибка регистрации. Пожалуйста, проверьте свои данные.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Регистрация</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
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
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="username"
          />
          <input
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="firstname"
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            autoComplete="lastname"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Зарегистрироваться
          </button>
        </form>
        <p className="text-center">
          У вас уже есть аккаунт?{" "}
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;