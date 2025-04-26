"use client";
import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useGetProjectsQuery, useGetMyTeamsQuery } from "@/state/api";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CircleCheckBig,
  FolderKanban,
  Users,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useModal } from "@/context/ModalContext";

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
    icon: <Users />,
    name: "Команда",
    path: "/team",
  },
  {
    name: "Проекты",
    icon: <FolderKanban />,
    subItems: [],
  },
];

const projectColors = ["bg-red-200", "bg-green-200", "bg-blue-200", "bg-purple-200"];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { openModal } = useModal();
  const { user, isLoading: authLoading } = useAuth();

  const [openProjects, setOpenProjects] = useState(false);

  const { data: projects = [], error: projectsError, isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: authLoading || !user,
  });
  const { data: myTeams = [], error: teamsError, isLoading: teamsLoading } = useGetMyTeamsQuery(undefined, {
    skip: authLoading || !user,
  });

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const toggleProjects = () => {
    setOpenProjects((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setOpenProjects(false);
  };

  useEffect(() => {
    if (!isExpanded && !isMobileOpen) {
      setOpenProjects(false);
    }
  }, [isExpanded, isMobileOpen]);

  let filteredProjects: any[] = [];
  if (user) {
    const role = user.role || 'team_member';
    if (role === 'project_manager') {
      filteredProjects = projects.filter(project => project.curator?.id === user.id);
    } else {
      filteredProjects = projects.filter(project => {
        return myTeams.some(team => project.teams.some((projectTeam: { id: number; }) => projectTeam.id === team.id));
      });
    }
  }

  navItems[3].subItems = filteredProjects.map((project) => ({
    name: project.name,
    path: `/projects/${project.id}`,
  }));

  const canCreateProjects = user && user.role === 'project_manager';

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
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/icon_logo_open.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/icon_logo_dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/icon_logo_close.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <ul className="flex flex-col gap-2">
            {navItems.slice(0, 3).map((nav) => (
              <li key={nav.name}>
                <Link
                  href={nav.path!}
                  className={`flex items-center px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out ${
                    isActive(nav.path!) ? "bg-blue-600 text-white dark:bg-blue-800" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span className={`mr-2 ${isActive(nav.path!) ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isMobileOpen) && <span className="text-lg">{nav.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-gray-400 dark:text-gray-500 text-sm font-semibold uppercase flex items-center ${!(isExpanded || isMobileOpen) ? "justify-center w-full" : ""}`}>
                {(isExpanded || isMobileOpen) ? "Мои Проекты" : "..."}
              </h2>
              {(isExpanded || isMobileOpen) && canCreateProjects && (
                <button onClick={openModal} className="bg-blue-100 dark:bg-blue-900 rounded-lg p-1 w-8 h-8 flex items-center justify-center">
                  <Plus className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={toggleProjects} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out ${openProjects ? "bg-gray-200 dark:bg-gray-700" : ""}`}>
              <span className="flex items-center">
                <FolderKanban className={`mr-2 ${openProjects ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`} />
                {(isExpanded || isMobileOpen) && <span className={`text-lg ${openProjects ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}>Проекты</span>}
              </span>
              <ChevronDown className={`transition-transform duration-200 ${openProjects ? "rotate-180" : ""} text-gray-500 dark:text-gray-400`} />
            </button>
            {openProjects && (
              <ul className="ml-4 mt-2 space-y-1">
                {projectsLoading || teamsLoading ? (
                  <li className="text-gray-500 dark:text-gray-400 text-sm px-4 py-2">Загрузка проектов...</li>
                ) : projectsError || teamsError ? (
                  <li className="text-red-500 dark:text-red-400 text-sm px-4 py-2">Ошибка загрузки</li>
                ) : navItems[3].subItems?.length > 0 ? (
                  navItems[3].subItems?.map((subItem, index) => (
                    <li key={subItem.name} className="flex items-center">
                      <Link
                        href={subItem.path!}
                        className={`flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out ${
                          isActive(subItem.path!) ? "bg-blue-600 text-white dark:bg-blue-800" : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <span className={`mr-2 w-4 h-4 rounded ${projectColors[index % projectColors.length]}`} />
                        {subItem.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-gray-400 text-sm px-4 py-2">Нет проектов</li>
                )}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;