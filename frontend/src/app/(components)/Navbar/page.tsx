import React from 'react';
import { Search, Bell } from 'lucide-react';

const Navbar = () => {
  const notificationCount = 3; // Пример количества уведомлений

  return (
    <div className="flex items-center justify-end p-4 space-x-4 border-b" style={{ borderColor: '#E6EDF1', paddingRight: '20px' }}>
      {/* Поисковая панель */}
      <div className="flex items-center border rounded px-4 py-2" style={{ width: '323px', borderRadius: '4px' }}>
        <input
          type="text"
          placeholder="Поиск"
          className="outline-none w-full"
        />
        <Search className="text-gray-500 ml-2" />
      </div>

      {/* Профиль и уведомления */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
            <Bell className="text-gray-500" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        {/* Иконка с доменом */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
            <i className="fas fa-user text-gray-500"></i>
          </button>
          <span className="text-gray-500">myname@domain.ru</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;