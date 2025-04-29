"use client";

import React, { useState } from "react";
import {
  Clock,
  ListFilter,
  Grid2x2Check,
  ListTodo,
  ArrowDownUp,
  SquareArrowOutUpRight,
  XCircle,
  BookOpenCheck,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import SortDropdown from "@/components/ui/dropdown/SortDropdown";
import FilterDropdownAdvanced from "@/components/ui/dropdown/FilterDropdown";

type BreadcrumbItem = {
  label: string;
  href: string;
};

type Props = {
  projectName: string;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  onSelectSort: (value: string) => void;
  onApplyFilter: (filters: any) => void;
  members: Member[];
};

interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const tagColors = [
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

const ProjectHeader: React.FC<Props> = ({
  projectName,
  activeTab,
  setActiveTab,
  onSelectSort,
  onApplyFilter,
  members,
}) => {
  const breadcrumbsItems: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: projectName, href: `/projects/${projectName}` },
  ];

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [activeSort, setActiveSort] = useState<string | null>(null);

  const handleApplyFilter = (filters: any) => {
    setActiveFilters(filters);
    onApplyFilter(filters);
  };

  const handleSelectSort = (value: string) => {
    setActiveSort(value);
    onSelectSort(value);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onApplyFilter({});
  };

  const clearSort = () => {
    setActiveSort(null);
    onSelectSort("");
  };

  return (
    <div className="px-4 xl:px-6">
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="mb-5 flex items-center justify-between mt-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
          {projectName}
        </h1>
        <div className="flex items-center space-x-4">
          {/* Добавляем отображение участников проекта */}
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {members && members.length > 0 ? (
              members.slice(0, 5).map((member, index) => (
                <div 
                  key={member.id} 
                  className={`w-11 h-11 border-2 font-semibold border-gray-100 rounded-full dark:border-gray-800 flex items-center justify-center ${getTagColor(index)}`}
                  title={`${member.first_name} ${member.last_name}`}
                >
                  <span className="text-xs">
                    {member.username ? member.username.charAt(0) : '?'}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Нет участников</span>
            )}
            {members && members.length > 5 && (
              <div className="w-11 h-11 border-2 font-semibold border-gray-100 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-200 text-gray-600">
                <span className="text-xs">+{members.length - 5}</span>
              </div>
            )}
          </div>
          <button
            className="flex items-center px-4 py-2 text-base border bg-blue-100 rounded-lg text-blue-700 hover:text-white hover:bg-blue-600 duration-200 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={() => console.log("Share clicked")}
          >
            <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
            Делиться
          </button>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="flex items-center border bg-gray-200 rounded-md">
          <TabButton
              name="Обзор"
              icon={<BookOpenCheck className="h-5 w-5" />}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
          />
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
            className={`flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg ${Object.keys(activeFilters).length ? 'text-blue-600 bg-blue-100' : 'text-gray-600'} hover:text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white`}
            onClick={() => setShowFilterDropdown((prev) => !prev)}
          >
            <ListFilter className="h-5 w-5 mr-2 " />
            Фильтр
            {Object.keys(activeFilters).length > 0 && (
              <XCircle className="h-4 w-4 ml-2 text-red-600 cursor-pointer" onClick={clearFilters} />
            )}
          </button>
          {showFilterDropdown && (
            <div className ="absolute z-20 mt-14 right-0 translate-x-[-355px]">
              <FilterDropdownAdvanced
                onApply={(filters) => {
                  handleApplyFilter(filters);
                  setShowFilterDropdown(false);
                }}
                onClose={() => setShowFilterDropdown(false)}
              />
            </div>
          )}

          <button
            className={`flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg ${activeSort ? 'text-blue-600 bg-blue-100' : 'text-gray-600'} hover:text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white`}
            onClick={() => setShowSortDropdown((prev) => !prev)}
          >
            <ArrowDownUp className="h-5 w-5 mr-2" />
            Сортировка
            {activeSort && (
              <XCircle className="h-4 w-4 ml-2 text-red-600 cursor-pointer" onClick={clearSort} />
            )}
          </button>
          {showSortDropdown && (
            <div className="absolute z-20 mt-14 right-0 translate-x-[-215px]">
              <SortDropdown
                onSelectSort={(value) => {
                  handleSelectSort(value);
                  setShowSortDropdown(false);
                }}
                activeSort={activeSort}
                onClearSort={clearSort}
                onClose={() => setShowSortDropdown(false)}
              />
            </div>
          )}
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