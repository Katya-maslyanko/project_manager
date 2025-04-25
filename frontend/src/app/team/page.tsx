'use client';

import React, { useState } from 'react';
import { useGetMyTeamsQuery } from '@/state/api';
import { useAuth } from '@/context/AuthContext';
import InboxWrapper from '@/app/inboxWrapper';
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import ProjectManagerTeamsPage from './ProjectManagerTeamsPage';
import UserTeamPage from './UserTeamPage';

type BreadcrumbItem = {
  label: string;
  href: string;
};

const breadcrumbsItems: BreadcrumbItem[] = [
  { label: "Главная", href: "/" },
  { label: "Команда", href: "/team" },
];

const TeamPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: teams, isLoading: teamsLoading, error } = useGetMyTeamsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Отрисовка состояний
  if (authLoading || teamsLoading) {
    return <p className="p-4">Загрузка…</p>;
  }
  if (!user) {
    return <p className="p-4 text-gray-500">Пользователь не авторизован</p>;
  }
  if (error) {
    console.error("Ошибка при загрузке команд в TeamPage:", error);
    return <p className="p-4 text-red-500">Не удалось загрузить команды: {JSON.stringify(error)}</p>;
  }

  // Проверяем роль пользователя
  if (user.role === 'project_manager') {
    return <ProjectManagerTeamsPage />;
  } else {
    return <UserTeamPage />;
  }
};

export default TeamPage;