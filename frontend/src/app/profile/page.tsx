"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext"; // Импортируем хук для доступа к контексту аутентификации
import InboxWrapper from "@/app/inboxWrapper";
import { Pencil } from "lucide-react"; // Импортируем иконку Pencil

const getTagColor = (index: number) => { // Указываем тип для index
    const colors = [
      "bg-red-100 text-red-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
      "bg-teal-100 text-teal-600",
    ];
    return colors[index % colors.length];
  };

const UserProfile = () => {
  const { user } = useAuth(); // Получаем информацию о пользователе из контекста

  // Проверяем, что user существует
  if (!user) return <div>No user data available</div>;

  return (
    <InboxWrapper>
      <div className="rounded-2xl borde p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h1 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">Мой профиль</h1>
        <div className="space-y-6">
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className={`w-20 h-20 overflow-hidden rounded-full dark:border-gray-800 flex items-center justify-center ${getTagColor(user.id)}`}>
                  <span className="text-xl">{user.username ? user.username.charAt(0).toUpperCase() : '?'}</span>
                </div>
                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {user.first_name} {user.last_name}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team role</p> {/* Отображаем роль */}
                  </div>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 hover:bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                <Pencil className="w-4 h-4" />
                Редактировать
              </button>
            </div>
          </div>
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Personal Information</h4>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">First Name</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">{user.first_name}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">Last Name</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">{user.last_name}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">Email address</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">{user.email}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">+09 363 398 46</p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">Bio</p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">Team Manager</p>
                  </div>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 hover:bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                <Pencil className="w-4 h-4" />
                Редактировать
              </button>
            </div>
          </div>
        </div>
      </div>
    </InboxWrapper>
  );
};

export default UserProfile;