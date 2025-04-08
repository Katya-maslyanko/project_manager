"use client";

import { useState } from "react";
import { useRegisterMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const { login: setAuth } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};

    if (!firstName) errors.firstName = "Поле 'Имя' обязательно для заполнения.";
    if (!lastName) errors.lastName = "Поле 'Фамилия' обязательно для заполнения.";
    if (!username) errors.username = "Поле 'Имя пользователя' обязательно для заполнения.";
    if (!email) {
        errors.email = "Поле 'Email' обязательно для заполнения.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Некорректный формат email.";
    }
    if (!password) errors.password = "Поле 'Пароль' обязательно для заполнения.";
    else if (password.length < 6) {
        errors.password = "Пароль должен содержать не менее 6 символов.";
    }

    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
    }

    try {
        const response = await register({
            first_name: firstName,
            last_name: lastName,
            username,
            email,
            password,
        }).unwrap();

        console.log("Ответ от API:", response);

        if (response && response.access && response.refresh && response.user) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('user', JSON.stringify(response.user));
          setAuth(response.access);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("password", password);
          router.push("/auth/signin");
      } else {
          console.error("Ответ не содержит данных для перенаправления", response);
          setError("Ошибка: Неверный ответ от сервера.");
      }      
    } catch (err) {
        if (err.data) {
            setError(err.data.detail || "Произошла ошибка при регистрации");
            if (err.data.username) setFieldErrors({ username: err.data.username });
            if (err.data.email) setFieldErrors({ email: err.data.email });
        }
        console.error("Ошибка регистрации:", err);
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
                <label className="block text-gray-700 font-bold mb-2" htmlFor="firstName">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={`w-full p-3 border ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100`}
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && <p className="text-red-500 text-sm">{fieldErrors.firstName}</p>}
              </div>
              <div className="w-full">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="lastName">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={`w-full p-3 border ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100`}
                  autoComplete="family-name"
                />
                {fieldErrors.lastName && <p className="text-red-500 text-sm">{fieldErrors.lastName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="username">
                Имя пользователя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`w-full p-3 border ${fieldErrors.username ? 'border-red-500' : 'border-gray-200'} rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100`}
              />
              {fieldErrors.username && <p className="text-red-500 text-sm">{fieldErrors.username}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full p-3 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100`}
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                Пароль <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full p-3 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100`}
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
              {fieldErrors.password && <p className="text-red-500 text-sm">{fieldErrors.password}</p>}
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
