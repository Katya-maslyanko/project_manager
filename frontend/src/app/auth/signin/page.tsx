"use client";

import { useState } from "react";
import { useLoginMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image"; // Импортируем компонент Image
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Импортируем иконки из Lucide

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Состояние для отображения пароля
  const [error, setError] = useState("");
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const { login: setAuth, user } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await login({ email, password }).unwrap();
      if (response.access && response.user) {
        await setAuth(response);
        
        // Дождись установки пользователя
        const waitForUser = async () => {
          let retries = 10;
          while (!user && retries > 0) {
            await new Promise((res) => setTimeout(res, 100));
            retries--;
          }
          router.push("/");
        };
        waitForUser();
      } else {
        setError("Ошибка входа. Пожалуйста, проверьте свои учетные данные.");
      }
    } catch (err) {
      setError("Ошибка входа. Пожалуйста, проверьте свои учетные данные.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Левая часть с формой входа */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4">Вход</h2>
          <p className="text-gray-500 mb-6 text-base">Введите свою электронную почту и пароль для входа!</p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold text-base mb-2" htmlFor="email">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="info@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="password">Пароль *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите ваш пароль"
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
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input className="form-checkbox border-gray-200 text-blue-500" type="checkbox" />
                <span className="ml-2 text-gray-500">Запомнить меня</span>
              </label>
              <a className="text-blue-600" href="#">Забыли пароль?</a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-600 hover:text-white"
            >
              Войти
            </button>
          </form>
          <p className="mt-6 text-center text-gray-700">
            У вас нет аккаунта? <Link href="/auth/signup" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
          </p>
        </div>
      </div>

      {/* Правая часть с логотипом и информацией */}
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

export default SignIn;