'use client';

import React from 'react';
import { Member } from '@/state/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';

const tagColors = [
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

interface Props {
  members: Member[];
  showAnalytics: boolean;
}

export default function TeamTable({ members, showAnalytics }: Props) {
  if (members.length === 0) {
    return <p className="py-4 px-4 text-center text-gray-500">Ничего не найдено</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 mb-6">
      {members.map((m, idx) => {
        const taskData = [
          { name: 'Новые', value: m.analytics.tasks_new || 0, fill: 'oklch(90.1% 0.076 70.697)' },
          { name: 'В процессе', value: m.analytics.tasks_in_progress || 0, fill: 'oklch(90.2% 0.063 306.703)' },
          { name: 'Завершено', value: m.analytics.tasks_done || 0, fill: 'oklch(92.5% 0.084 155.995)' },
        ];

        const totalTasks = m.analytics.total_tasks || 0;
        const completedTasks = m.analytics.tasks_done || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return (
          <div
            key={m.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <div className={`${getTagColor(idx)} border w-12 h-12 rounded-lg flex items-center justify-center mr-4`}>
                <span className='font-semibold'>{m.username.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-gray-800 dark:text-white">{m.username}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {m.role_display || '—'} | {m.project_position || '—'}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Email: {m.email}</p>

            {showAnalytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      <AlertCircle size={18} className="text-yellow-700 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Всего задач</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{m.analytics.total_tasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      <PlayCircle size={18} className="text-purple-700 mr-2" />
                      <div className="">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Всего подзадач</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{m.analytics.total_subtasks || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      <CheckCircle size={18} className="text-green-700 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Очки</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{m.analytics.points_sum || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      <AlertCircle size={18} className="text-red-700 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Сложные задачи</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{m.analytics.high_complexity_tasks || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Прогресс задач:</p>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}% завершено</p>
                </div>
                <div className="h-48">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Статус задач</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Рекомендация</p>
                  <p
                    className="font-medium"
                    style={{
                      color: m.analytics.recommendation && m.analytics.recommendation.includes('Рекомендуется') ? 'green' : 'red',
                    }}
                  >
                    {m.analytics.recommendation || 'Нет данных'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}