import React from 'react';

interface Member {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  analytics: {
    total_tasks: number;
    tasks_new: number;
    tasks_in_progress: number;
    tasks_done: number;
    total_subtasks: number;
  };
}

interface ProjectTeamMemberProps {
  members: Member[];
}

const tagColors = [
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

const ProjectTeamMember: React.FC<ProjectTeamMemberProps> = ({ members }) => {
  return (
    <div className="space-y-6">
      {members.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
            Участники проекта
          </h2>
          <div className="overflow-x-auto sm:rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                  <th className="py-2 px-4">Иконка</th>
                  <th className="py-2 px-4">Имя</th>
                  <th className="py-2 px-4">Задачи</th>
                  <th className="py-2 px-4">Подзадачи</th>
                  <th className="py-2 px-4">Прогресс</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 dark:text-gray-300">
                {members.map((member, memberIndex) => {
                  const totalTasks = member.analytics.total_tasks;
                  const tasksDone = member.analytics.tasks_done;
                  const progress = totalTasks > 0 ? (tasksDone / totalTasks) * 100 : 0;
                  const colorClass = getTagColor(memberIndex);

                  return (
                    <tr key={member.id} className="border-t dark:border-gray-700">
                      <td className="py-2 px-4">
                        <div className={`${colorClass} border w-10 h-10 rounded-full flex items-center justify-center`}>
                          <span>{member.username.charAt(0)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="py-2 px-4">{totalTasks}</td>
                      <td className="py-2 px-4">{member.analytics.total_subtasks}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          <div className="w-[150px] bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{progress.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">Участники проекта не добавлены</p>
      )}
    </div>
  );
};

export default ProjectTeamMember;