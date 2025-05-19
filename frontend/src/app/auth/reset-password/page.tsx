"use client";

import { useState } from "react";
import { useRequestPasswordResetMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const router = useRouter();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await requestReset({ email }).unwrap();
      setMessage(response.message);
    } catch (err: any) {
      setError(err.data?.error || "Произошла ошибка при запросе сброса пароля");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4">Сброс пароля</h2>
          <p className="text-gray-500 mb-6 text-base">
            Введите ваш email, чтобы получить ссылку для сброса пароля.
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}
          <form onSubmit={handleRequest} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold text-base mb-2" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-600 hover:text-white disabled:opacity-50"
            >
              Отправить
            </button>
          </form>
          <p className="mt-6 text-center text-gray-700">
            Вернуться к{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              входу
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 bg-blue-900 text-white items-center justify-center relative">
        <div>
          <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
            <Image width={540} height={254} src="/images/grid-01.svg" alt="grid" />
          </div>
          <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
            <Image width={540} height={254} src="/images/grid-01.svg" alt="grid" />
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

export default ResetPasswordRequest;