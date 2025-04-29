"use client";

import React, { useState } from "react";
import { useGetProjectsQuery, useGetTeamsQuery, useGetUsersQuery } from "@/state/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Users,
  FolderKanban,
  BarChart2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: allProjects = [], isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });
  const { data: allTeams = [], isLoading: teamsLoading } = useGetTeamsQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });
  const { data: allUsers = [], isLoading: usersLoading } = useGetUsersQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  if (projectsLoading || teamsLoading || usersLoading) {
    return <div className="p-6">Загрузка данных...</div>;
  }

  if (!user) {
    return <div className="p-6 text-gray-500">Пользователь не авторизован</div>;
  }

  const totalProjects = allProjects.length;
  const totalTasks = allProjects.reduce((sum, project) => sum + (project.total_tasks || 0), 0);
  const tasksNew = allProjects.reduce((sum, project) => sum + (project.tasks_new || 0), 0);
  const tasksInProgress = allProjects.reduce((sum, project) => sum + (project.tasks_in_progress || 0), 0);
  const tasksDone = allProjects.reduce((sum, project) => sum + (project.tasks_done || 0), 0);

  const totalTeams = allTeams.length;
  const totalMembers = allUsers.length;

  let totalTasksAssigned = 0;
  let totalTasksCompleted = 0;
  allProjects.forEach(project => {
    project.members_info.forEach(member => {
      totalTasksAssigned += member.analytics.total_tasks || 0;
      totalTasksCompleted += member.analytics.tasks_done || 0;
    });
  });
  const completionRate = totalTasksAssigned > 0 ? (totalTasksCompleted / totalTasksAssigned * 100).toFixed(1) : 0;

  const projectChartData = allProjects.map(project => ({
    name: project.name,
    Новые: project.tasks_new || 0,
    "В процессе": project.tasks_in_progress || 0,
    Завершено: project.tasks_done || 0,
  }));
  const taskDistributionData = [
    { name: "Новые", value: tasksNew },
    { name: "В процессе", value: tasksInProgress },
    { name: "Завершено", value: tasksDone },
  ];
  const roleDistributionData = allUsers.reduce((acc, user) => {
    const role = user.role_display || "Не указана";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const roleChartData = Object.entries(roleDistributionData).map(([role, count]) => ({ name: role, value: count }));

  const COLORS = { Новые: "#facc15", "В процессе": "#c084fc", Завершено: "#4ade80" };
  const PIE_COLORS = ["#facc15", "#c084fc", "#4ade80", "#ff9e7d", "#82ca9d", "#8884d8"];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не указано";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Привет, {user.first_name || user.username}!</h2>
          <p className="text-base text-gray-600">Вы администратор. Просмотрите состояние всей системы.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-lg">
            <FolderKanban size={22} className="text-rose-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalProjects}</div>
            <div className="text-sm text-gray-500">Проектов</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
            <Users size={22} className="text-yellow-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalTeams}</div>
            <div className="text-sm text-gray-500">Команд</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
            <Users size={22} className="text-green-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalMembers}</div>
            <div className="text-sm text-gray-500">Участников</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <Calendar size={22} className="text-blue-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalTasks}</div>
            <div className="text-sm text-gray-500">Всего задач</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-1 relative z-10">
          <h2 className="text-lg font-semibold mb-4">Распределение задач</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Распределение задач по статусам во всех проектах.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-1 relative z-10">
          <h2 className="text-lg font-semibold mb-4">Распределение ролей</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Распределение пользователей по ролям.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-1 relative z-10">
          <h2 className="text-lg font-semibold mb-4">Общий прогресс задач</h2>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Общий процент выполнения задач: <span className="font-bold">{completionRate}%</span> ({totalTasksCompleted} из {totalTasksAssigned})</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-blue-600 h-6 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <BarChart2 size={20} className="text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold">Эффективность по проектам ({totalProjects})</h2>
        </div>
        {projectChartData.length === 0 ? (
          <p className="text-gray-500 text-center">Данные по проектам отсутствуют.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Новые" fill={COLORS.Новые} />
                <Bar dataKey="В процессе" fill={COLORS["В процессе"]} />
                <Bar dataKey="Завершено" fill={COLORS.Завершено} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Все проекты ({totalProjects})</h2>
        {allProjects.length === 0 ? (
          <p className="text-gray-500">Проекты отсутствуют.</p>
        ) : (
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                  <th className="py-3 px-4">Проект</th>
                  <th className="py-3 px-4">Куратор</th>
                  <th className="py-3 px-4">Сроки</th>
                  <th className="py-3 px-4">Задачи (Всего/Завершено)</th>
                  <th className="py-3 px-4 min-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap">Прогресс (%)</th>
                </tr>
              </thead>
              <tbody>
                {allProjects.slice(0, showAllProjects ? allProjects.length : 5).map(project => {
                  const progress = project.total_tasks > 0 
                    ? ((project.tasks_done / project.total_tasks) * 100).toFixed(1) 
                    : 0;
                  return (
                    <tr key={project.id} className="border-t border-b cursor-pointer hover:bg-gray-50">
                      <td className="py-2 px-4 border-r">{project.name}</td>
                      <td className="py-2 px-4 border-r">{project.curator ? `${project.curator.first_name} ${project.curator.last_name}` : "Не указан"}</td>
                      <td className="py-2 px-4 border-r">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </td>
                      <td className="py-2 px-4 border-r">
                        {project.total_tasks} / {project.tasks_done}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm ml-2 text-gray-600">{progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {allProjects.length > 5 && (
              <button
                className="text-gray-500 text-sm mt-2 hover:text-gray-700 underline"
                onClick={() => setShowAllProjects(!showAllProjects)}
              >
                {showAllProjects ? "Свернуть" : `+ еще ${allProjects.length - 5} проектов`}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-4">
            <Users size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Все команды ({totalTeams})</h2>
          </div>
          <ul className="space-y-3">
            {allTeams.length > 0 ? (
              allTeams.slice(0, showAllTeams ? allTeams.length : 5).map(team => {
                const teamTasks = team.members_info.reduce((sum, member) => sum + member.analytics.total_tasks, 0);
                const teamTasksDone = team.members_info.reduce((sum, member) => sum + member.analytics.tasks_done, 0);
                const teamProgress = teamTasks > 0 ? ((teamTasksDone / teamTasks) * 100).toFixed(1) : 0;
                return (
                  <li key={team.id} className="p-4 rounded-xl bg-gray-50 border hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-bold text-base text-gray-800">{team.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">{team.members_info.length} участников</span>
                        <span className="text-sm text-gray-500">Задач: {teamTasks} (Завершено: {teamTasksDone})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${teamProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">Прогресс: {teamProgress}%</span>
                  </li>
                );
              })
            ) : (
              <p className="text-gray-500">Команды отсутствуют.</p>
            )}
          </ul>
          {allTeams.length > 5 && (
            <button
              className="text-gray-500 text-sm mt-2 hover:text-gray-700 underline"
              onClick={() => setShowAllTeams(!showAllTeams)}
            >
              {showAllTeams ? "Свернуть" : `+ еще ${allTeams.length - 5} команд`}
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-4">
            <Users size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Все участники ({totalMembers})</h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                  <th className="py-3 px-4">Имя</th>
                  <th className="py-3 px-4">Роль</th>
                  <th className="py-3 px-4">Email</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.slice(0, showAllMembers ? allUsers.length : 5).map(member => (
                  <tr key={member.id} className="border-t border-b cursor-pointer hover:bg-gray-50">
                    <td className="py-2 px-4 border-r">{member.first_name} {member.last_name}</td>
                    <td className="py-2 px-4 border-r">{member.role_display || "Не указана"}</td>
                    <td className="py-2 px-4">{member.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allUsers.length > 5 && (
              <button
                className="text-gray-500 text-sm mt-2 hover:text-gray-700 underline"
                onClick={() => setShowAllMembers(!showAllMembers)}
              >
                {showAllMembers ? "Свернуть" : `+ еще ${allUsers.length - 5} участников`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;