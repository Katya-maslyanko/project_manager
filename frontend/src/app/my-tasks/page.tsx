"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGetSubtasksByAssigneeQuery, Subtask } from "@/state/api";
import InboxWrapper from "@/app/inboxWrapper";
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import SubtaskListPage from "@/components/Subtask/SubtaskListPage";
import SubtaskKanbanPage from "@/components/Subtask/SubtaskKanban";
import SubtaskHeader from "./SubtaskHeader"; // Импортируем новый компонент

const MeTasksPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: subtasks = [], isLoading, error, refetch } = useGetSubtasksByAssigneeQuery(user?.id ?? 0, {
    skip: !user,
  });
  const [activeTab, setActiveTab] = useState<string>("Список");

  if (isLoading) return <p>Загрузка подзадач...</p>;
  if (error) return <p>Ошибка при загрузке: {JSON.stringify(error)}</p>;

  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Мои задачи", href: "/me-tasks" },
  ];

  return (
    <InboxWrapper>
      <div className="px-4 xl:px-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mb-5 flex items-center justify-between mt-4 dark:bg-dark-bg dark:border-gray-800">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Мои задачи
          </h1>
        </div>
        
        {/* Используем SubtaskHeader */}
        <SubtaskHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Компоненты без отступов */}
      {activeTab === 'Список' && <SubtaskListPage subtasks={subtasks} />}
      {activeTab === 'Доска' && <SubtaskKanbanPage subtasks={subtasks} />}
    </InboxWrapper>
  );
};

export default MeTasksPage;