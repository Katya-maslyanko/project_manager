'use client';

import React, { useState } from 'react';
import { useCreateProjectMutation, useGetMyTeamsQuery } from '@/state/api';
import { X, Plus, Check } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const CreateProjectModal: React.FC = () => {
  const { isOpen, closeModal } = useModal();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: teams = [], isLoading: loadingTeams } = useGetMyTeamsQuery(undefined);
  const [createProject, { isLoading: creatingProject }] = useCreateProjectMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const primaryTeamId = selectedTeamIds.length > 0 ? selectedTeamIds[0] : null;
      const result = await createProject({
        name,
        description,
        startDate,
        endDate,
        team_id: primaryTeamId,
      }).unwrap();

      if (selectedTeamIds.length > 1) {
        const projectId = result.id;
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/add-teams/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1]}`,
          },
          body: JSON.stringify({ team_ids: selectedTeamIds }),
        });
      }

      closeModal();
    } catch (err) {
      setError('Ошибка при создании проекта. Пожалуйста, попробуйте еще раз.');
      console.error('Ошибка при создании проекта:', err);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTeam = (teamId: number) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-[600px] mx-auto bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Создать проект</h2>
          <button
            className="ml-2 p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={closeModal}
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        {error && <div className="mb-4 text-red-500 dark:text-red-400">{error}</div>}
        {loadingTeams ? (
          <div className="text-gray-600 dark:text-gray-400">Загрузка команд...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Название</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 h-24 dark:bg-gray-700 dark:text-white"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Дата начала</label>
                <input
                  type="date"
                  value={startDate || ''}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Дата окончания</label>
                <input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Команды</label>
              <div className="relative">
                <button
                  type="button"
                  className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 text-left dark:bg-gray-700 dark:text-white"
                  onClick={() => setIsTeamModalOpen(true)}
                >
                  {selectedTeamIds.length > 0
                    ? `${selectedTeamIds.length} команд(ы) выбрано`
                    : 'Выберите команды'}
                </button>
                {isTeamModalOpen && (
                  <div className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 mt-2 w-full max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Поиск команды..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2 block w-full border border-gray-200 dark:border-gray-700 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="max-h-40 overflow-y-auto">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map(team => (
                          <div
                            key={team.id}
                            className={`flex items-center mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md ${
                              selectedTeamIds.includes(team.id) ? 'bg-gray-200 dark:bg-gray-600' : ''
                            }`}
                            onClick={() => toggleTeam(team.id)}
                          >
                            <span className="text-gray-800 dark:text-white">{team.name}</span>
                            {selectedTeamIds.includes(team.id) && (
                              <Check className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">Нет доступных команд</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4"
                      onClick={() => setIsTeamModalOpen(false)}
                    >
                      Закрыть
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="mr-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4"
                onClick={closeModal}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800 hover:text-white py-2 px-4"
                disabled={creatingProject}
              >
                {creatingProject ? 'Создание...' : 'Создать проект'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;