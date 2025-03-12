import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, ChevronDown, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { toggleSidebarButton } from '@/state';

const Navbar = () => {
  const notificationCount = 3;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const userDivRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const isSidebarButton = useAppSelector((state) => state.global.isSidebarButton);

  // Закрытие выпадающего меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && userDivRef.current && !userDivRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-end p-4 space-x-4 border-b" style={{ borderColor: '#E6EDF1', paddingRight: '20px' }}>
      {!isSidebarButton ? null : (
        <button onClick={() => dispatch(toggleSidebarButton(!isSidebarButton))}>
          <Menu className="h-8 w-8 dark:text-white" />
        </button>
      )}

      <div className="flex items-center border rounded px-4 py-2" style={{ width: '323px', borderRadius: '4px' }}>
        <input type="text" placeholder="Поиск" className="outline-none w-full bg-transparent text-sm" />
        <Search className="text-gray-500 ml-2" style={{ backgroundColor: '#F7FAFC' }} />
      </div>

      {/* Профиль и уведомления */}
      <div className="flex items-center space-x-4">
        {/* Иконка уведомлений */}
        <Link href="/notification">
          <div className="relative">
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
              <Bell className="text-gray-500" />
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
            onClick={toggleDropdown}
          >
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
              <i className="fas fa-user text-gray-500"></i>
            </button>
            <span className="text-gray-500 ml-2 text-base text-theme-sm">myname@domain.ru</span>
            <ChevronDown className={`ml-1 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Выпадающее меню */}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-50 my-[1rem] text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg"
              style={{
                borderRadius: '4px',
                border: '1px solid #E6EDF1',
                backgroundColor: '#F7FAFC',
                width: userDivRef.current ? `${userDivRef .current.offsetWidth}px` : 'auto',
              }}
              id="user-dropdown"
            >
              <div className="px-4 py-3">
              <span className="block text-base font-medium text-gray-500 dark:text-white" style={{ padding: '0px, 8px' }}>
                Katya Maslyanko
              </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
              <li style={{ padding: '0px 8px' }}>
                  <Link href="/settings">
                    <div className="flex items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-md">
                      <Settings className="mr-4 text-gray-500" /> {/* Иконка настроек */}
                      Настройки
                    </div>
                  </Link>
                </li>
                <li style={{ padding: '0px 8px' }}>
                  <Link href="/logout">
                    <div className="flex items-center px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-md">
                      <LogOut className="mr-4 text-gray-500" /> {/* Иконка выхода */}
                      Выйти
                    </div>
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