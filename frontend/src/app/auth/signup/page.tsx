"use client";

import { useState } from "react";
import { useRegisterMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Импортируйте контекст аутентификации
import Image from "next/image"; // Импортируем компонент Image
import Link from "next/link"; // Импортируем компонент Link
import { Eye, EyeOff } from "lucide-react"; // Импортируем иконки из Lucide

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Состояние для отображения пароля
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
      if (response.access && response.user) {
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
    <div className="flex min-h-screen">
      {/* Левая часть с формой регистрации */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4">Регистрация</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="flex space-x-4">
              <div className="w-full">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="firstName">Имя <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
                  autoComplete="given-name"
                />
              </div>
              <div className="w-full">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="lastName">Фамилия <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="username">Имя пользователя <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="email">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="password">Пароль <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-600 hover:text-white"
            >
              Зарегистрироваться
            </button>
          </form>
          <p className="mt-4 text-center text-gray-500 text-sm">
            Создавая аккаунт, вы соглашаетесь с <Link href="/terms" className="text-blue-600 hover:underline">Условиями использования</Link> и нашей <Link href="/privacy" className="text-blue-600 hover:underline">Политикой конфиденциальности</Link>.
          </p>
          <p className="mt-6 text-center text-gray-700">
            У вас уже есть аккаунт? <Link href="/auth/signin" className="text-blue-600 hover:underline">Войти</Link>
          </p>
        </div>
      </div>

      {/* Правая часть с логотипом и изображениями */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 text-white items-center justify-center relative">
        <div>
          <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
              <Image
                width={540}
                height={254}
                src="/images/grid-01.svg"
                alt="grid"
              />
            </div>
            <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
              <Image
                width={540}
                height={254}
                src="/images/grid-01.svg"
                alt="grid"
              />
            </div>
        </div>
        <div className="text-center">
          <Image src="/images/logo/icon_logo_dark.svg" alt="Logo" width={220} height={100} className="mx-auto mb-4" />
          <h2 className="mt-1 text-center text-base font-bold text-white/70 max-w-[380px]">Давайте начнем работу и настроим эффективное управление проектом</h2>
        </div>
      </div>
    </div>
  );
};

export default SignUp;