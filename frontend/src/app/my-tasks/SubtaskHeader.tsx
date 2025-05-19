"use client";
import React from "react";
import { ListTodo, Grid2x2Check, ListFilter, ArrowDownUp } from "lucide-react";

interface SubtaskHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SubtaskHeader: React.FC<SubtaskHeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center mb-4 dark:bg-dark-bg dark:border-gray-800">
      <div className="flex items-center border bg-gray-200 rounded-md dark:border-gray-800 dark:bg-dark-bg">
        <button
          className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${activeTab === 'Список' ? "bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400" : "bg-gray-200 text-gray-600 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"}`}
          onClick={() => setActiveTab('Список')}
        >
          <ListTodo className="h-5 w-5" /><span className="ml-2 text-base">Список</span>
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${activeTab === 'Доска' ? "bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400" : "bg-gray-200 text-gray-600 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"}`}
          onClick={() => setActiveTab('Доска')}
        >
          <Grid2x2Check className="h-5 w-5" /><span className="ml-2 text-base">Доска</span>
        </button>
      </div>
      <div className="flex items-center ml-auto space-x-2">
        <button
          className="flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ListFilter className="h-5 w-5 mr-2" />
          Фильтр
        </button>

        <button
          className="flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowDownUp className="h-5 w-5 mr-2" />
          Сортировка
        </button>
      </div>
    </div>
  );
};

export default SubtaskHeader;