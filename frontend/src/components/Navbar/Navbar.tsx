"use client";
import UserDropdown from "@/components/header/ProfileMenu";
import React, { useState, useEffect, useRef } from "react";
import { Search, Bell } from 'lucide-react';
import Link from "next/link";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, isExpanded } = useSidebar();
  const [notifying, setNotifying] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    toggleSidebar();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 flex w-full items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-dark-bg dark:border-gray-800 transition-all duration-300 ease-in-out`}>      {/* Левый блок: Кнопка переключения боковой панели */}
      <button
        className="items-center justify-center w-12 h-12 rounded-lg z-99999 lg:flex lg:h-11 lg:w-11 lg:border text-gray-500 transition-colors bg-white border border-gray-200 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
      >
        {isMobileOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666  1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Правый блок: Поиск, уведомления и выпадающее меню пользователя */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded px-4 py-2 dark:bg-dark-bg dark:text-gray-400 dark:border-gray-800 transition-all duration-300 ease-in-out" style={{ width: '323px', borderRadius: '4px' }}>
          <input
            type="text"
            placeholder="Поиск"
            className="outline-none w-full text-sm dark:bg-dark-bg dark:text-gray-400 focus:outline-none"
            ref={inputRef}
          />
          <Search className="text-gray-500 ml-2" />
        </div>

        <ThemeToggleButton />
        <Link href="/notification">
          <button
            className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 w-12 h-12 hover:bg-gray-100 dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={() => setNotifying(!notifying)}
          >
            <span
              className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-blue-200 ${!notifying ? "hidden" : "flex"}`}
            >
              <span className="absolute inline-flex w-full h-full bg-blue-200 rounded-full opacity-75 animate-ping"></span>
            </span>
            <Bell className="w-6 h-6" />
          </button>
        </Link>
        <div className="w-px h-6 bg-gray-300"></div>
        <div className="relative flex items-center">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;