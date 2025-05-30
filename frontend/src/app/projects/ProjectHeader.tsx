"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  ListFilter,
  Grid2x2Check,
  ListTodo,
  ArrowDownUp,
  SquareArrowOutUpRight,
  XCircle,
  BookOpenCheck,
  Map,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import SortDropdown from "@/components/ui/dropdown/SortDropdown";
import FilterDropdownAdvanced, { FilterOptions } from "@/components/ui/dropdown/FilterDropdownAdvanced";
import { useInviteProjectMemberMutation } from "@/state/api";

type BreadcrumbItem = {
  label: string;
  href: string;
};

type Props = {
  projectName: string;
  projectId: number | null;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  onSelectSort: (value: string) => void;
  onApplyFilter: (filters: FilterOptions) => void;
  members: Member[];
  refetch: () => void;
  onSearch: (query: string) => void;
};

interface Member {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const tagColors = [
  "bg-red-100 text-red-600",
  "bg-yellow-100 text-yellow-600",
  "bg-green-100 text-green-600",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

const ProjectHeader: React.FC<Props> = ({
  projectName,
  projectId,
  activeTab,
  setActiveTab,
  onSelectSort,
  onApplyFilter,
  members,
  refetch,
  onSearch,
}) => {
  const breadcrumbsItems: BreadcrumbItem[] = [
    { label: "Главная", href: "/" },
    { label: projectName, href: `/projects/${projectName}` },
  ];

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const [inviteMember, { isLoading }] = useInviteProjectMemberMutation();
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    tags: new Set(),
    priorities: new Set(),
    assignedTo: "all",
  });
  const [activeSort, setActiveSort] = useState<string | null>(null);

  // Обработчик клика вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && showShareModal) {
        setShowShareModal(false);
        setEmail("");
        setError("");
        setSuccess("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareModal]);

  const handleShareButtonClick = () => {
    if (shareButtonRef.current) {
      const rect = shareButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX - 218,
      });
      setShowShareModal(true);
    }
  };

  const handleApplyFilter = (filters: FilterOptions) => {
    console.log("Filters applied in ProjectHeader:", filters);
    setActiveFilters(filters);
    onApplyFilter(filters);
    setShowFilterDropdown(false);
    refetch();
  };

  const handleSelectSort = (value: string) => {
    setActiveSort(value);
    onSelectSort(value);
    setShowSortDropdown(false);
    refetch();
  };

  const clearFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFilters({ tags: new Set(), priorities: new Set(), assignedTo: "all" });
    onApplyFilter({ tags: new Set(), priorities: new Set(), assignedTo: "all" });
    refetch();
    setShowFilterDropdown(false);
  };

  const clearSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSort(null);
    onSelectSort("");
    refetch();
    setShowSortDropdown(false);
  };

  const handleShare = async () => {
    if (!projectId) {
      setError("ID проекта отсутствует");
      return;
    }
    if (!email) {
      setError("Введите email");
      return;
    }
    setError("");
    setSuccess("");

    try {
      const result = await inviteMember({ projectId, email }).unwrap();
      setSuccess(result.message);
      setEmail("");
      setTimeout(() => setShowShareModal(false), 2000);
    } catch (err: any) {
      setError(err?.data?.error || "Ошибка при отправке приглашения");
    }
  };

  return (
    <div className="px-4 sm:px-2 md:px-2 mx-auto xl:px-6 dark:bg-dark-bg">
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-between sm:justify-start mt-4 sm:space-y-0 sm:gap-72">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
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
                    {member.username ? member.username.charAt(0) : "?"}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400 text-sm">Нет участников</span>
            )}
            {members && members.length > 5 && (
              <div className="w-11 h-11 border-2 font-semibold border-gray-100 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-200 text-gray-600 dark:bg-dark-bg dark:text-gray-400">
                <span className="text-xs">+{members.length - 5}</span>
              </div>
            )}
          </div>
          <button
            ref={shareButtonRef}
            className="flex items-center px-4 py-2 text-base border bg-blue-100 rounded-lg text-blue-700 hover:text-white hover:bg-blue-600 duration-200 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={handleShareButtonClick}
          >
            <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
            Делиться
          </button>
        </div>
      </div>
      {showShareModal && (
        <div
          ref={modalRef}
          className="absolute z-50 bg-white dark:bg-dark-bg p-6 rounded-lg shadow-lg w-96 dark:border dark:border-gray-800"
          style={{ top: `${modalPosition.top}px`, left: `${modalPosition.left}px` }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-400">
            Поделиться проектом
          </h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите email"
            className="w-full p-2 border rounded-md mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-600 hover:text-white disabled:bg-blue-400 dark:bg-dark-bg dark:border dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={handleShare}
              disabled={isLoading}
            >
              {isLoading ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </div>
      )}

  <div className="flex flex-col sm:flex-row items-center mb-4 gap-4 sm:gap-2">
    <div className="flex items-center border dark:border-gray-800 bg-gray-200 dark:bg-dark-bg rounded-md">
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
          <TabButton
            name="Карта"
            icon={<Map className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        <div className="flex items-center ml-auto space-x-2">
          <button
            className={`flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg ${
              activeFilters.priorities.size ||
              activeFilters.tags.size ||
              activeFilters.assignedTo === "me" ||
              activeFilters.goalId
                ? "text-blue-600 bg-blue-100"
                : "text-gray-600 dark:text-gray-400"
            } hover:text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:hover:bg-gray-800 dark:hover:text-white`}
            onClick={() => setShowFilterDropdown((prev) => !prev)}
          >
            <ListFilter className="h-5 w-5 mr-2" />
            Фильтр
            {(activeFilters.priorities.size ||
              activeFilters.tags.size ||
              activeFilters.assignedTo === "me" ||
              activeFilters.goalId) && (
              <XCircle className="h-4 w-4 ml-2 text-red-600 cursor-pointer" onClick={(e) => clearFilters(e)} />
            )}
          </button>
          {showFilterDropdown && projectId && (
            <div className="absolute z-20 mt-14 right-0 sm:right-0 sm:left-auto sm:w-80 translate-x-[-355px]">
              <FilterDropdownAdvanced
                onApply={handleApplyFilter}
                onClose={() => setShowFilterDropdown(false)}
                projectId={projectId}
              />
            </div>
          )}

          <button
            className={`flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg ${
              activeSort ? "text-blue-600 bg-blue-100" : "text-gray-600 dark:text-gray-400"
            } hover:text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-dark-bg dark:hover:bg-gray-800 dark:hover:text-white`}
            onClick={() => setShowSortDropdown((prev) => !prev)}
          >
            <ArrowDownUp className="h-5 w-5 mr-2" />
            Сортировка
            {activeSort && (
              <XCircle className="h-4 w-4 ml-2 text-red-600 cursor-pointer" onClick={(e) => clearSort(e)} />
            )}
          </button>
          {showSortDropdown && (
            <div className="absolute z-20 mt-14 right-0 sm:right-0 sm:left-auto sm:w-80 translate-x-[-215px]">
              <SortDropdown
                onSelectSort={handleSelectSort}
                activeSort={activeSort}
                onClearSort={() => {
                  clearSort(new MouseEvent("click") as unknown as React.MouseEvent);
                }}
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
      className={`flex items-center px-4 lg:px-4 lg:py-2 sm:px-2 py-2 sm:py-1.5 rounded-md transition duration-200 ${
        isActive
          ? "bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400"
          : "bg-gray-200 text-gray-600 dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      }`}
      onClick={() => setActiveTab(name)}
      title={name}
    >
      {icon}
      <span className="ml-2 text-base sm:hidden lg:block">{name}</span>
    </button>
  );
};

export default ProjectHeader;