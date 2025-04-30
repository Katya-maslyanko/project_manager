'use client';

import React, { useState } from 'react';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '@/state/api';
import { useAuth } from '@/context/AuthContext';
import InboxWrapper from '@/app/inboxWrapper';
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";

type BreadcrumbItem = {
  label: string;
  href: string;
};

const breadcrumbsItems: BreadcrumbItem[] = [
  { label: "Главная", href: "/" },
  { label: "Пользователи", href: "/users" },
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

const UserManagementPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: users = [], isLoading: usersLoading, error } = useGetUsersQuery(undefined, {
    skip: authLoading || !user,
  });
  const [updateUserRole] = useUpdateUserRoleMutation();

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap();
      alert('Роль успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      alert('Не удалось обновить роль');
    }
  };

  if (authLoading || usersLoading) {
    return <p className="p-4">Загрузка…</p>;
  }
  if (!user) {
    return <p className="p-4 text-gray-500">Пользователь не авторизован</p>;
  }
  if (error) {
    return <p className="p-4 text-red-500">Не удалось загрузить пользователей: {JSON.stringify(error)}</p>;
  }
  if (!users.length) {
    return <p className="p-4 text-gray-500">Нет пользователей для отображения</p>;
  }

  return (
    <InboxWrapper>
      <div className="rounded-2xl px-4 dark:border-gray-800 dark:bg-white/[0.03] xl:px-6">
        <Breadcrumbs items={breadcrumbsItems} />
        <h1 className="mt-4 text-3xl font-semibold">Управление пользователями</h1>

        <div className="overflow-x-auto mt-4 mb-4 sm:rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                <th className="py-2 px-4">Иконка</th>
                <th className="py-2 px-4">Логин</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Имя</th>
                <th className="py-2 px-4">Роль</th>
                <th className="py-2 px-4">Изменить роль</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 dark:text-gray-300">
              {users.map((user, idx) => (
                <tr key={user.id} className="border-t dark:border-gray-700">
                  <td className="py-2 px-4">
                    <div className={`${getTagColor(idx)} border w-10 h-10 rounded-full flex items-center justify-center`}>
                      <span className='font-semibold'>{user.username.charAt(0)}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{`${user.first_name} ${user.last_name}`.trim() || ' — '}</td>
                  <td className="py-2 px-4">{user.role_display || '—'}</td>
                  <td className="py-2 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="admin">Администратор</option>
                      <option value="project_manager">Куратор проекта</option>
                      <option value="team_leader">Лидер подгруппы</option>
                      <option value="team_member">Участник команды</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">Ничего не найдено</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </InboxWrapper>
  );
};

export default UserManagementPage;