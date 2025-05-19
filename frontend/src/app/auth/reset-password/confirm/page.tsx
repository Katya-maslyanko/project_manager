"use client";

import { useState, useEffect } from "react";
import { useConfirmPasswordResetMutation } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordConfirm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmReset, { isLoading }] = useConfirmPasswordResetMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Токен не предоставлен");
    }
  }, [token]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Недействительный токен");
      return;
    }

    try {
      const response = await confirmReset({ token, new_password: newPassword }).unwrap();
      setMessage(response.message);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch (err: any) {
      setError(err.data?.error || "Произошла ошибка при сбросе пароля");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4">Установить новый пароль</h2>
          <p className="text-gray-500 mb-6 text-base">
            Введите новый пароль для вашей учетной записи.
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}
          <form onSubmit={handleConfirm} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="newPassword"
              >
                Новый пароль <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-blue-300 focus:bg-blue-100"
                  autoComplete="new-password"
                  aria-label="Введите новый пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full p-3 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-600 hover:text-white disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                "Сбросить пароль"
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-700">
            Вернуться к{" "}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:underline"
            >
              входу
            </Link>
          </p>
        </div>
      </div>
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
          <Image
            src="/images/logo/icon_logo_dark.svg"
            alt="Logo"
            width={220}
            height={100}
            className="mx-auto mb-4"
          />
          <h2 className="mt-1 text-center text-base font-bold text-white/70 max-w-[380px]">
            Давайте начнем работу и настроим эффективное управление проектом
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;