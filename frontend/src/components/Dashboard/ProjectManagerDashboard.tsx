"use client";

import React, { useState, useMemo } from "react";
import { useGetProjectsQuery, useGetMyTeamsQuery, useGetActivityLogsByProjectQuery } from "@/state/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Users,
  FolderKanban,
  Activity,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const ProjectManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: allProjects = [], isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });
  const { data: myTeams = [], isLoading: teamsLoading } = useGetMyTeamsQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  if (projectsLoading || teamsLoading) {
    return <div className="p-6">Загрузка данных...</div>;
  }

  if (!user) {
    return <div className="p-6 text-gray-500">Пользователь не авторизован</div>;
  }

  const projects = allProjects.filter(project => project.curator && project.curator.id === user.id);

  const totalProjects = projects.length;
  const totalTasks = projects.reduce((sum, project) => sum + (project.total_tasks || 0), 0);
  const tasksNew = projects.reduce((sum, project) => sum + (project.tasks_new || 0), 0);
  const tasksInProgress = projects.reduce((sum, project) => sum + (project.tasks_in_progress || 0), 0);
  const tasksDone = projects.reduce((sum, project) => sum + (project.tasks_done || 0), 0);

  const totalTeams = myTeams.length;
  const allMembers = Array.from(new Map(myTeams.flatMap(team => team.members_info || []).map(member => [member.id, member])).values());
  const totalMembers = allMembers.length;
  const totalTasksAssigned = allMembers.reduce((sum, member) => sum + (member.analytics.total_tasks || 0), 0);
  const totalTasksCompleted = allMembers.reduce((sum, member) => sum + (member.analytics.tasks_done || 0), 0);
  const completionRate = totalTasksAssigned > 0 ? (totalTasksCompleted / totalTasksAssigned * 100).toFixed(1) : 0;

  const projectChartData = projects.map(project => ({
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

  const COLORS = { Новые: "#facc15", "В процессе": "#c084fc", Завершено: "#4ade80" };
  const PIE_COLORS = ["#facc15", "#c084fc", "#4ade80"];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не указано";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // // Получение данных активности для выбранного проекта
  // const { data: activityLogs = [], isLoading: activityLoading } = useGetActivityLogsByProjectQuery(
  //   { projectId: selectedProjectId || undefined },
  //   { skip: !selectedProjectId }
  // );

  // // Подготовка данных для графика активности
  // const activityData = useMemo(() => {
  //   const today = new Date();
  //   const startDate = new Date(today);
  //   startDate.setFullYear(today.getFullYear() - 1); // Последний год
  //   const days = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  //   const grid = Array.from({ length: days }, (_, i) => {
  //     const date = new Date(startDate);
  //     date.setDate(startDate.getDate() + i);
  //     return { date: date.toISOString().split('T')[0], count: 0 };
  //   });

  //   // activityLogs.forEach(log => {
  //   //   const logDate = new Date(log.day).toISOString().split('T')[0];
  //   //   const dayIndex = grid.findIndex(day => day.date === logDate);
  //   //   if (dayIndex >= 0) {
  //   //     grid[dayIndex].count += log.activity_count;
  //   //   }
  //   // });

  //   return grid;
  // }, [selectedProjectId]);

  // Определение цвета ячейки на основе количества активности
  const getActivityColor = (count: number) => {
    if (count === 0) return "#ebedf0"; // Нет активности
    if (count < 2) return "#9be9a8"; // Низкая активность
    if (count < 5) return "#40c463"; // Средняя активность
    if (count < 10) return "#30a14e"; // Высокая активность
    return "#216e39"; // Очень высокая активность
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-cente dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
        <div>
          <h2 className="text-xl font-semibold mb-2">Привет, {user.first_name || user.username}!</h2>
          <p className="text-base text-gray-600">Давайте проверим прогресс ваших проектов и команд.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
          <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-lg">
            <FolderKanban size={22} className="text-rose-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalProjects}</div>
            <div className="text-sm text-gray-500">Проектов</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
            <Users size={22} className="text-yellow-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalTeams}</div>
            <div className="text-sm text-gray-500">Команд</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
            <Users size={22} className="text-green-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalMembers}</div>
            <div className="text-sm text-gray-500">Участников</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
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
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-2 dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Мои проекты ({totalProjects})</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">Проекты отсутствуют. Вы не являетесь куратором ни одного проекта.</p>
          ) : (
            <div className="overflow-y-auto max-h-84">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600 text-sm bg-gray-100 dark:text-white dark:bg-gray-700 dark:border-gray-800 border rounded-md">
                    <th className="py-3 px-4">Проект</th>
                    <th className="py-3 px-4">Сроки</th>
                    <th className="py-3 px-4">Задачи (Всего/Завершено)</th>
                    <th className="py-3 px-4 min-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap">Прогресс (%)</th>
                    {/* <th className="py-3 px-4">Действия</th> */}
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => {
                    const progress = project.total_tasks > 0 
                      ? ((project.tasks_done / project.total_tasks) * 100).toFixed(1) 
                      : 0;
                    return (
                      <tr key={project.id} className="border-t border-b cursor-pointer hover:bg-gray-50 dark:border-gray-800">
                        <td className="py-2 px-4 border-r dark:border-gray-800">{project.name}</td>
                        <td className="py-2 px-4 border-r dark:border-gray-800">
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </td>
                        <td className="py-2 px-4 border-r dark:border-gray-800">
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
                        {/* <td className="py-2 px-4">
                          <button
                            className="text-blue-600 hover:underline text-sm"
                            onClick={() => setSelectedProjectId(project.id)}
                          >
                            Показать активность
                          </button>
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-1 relative z-10 dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
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
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Эффективность по проектам</h2>
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
      {/* График активности
      {selectedProjectId && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Activity size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">
              Активность проекта: {projects.find(p => p.id === selectedProjectId)?.name || "Неизвестно"}
            </h2>
          </div>
          {activityLoading ? (
            <p className="text-gray-500 text-center">Загрузка данных активности...</p>
          ) : activityData.length === 0 ? (
            <p className="text-gray-500 text-center">Данные по активности отсутствуют.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 min-w-[700px]">
                {activityData.map((day, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-sm cursor-pointer"
                    style={{ backgroundColor: getActivityColor(day.count) }}
                    title={`${day.date}: ${day.count} действий`}
                  />
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>Активность за последний год. Цвет ячейки отражает количество действий в день.</p>
                <div className="flex items-center mt-1">
                  <span className="mr-2">Меньше</span>
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ebedf0" }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#9be9a8" }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#40c463" }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#30a14e" }} />
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#216e39" }} />
                  <span className="ml-2">Больше</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )} */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
          <div className="flex items-center mb-4">
            <Users size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Мои команды ({totalTeams})</h2>
          </div>
          <ul className="space-y-3">
            {myTeams.length > 0 ? (
              myTeams.map(team => {
                const teamTasks = team.members_info.reduce((sum, member) => sum + member.analytics.total_tasks, 0);
                const teamTasksDone = team.members_info.reduce((sum, member) => sum + member.analytics.tasks_done, 0);
                const teamProgress = teamTasks > 0 ? ((teamTasksDone / teamTasks) * 100).toFixed(1) : 0;
                return (
                  <li key={team.id} className="p-4 rounded-xl bg-gray-50 border hover:shadow-sm transition-shadow dark:bg-dark-bg dark:text-white dark:border dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-bold text-base text-gray-800 dark:text-while">{team.name}</span>
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
              <p className="text-gray-500">Вы не являетесь руководителем команд.</p>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
          <div className="flex items-center mb-4">
            <Users size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Участники ({totalMembers})</h2>
          </div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Общий процент выполнения задач: <span className="font-bold">{completionRate}%</span> ({totalTasksCompleted} из {totalTasksAssigned})</p>
          </div>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-sm bg-gray-100 border dark:text-white dark:bg-gray-700 rounded-md dark:border-gray-800">
                  <th className="py-3 px-4">Имя</th>
                  <th className="py-3 px-4">Роль</th>
                  <th className="py-3 px-4">Задачи (Всего/Завершено)</th>
                  <th className="py-3 px-4">Прогресс (%)</th>
                </tr>
              </thead>
              <tbody>
                {allMembers.slice(0, showAllMembers ? allMembers.length : 5).map(member => {
                  const progress = member.analytics.total_tasks > 0 
                    ? ((member.analytics.tasks_done / member.analytics.total_tasks) * 100).toFixed(1) 
                    : 0;
                  return (
                    <tr key={member.id} className="border-t border-b cursor-pointer hover:bg-gray-50 dark:border-gray-800">
                      <td className="py-2 px-4 border-r dark:border-gray-800">{member.first_name} {member.last_name}</td>
                      <td className="py-2 px-4 border-r dark:border-gray-800">{member.role_display || "Не указана"}</td>
                      <td className="py-2 px-4 border-r dark:border-gray-800">{member.analytics.total_tasks} / {member.analytics.tasks_done}</td>
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
            {allMembers.length > 5 && (
              <button
                className="text-gray-500 text-sm mt-2 hover:text-gray-700 underline"
                onClick={() => setShowAllMembers(!showAllMembers)}
              >
                {showAllMembers ? "Свернуть" : `+ еще ${allMembers.length - 5} участников`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;