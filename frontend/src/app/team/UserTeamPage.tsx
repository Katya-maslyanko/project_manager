'use client';

import React, { useState } from 'react';
import { useGetMyTeamsQuery } from '@/state/api'; // Используем useGetMyTeamsQuery вместо useGetTeamsByUserQuery
import { useAuth } from '@/context/AuthContext';
import InboxWrapper from '@/app/inboxWrapper';
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";

type BreadcrumbItem = {
  label: string;
  href: string;
};

const breadcrumbsItems: BreadcrumbItem[] = [
  { label: "Главная", href: "/" },
  { label: "Команда", href: "/team" },
];

const tagColors = [
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

const UserTeamPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const { data: teams = [], isLoading: teamsLoading, error } = useGetMyTeamsQuery(undefined, {
    skip: authLoading || !user,
  });

  if (authLoading || teamsLoading) {
    return <p className="p-4">Загрузка…</p>;
  }
  if (!user) {
    return <p className="p-4 text-gray-500">Пользователь не авторизован</p>;
  }
  if (error) {
    return <p className="p-4 text-red-500">Не удалось загрузить команды: {JSON.stringify(error)}</p>;
  }
  if (!teams.length) {
    return <p className="p-4 text-gray-500">Вы ни в одной команде не состоите</p>;
  }

  const currentTeam = teams.find(t => t.id === selectedTeamId) ?? teams[0];

  const filteredMembers = currentTeam.members_info.filter(m =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <InboxWrapper>
      <div className="rounded-2xl borde px-4 dark:border-gray-800 dark:bg-white/[0.03] xl:px-6">
        <Breadcrumbs items={breadcrumbsItems} />
        <h1 className="mt-4 text-3xl font-semibold">Ваши команды</h1>

        <div className="mt-4">
          <select
            value={currentTeam.id}
            onChange={e => setSelectedTeamId(Number(e.target.value))}
            className="mt-1 block w-full max-w-sm rounded border px-4 py-2 focus:outline-none transition dark:bg-gray-700 dark:text-white dark:border-gray-700"
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <h2 className="mt-6 text-2xl font-semibold">Участники «{currentTeam.name}»</h2>
        <p className="text-gray-600 mt-2 mb-6 dark:text-gray-400">{currentTeam.description}</p>

        <input
          type="text"
          placeholder="Поиск участников"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border w-full max-w-sm rounded px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-700"
        />

        <div className="overflow-x-auto mt-4 sm:rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                <th className="py-2 px-4">Иконка</th>
                <th className="py-2 px-4">Логин</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Имя</th>
                <th className="py-2 px-4">Роль</th>
                <th className="py-2 px-4">Позиция</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 dark:text-gray-300">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="border-t dark:border-gray-700">
                  <td className="py-2 px-4">
                    <div className={`${getTagColor(idx)} w-10 h-10 rounded-full flex items-center justify-center`}>
                      <span className='font-semibold'>{m.username.charAt(0)}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">{m.username}</td>
                  <td className="py-2 px-4">{m.email}</td>
                  <td className="py-2 px-4">{`${m.first_name} ${m.last_name}`.trim() || '—'}</td>
                  <td className="py-2 px-4">{m.role_display || '—'}</td>
                  <td className="py-2 px-4">{m.project_position || '—'}</td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr><td colSpan={6} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">Ничего не найдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </InboxWrapper>
  );
};

export default UserTeamPage;