"use client";

import React from "react";
import { useGetProjectsQuery, useGetMyTeamsQuery } from "@/state/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  CircleCheck,
  LoaderCircle,
  BookCheck,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: !user,
  });
  const { data: teams = [], isLoading: teamsLoading } = useGetMyTeamsQuery(undefined, {
    skip: !user,
  });

  if (projectsLoading || teamsLoading) {
    return <div className="p-6">Загрузка данных...</div>;
  }

  // Подсчет общей статистики
  const totalProjects = projects.length;
  const totalTeams = teams.length;
  const totalTasks = projects.reduce((sum, project) => sum + (project.total_tasks || 0), 0);
  const totalSubtasks = projects.reduce((sum, project) => sum + (project.total_subtasks || 0), 0);
  const tasksNew = projects.reduce((sum, project) => sum + (project.tasks_new || 0), 0);
  const tasksInProgress = projects.reduce((sum, project) => sum + (project.tasks_in_progress || 0), 0);
  const tasksDone = projects.reduce((sum, project) => sum + (project.tasks_done || 0), 0);

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Дашборд администратора</h1>
      <div className="flex gap-4 mb-8">
        <div className="flex-1 flex gap-4">
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-blue-100 rounded-lg">
              <Clock size={20} className="text-blue-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{totalTasks}</div>
              <div className="text-xs text-gray-500">Всего задач</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-rose-100 rounded-lg">
              <Calendar size={20} className="text-rose-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{totalSubtasks}</div>
              <div className="text-xs text-gray-500">Всего подзадач</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-yellow-100 rounded-lg">
              <CircleCheck size={20} className="text-yellow-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{tasksNew}</div>
              <div className="text-xs text-gray-500">Новые</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-purple-100 rounded-lg">
              <LoaderCircle size={20} className="text-purple-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{tasksInProgress}</div>
              <div className="text-xs text-gray-500">В процессе</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-green-100 rounded-lg">
              <BookCheck size={20} className="text-green-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{tasksDone}</div>
              <div className="text-xs text-gray-500">Завершено</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-6 w-full">
        <div className="flex-1 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Общая информация</h2>
            <p className="text-base text-gray-600">Всего проектов: {totalProjects}</p>
            <p className="text-base text-gray-600">Всего команд: {totalTeams}</p>
          </div>
        </div>
        <div className="flex-1 max-w-full">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Дополнительная информация</h2>
            <p className="text-base text-gray-600">Здесь можно добавить графики или другие данные для администратора.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;