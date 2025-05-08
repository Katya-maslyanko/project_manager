"use client";

import React, { useEffect, useState } from "react";
import { useGetSubtasksByAssigneeQuery, useGetProjectsQuery, useGetMyTeamsQuery, useUpdateSubTaskStatusMutation } from "@/state/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  CircleCheck,
  LoaderCircle,
  BookCheck,
  Users,
  FolderKanban,
  GripVertical,
  Star,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Link from "next/link"

const TeamMemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: subtasks = [], isLoading: subtasksLoading } = useGetSubtasksByAssigneeQuery(user?.id || 0, {
    skip: !user,
  });
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery(undefined, {
    skip: !user,
  });
  const { data: teams = [], isLoading: teamsLoading } = useGetMyTeamsQuery(undefined, {
    skip: !user,
  });
  const [updateSubtaskStatus] = useUpdateSubTaskStatusMutation();

  const [activeTab, setActiveTab] = useState("Новые");
  const [filteredSubtasks, setFilteredSubtasks] = useState(subtasks);

  useEffect(() => {
    if (subtasks.length > 0) {
      let result = [...subtasks];
      if (activeTab === "Новые") result = result.filter(subtask => subtask.status === "Новая");
      if (activeTab === "В процессе") result = result.filter(subtask => subtask.status === "В процессе");
      if (activeTab === "Завершено") result = result.filter(subtask => subtask.status === "Завершено");
      setFilteredSubtasks(result);
    }
  }, [subtasks, activeTab]);

  if (subtasksLoading || projectsLoading || teamsLoading) {
    return <div className="p-6">Загрузка данных...</div>;
  }

  if (!user) {
    return <div className="p-6 text-gray-500">Пользователь не авторизован</div>;
  }

  const totalSubtasks = subtasks.length;
  const subtasksNew = subtasks.filter(subtask => subtask.status === "Новая").length;
  const subtasksInProgress = subtasks.filter(subtask => subtask.status === "В процессе").length;
  const subtasksDone = subtasks.filter(subtask => subtask.status === "Завершено").length;

  const pointsSum = subtasks.reduce((sum, subtask) => sum + (subtask.points || 0), 0);
  const highComplexitySubtasks = subtasks.filter(subtask => subtask.stars >= 4).length;
  const avgSubtaskComplexity = subtasks.length > 0 ? subtasks.reduce((sum, subtask) => sum + (subtask.stars || 0), 0) / subtasks.length : 0;

  let recommendation = "";
  if (totalSubtasks === 0) {
    recommendation = "Нет подзадач. Рекомендуется назначить подзадачу.";
  } else if (highComplexitySubtasks > 0 || totalSubtasks > 5) {
    recommendation = "Высокая нагрузка или сложные подзадачи. Не рекомендуется добавлять новые.";
  } else {
    recommendation = "Можно назначить новые подзадачи.";
  }

  const chartData = [
    { name: "Новые", value: subtasksNew },
    { name: "В процессе", value: subtasksInProgress },
    { name: "Завершено", value: subtasksDone },
  ];

  const COLORS = ["#facc15", "#c084fc", "#4ade80"];

  const tagColors = ['bg-red-100 text-red-600', 'bg-yellow-100 text-yellow-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
  const getTagColor = (index: number) => tagColors[index % tagColors.length];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не указано";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateSubtaskStatus({ id, status }).unwrap();
    } catch (error) {
      console.error("Ошибка обновления статуса подзадачи:", error);
    }
  };

  const TabButton: React.FC<{ name: string; icon?: React.ReactNode; setActiveTab: (tab: string) => void; activeTab: string }> = ({ name, icon, setActiveTab, activeTab }) => {
    const isActive = activeTab === name;
    return (
      <button
        className={`flex items-center px-4 py-2 rounded-md transition duration-200 ${isActive ? "bg-white text-blue-600" : "bg-gray-200 text-gray-600"}`}
        onClick={() => setActiveTab(name)}
      >
        {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })}
        <span className="text-base">{name}</span>
      </button>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between">
        <div>
            <h2 className="text-xl font-semibold mb-2">Привет, {user.first_name || user.username}!</h2>
            <p className="text-base text-gray-600">Давайте начнем работу! У вас есть подзадачи, которые ждут вашего внимания.</p>
        </div>
        <Link href="http://localhost:3000/my-tasks">
          <button className="flex items-center px-4 py-2 text-base border border-gray-200 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            Просмотр всех задач
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-lg">
            <Calendar size={22} className="text-rose-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{totalSubtasks}</div>
            <div className="text-sm text-gray-500">Всего подзадач</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
            <CircleCheck size={22} className="text-yellow-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{subtasksNew}</div>
            <div className="text-sm text-gray-500">Новые подзадачи</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <LoaderCircle size={22} className="text-blue-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{subtasksInProgress}</div>
            <div className="text-sm text-gray-500">Подзадачи в процессе</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg shadow-sm bg-white">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
            <BookCheck size={22} className="text-green-700" />
          </div>
          <div className="ml-4 text-right">
            <div className="font-bold text-2xl">{subtasksDone}</div>
            <div className="text-sm text-gray-500">Завершенные подзадачи</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Мои подзадачи ({totalSubtasks})</h2>
          <div className="flex items-center border bg-gray-200 rounded-md mb-4 max-w-full">
            <TabButton name="Новые" setActiveTab={setActiveTab} activeTab={activeTab} />
            <TabButton name="В процессе" setActiveTab={setActiveTab} activeTab={activeTab} />
            <TabButton name="Завершено" setActiveTab={setActiveTab} activeTab={activeTab} />
          </div>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                  <th className="py-3 px-4">Подзадача</th>
                  <th className="py-3 px-4">Сроки</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubtasks.map(subtask => {
                  const isChecked = subtask.status === 'Завершено';
                  const isOverdue = subtask.due_date && new Date(subtask.due_date) < new Date() && subtask.status !== "Завершено";
                  return (
                    <tr key={subtask.id} className="border-t border-b cursor-pointer hover:bg-gray-50">
                      <td className="py-2 pl-2 border-r">
                        <div className="flex items-center">
                          <div className="cursor-pointer">
                            <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                          </div>
                          <div className="flex items-center pl-1">
                            <label className="flex items-center cursor-pointer relative">
                              <input
                                type="checkbox"
                                id={`subtaskCheckbox-${subtask.id}`}
                                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
                                checked={isChecked}
                                onChange={() => handleStatusChange(subtask.id, isChecked ? "В процессе" : "Завершено")}
                              />
                              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              </span>
                            </label>
                            <label className="ml-2 w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                              {subtask.title}
                            </label>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4 border-r w-full">
                        <div className="flex items-center space-x-2">
                          <span className={isOverdue ? "text-red-400 font-semibold" : ""}>
                            {formatDate(subtask.start_date)} - {formatDate(subtask.due_date)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-1 z-10">
          <h2 className="text-lg font-semibold mb-4">Эффективность по подзадачам</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} подзадач`, "Подзадачи"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Ваши подзадачи распределены по статусам. Продолжайте в том же духе!</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Анализ вашей работы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <h3 className="text-md font-medium text-blue-800 mb-1">Рекомендация</h3>
            <p className="text-sm text-blue-600">{recommendation}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <h3 className="text-md font-medium text-green-800 mb-1">Общее количество баллов</h3>
            <p className="text-2xl font-bold text-green-600">{pointsSum}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <h3 className="text-md font-medium text-purple-800 mb-1">Средняя сложность</h3>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-purple-600 mr-2">{avgSubtaskComplexity.toFixed(1)}</p>
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <h3 className="text-md font-medium text-red-800 mb-1">Сложные подзадачи</h3>
            <p className="text-2xl font-bold text-red-600">{highComplexitySubtasks}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-4">
            <FolderKanban size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Проекты ({projects.length})</h2>
          </div>
          <ul className="space-y-3">
            {projects.length > 0 ? (
              projects.map((project) => (
                <li key={project.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative flex items-center justify-center w-11 h-11 bg-blue-600 rounded-lg overflow-hidden mr-3">
                        <span className="text-xl font-bold text-white">{project.name?.charAt(0) || 'П'}</span>
                      </div>
                      <span className="font-bold text-base text-gray-800">{project.name}</span>
                    </div>
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {project.members_info && project.members_info.length > 0 ? (
                        project.members_info.slice(0, 5).map((member, idx) => (
                          <div
                            key={member.id}
                            className={`w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center ${getTagColor(idx)}`}
                            title={`${member.first_name} ${member.last_name}`}
                          >
                            <span className="text-xs">{member.username ? member.username.charAt(0) : '?'}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Нет участников</span>
                      )}
                      {project.members_info && project.members_info.length > 5 && (
                        <div className="w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                          <span className="text-xs">+{project.members_info.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">Вы не участвуете в проектах.</p>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-4">
            <Users size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Команды ({teams.length})</h2>
          </div>
          <ul className="space-y-3">
            {teams.length > 0 ? (
              teams.map((team) => (
                <li key={team.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-gray-800">{team.name}</span>
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {team.members_info && team.members_info.length > 0 ? (
                        team.members_info.slice(0, 5).map((member, idx) => (
                          <div
                            key={member.id}
                            className={`w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center ${getTagColor(idx)}`}
                            title={`${member.first_name} ${member.last_name}`}
                          >
                            <span className="text-xs">{member.username ? member.username.charAt(0) : '?'}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Нет участников</span>
                      )}
                      {team.members_info && team.members_info.length > 5 && (
                        <div className="w-10 h-10 border-2 border-gray-200 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                          <span className="text-xs">+{team.members_info.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">Вы не состоите в командах.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;