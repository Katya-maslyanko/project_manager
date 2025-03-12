import React, { useState, useEffect, useRef } from 'react';
import { Menu,Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { toggleSidebarButton } from '@/state'

const Navbar = () => {
  const notificationCount = 3; // Пример количества уведомлений
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Ссылка на выпадающее меню
  const userDivRef = useRef<HTMLDivElement | null>(null); // Ссылка на div с иконкой пользователя и email
  const dispatch = useAppDispatch();
  const isSidebarButton = useAppSelector(
    (state) => state.global.isSidebarButton,
  );

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-end p-4 space-x-4 border-b" style={{ borderColor: '#E6EDF1', paddingRight: '20px' }}>
      {!isSidebarButton ? null: (
        <button onClick={() => dispatch(toggleSidebarButton(!isSidebarButton))}>
          <Menu className="h-8 w-8 darck:text-white"/>
        </button>
      )}

      {/* Поисковая панель */}
      <div className="flex items-center border rounded px-4 py-2" style={{ width: '323px', borderRadius: '4px' }}>
        <input
          type="text"
          placeholder="Поиск"
          className="outline-none w-full bg-transparent"
        />
        <Search className="text-gray-500 ml-2" style={{ backgroundColor: '#F7FAFC' }}/>
      </div>

      {/* Профиль и уведомления */}
      <div className="flex items-center space-x-4">
        {/* Иконка уведомлений */}
        <Link href="/notification">
          <div className="relative">
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
              <Bell className="text-gray-500 w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </Link>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Иконка пользователя с выпадающим меню */}
        <div className="relative flex items-center">
          <div
            ref={userDivRef}
            className="flex items-center cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
            <i className="fas fa-user text-gray-500"></i>
            </button>
            <span className="text-gray-500 ml-2">myname@domain.ru</span>
          </div>

          {/* Выпадающее меню */}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 my-[1.19rem] text-base list-none bg-white divide-y divide-gray-100 rounded-lg"
              style={{
                borderRadius: '4px',
                border: '1px solid #E6EDF1',
                backgroundColor: '#F7FAFC',
                width: userDivRef.current ? `${userDivRef.current.offsetWidth}px` : 'auto', // Установка ширины dropdown
              }}
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-500 dark:text-white">Katya Maslyanko</span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li style={{ padding: '0px 4px' }}>
                  <Link href="/settings">
                    <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Настройки</div>
                  </Link>
                </li>
                <li style={{ padding: '0px 4px' }}>
                  <Link href="/logout">
                    <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Выйти</div>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;