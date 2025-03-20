"use client";

import React from "react";
import {
  Clock,
  ListFilter,
  Grid2x2Check,
  ListTodo,
  ArrowDownUp,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";

type BreadcrumbItem = {
  label: string;
  href: string;
};

type Props = {
  projectName: string; // Название проекта
  activeTab: string; // Активная вкладка
  setActiveTab: (tabName: string) => void; // Функция для установки активной вкладки
};

const ProjectHeader: React.FC<Props> = ({ projectName, activeTab, setActiveTab }) => {
  const breadcrumbsItems: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: projectName, href: `/projects/${projectName}` }, // Измените на правильный путь
  ];

  return (
    <div className="px-4 xl:px-6">
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="mb-5 flex items-center justify-between mt-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
          {projectName}
        </h1>
      </div>

      <div className="flex items-center mb-4">
        <div className="flex items-center border bg-gray-200 rounded-md">
          <TabButton
            name="Список"
            icon={<ListTodo className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Доска"
            icon={<Grid2x2Check className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Хронология"
            icon={<Clock className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        <div className="flex items-center ml-auto space-x-2">
          <button
            className="flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-100 duration-200 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={() => console.log("Filter clicked")}
          >
            <ListFilter className="h-5 w-5 mr-2" />
            Фильтр
          </button>
          <button
            className="flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-100 duration-200 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={() => console.log("Sort clicked")}
          >
            <ArrowDownUp className="h-5 w-5 mr-2" />
            Сортировка
          </button>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton: React.FC<TabButtonProps> = ({ name, icon, setActiveTab, activeTab }) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${
        isActive ? "bg-white text-blue-600" : "bg-gray-200 text-gray-600"
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      <span className="ml-2 text-base">{name}</span>
    </button>
  );
};

export default ProjectHeader;