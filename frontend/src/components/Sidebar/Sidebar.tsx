"use client";
import React, { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  CircleCheckBig,
  ChartNoAxesCombined,
  FolderKanban,
  Users,
  ChevronDown,
  Plus,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard />,
    name: "Дашборд",
    path: "/",
  },
  {
    icon: <CircleCheckBig />,
    name: "Мои задачи",
    path: "/my-tasks",
  },
  {
    icon: <ChartNoAxesCombined />,
    name: "Отчет",
    path: "/report",
  },
  {
    name: "Проекты",
    icon: <FolderKanban />,
    subItems: [
      { name: "Проект 1", path: "/project-1" },
      { name: "Проект 2", path: "/project-2" },
    ],
  },
  {
    name: "Группа",
    icon: <Users />,
    subItems: [
      { name: "Группа 1", path: "/group-1" },
      { name: "Группа 2", path: "/group-2" },
    ],
  },
];

const projectColors = ["bg-red-200", "bg-green-200"]; // Цвета для проектов
const groupColors = ["bg-pink-200", "bg-yellow-200"]; // Цвета для групп

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const pathname = usePathname();

  const [openProjects, setOpenProjects] = useState(false);
  const [openGroups, setOpenGroups] = useState(false);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const toggleProjects = () => {
    setOpenProjects((prev) => !prev);
  };

  const toggleGroups = () => {
    setOpenGroups((prev) => !prev);
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div className={`py-7 flex ${!isExpanded ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isMobileOpen ? (
            <Image
              src="/images/logo/icon_logo_open.svg"
              alt="Icon Logo Open"
              width={160}
              height={60}
            />
          ) : (
            <Image
              src="/images/logo/icon_logo_close.svg"
              alt="Logo"
              width={40}
              height={40}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          {/* Основные ссылки */}
          <ul className="flex flex-col gap-2">
            {navItems.slice(0, 3).map((nav) => (
              <li key={nav.name}>
                <Link
                  href={nav.path!}
                  className={`flex items-center px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 ease-in-out ${
                    isActive(nav.path!) ? "bg-blue-600 text-white" : "text-gray-600"
                  }`}
                >
                  <span className={`mr-2 ${isActive(nav.path!) ? "text-white" : "text-gray-500"}`}>
                    {nav.icon}
                  </span>
                  {isExpanded && <span className="text-lg">{nav.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 my-4" />

          {/* Мои Проекты */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-gray-400 text-sm font-semibold uppercase flex items-center ${!isExpanded ? "justify-center w-full" : ""}`}>
                {isExpanded ? "Мои Проекты" : "..."}
              </h2>
              {isExpanded && (
                <button className="bg-blue-100 rounded-lg p-1 w-8 h-8 flex items-center justify-center">
                  <Plus className="text-blue-600 w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={toggleProjects} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 ease-in-out ${openProjects ? "bg-gray-200" : ""}`}>
              <span className="flex items-center">
                <FolderKanban className={`mr-2 ${openProjects ? "text-blue-600" : "text-gray-500"}`} />
                {isExpanded && <span className={`text-lg ${openProjects ? "text-blue-600" : "text-gray-600"}`}>Проекты</span>}
              </span>
              <ChevronDown className={`transition-transform duration-200 ${openProjects ? "rotate-180" : ""} text-gray-500`} />
            </button>
            {openProjects && (
              <ul className="ml-4 mt-2 space-y-1">
                {navItems[3].subItems?.map((subItem, index) => (
                  <li key={subItem.name} className="flex items-center">
                    <Link
                      href={subItem.path!}
                      className={`flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 ease-in-out ${
                        isActive(subItem.path!) ? "bg-blue-600 text-white" : "text-gray-600"
                      }`}
                    >
                      <span className={`mr-2 w-4 h-4 rounded ${isActive(subItem.path!) ? "bg-white" : projectColors[index % projectColors.length]}`} />
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200 my-4" />

          {/* Мои Группы */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-gray-400 text-sm font-semibold uppercase flex items-center ${!isExpanded ? "justify-center w-full" : ""}`}>
                {isExpanded ? "Мои Группы" : "..."}
              </h2>
              {isExpanded && (
                <button className="bg-blue-100 rounded-lg p-1 w-8 h-8 flex items-center justify-center">
                  <Plus className="text-blue-600 w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={toggleGroups} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 ease-in-out ${openGroups ? "bg-gray-200" : ""}`}>
              <span className="flex items-center">
                <Users className={`mr-2 ${openGroups ? "text-blue-600" : "text-gray-500"}`} />
                {isExpanded && <span className={`text-lg ${openGroups ? "text-blue-600" : "text-gray-600"}`}>Группы</span>}
              </span>
              <ChevronDown className={`transition-transform duration-200 ${openGroups ? "rotate-180" : ""} text-gray-500`} />
            </button>
            {openGroups && (
              <ul className="ml-4 mt-2 space-y-1">
                {navItems[4].subItems?.map((subItem, index) => (
                  <li key={subItem.name} className="flex items-center">
                    <Link
                      href={subItem.path!}
                      className={`flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 ease-in-out ${
                        isActive(subItem.path!) ? "bg-blue-600 text-white" : "text-gray-600"
                      }`}
                    >
                      <span className={`mr-2 w-4 h-4 rounded ${isActive(subItem.path!) ? "bg-white" : groupColors[index % groupColors.length]}`} />
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;