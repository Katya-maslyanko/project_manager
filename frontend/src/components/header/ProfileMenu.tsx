'use client';
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDown } from "lucide-react";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Импортируйте хук для доступа к контексту аутентификации
import { useLogoutMutation } from "@/state/api"; // Импортируйте хук для выхода
import { useRouter } from "next/navigation";
// const { logout: setLogout } = useAuth();

// Функция для генерации цвета на основе индекса
const getTagColor = (index) => {
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

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth(); // Получаем информацию о пользователе
  const [logout] = useLogoutMutation(); // Хук для выхода
  const router = useRouter();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    await logout(); // Выход из профиля
    closeDropdown();
    // Здесь можно добавить перенаправление на страницу входа, если это необходимо
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-500 dark:text-gray-400 dropdown-toggle"
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700">
          <div className={`w-full h-full rounded-full flex items-center justify-center ${getTagColor(user?.id)}`}>
            <span className="text-lg dark:text-gray-400">
              {user?.username ? user.username.split(' ').map(n => n[0]).join('') : '?'}
            </span>
          </div>
        </span>
        <span className="text-gray-500 ml-2 text-sm text-theme-sm dark:text-gray-400">
          {user?.email}
        </span>

        <ChevronDown className={`ml-1 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''} dark:text-gray-400`} />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-[12px] border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-800 transition-all duration-200 ease-in-out"
      >
        <div>
          <span className="block text-gray-500 text-base font-normal dark:text-gray-400 px-5">
            {user ? `${user.first_name} ${user.last_name}` : "Гость"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-500">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 text-gray-500 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 transition-all duration-200 ease-in-out"
            >
              <User  className="text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-300" />
              <span className="ml-2">Редактировать профиль</span>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/account-settings"
              className="flex items-center gap-3 px-3 py-2 text-gray-500 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 transition-all duration-200 ease-in-out"
            >
              <Settings className="text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-300" />
              <span className="ml-2">Настройки аккаунта</span>
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 mt-2 border-gray-200 dark:border-gray-500 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 transition-all duration-200 ease-in-out"
        >
          <LogOut className="text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-300" />
          <span className="ml-2">Выйти</span>
        </button>
      </Dropdown>
    </div>
  );
}