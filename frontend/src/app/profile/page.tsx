"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGetCurrentUserQuery } from "@/state/api";
import InboxWrapper from "@/app/inboxWrapper";
import { Pencil } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import EditProfileModal from "@/components/Profile/EditProfileModal";

const getTagColor = (index: number) => {
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

type BreadcrumbItem = {
  label: string;
  href: string;
};

const UserProfile = () => {
  const { user } = useAuth();
  const { data: currentUser, isLoading } = useGetCurrentUserQuery();

  const displayUser = currentUser || user; // <--- главное: используем одно значение

  const breadcrumbsItems: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: "Профиль", href: "/profile" },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!displayUser || isLoading) {
    return <div className="p-10 text-lg">Загрузка профиля...</div>;
  }

  return (
    <InboxWrapper>
      <div className="rounded-2xl borde px-4 dark:border-gray-800 dark:bg-white/[0.03] xl:px-6">
        <Breadcrumbs items={breadcrumbsItems} />
        <h1 className="mt-4 text-3xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Мой профиль
        </h1>
        <div className="space-y-6">
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div
                  className={`w-20 h-20 overflow-hidden rounded-full dark:border-gray-800 flex items-center justify-center ${getTagColor(displayUser.id)}`}
                >
                  <span className="text-xl">
                    {displayUser.username
                      ? displayUser.username.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                </div>
                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {displayUser.first_name} {displayUser.last_name}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {displayUser.role || "Не задано"}
                    </p>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {displayUser.username}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 hover:bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500 shadow-theme-xs hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                onClick={() => setIsModalOpen(true)}
              >
                <Pencil className="w-4 h-4" />
                Редактировать
              </button>
            </div>
          </div>
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  Персональные данные
                </h4>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 2xl:gap-x-32">
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">
                      Имя
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {displayUser.first_name}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">
                      Фамилия
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {displayUser.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {displayUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-s leading-normal text-gray-500 dark:text-gray-400">
                      Роль
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-white/90">
                      {displayUser.role || "Не задано"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </InboxWrapper>
  );
};

export default UserProfile;
