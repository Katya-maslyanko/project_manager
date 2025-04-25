'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useCreateTeamMutation, useGetUsersQuery } from '@/state/api';
import { useAuth } from '@/context/AuthContext';
import AddMemberModal from './modal/AddMemberModal';

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (teamData: { name: string; description: string; members: number[]; project_manager: number | null }) => Promise<void>;
}

const AddTeamModal: React.FC<AddTeamModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [createTeam] = useCreateTeamMutation();
  const { data: users = [] } = useGetUsersQuery();
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const handleOpenMemberModal = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleSelectMembers = (memberIds: number[]) => {
    setSelectedMemberIds(memberIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teamData = {
        name: teamName,
        description: teamDescription,
        members: selectedMemberIds,
        project_manager: user?.id || null,
      };
      if (onCreate) {
        await onCreate(teamData);
      } else {
        await createTeam(teamData);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при добавлении команды:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="w-[600px] mx-auto bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Добавить команду</h2>
          <button className="ml-2 p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="teamName">Название команды</label>
                <input
                  className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white"
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="teamDescription">Описание</label>
                <textarea
                  className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-2 h-[154px] dark:bg-gray-700 dark:text-white"
                  id="teamDescription"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Участники</label>
                <div className="flex -space-x-2 mt-1 dark:border-gray-700 p-2 cursor-pointer dark:bg-gray-700" onClick={handleOpenMemberModal}>
                  {selectedMemberIds.length > 0 ? (
                    selectedMemberIds.map(id => {
                      const user = users.find(u => u.id === id);
                      return user ? (
                        <div key={user.id} className="flex items-center">
                          {user.profile_image ? (
                            <img
                              alt={user.username}
                              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"
                              src={user.profile_image}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
                              <span className="text-gray-700 dark:text-gray-300">
                                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 mt-3 mb-2">Нет участников</span>
                  )}
                  <button type="button" className="pl-4 flex items-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" onClick={handleOpenMemberModal}>
                    <Plus className="h-5 w-5" /> Добавить участника
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="mr-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4"
              onClick={onClose}
            >
              Отмена
            </button>
            <button type="submit" className="bg-blue-100 text-blue-700 rounded-lg py-2 px-4 dark:bg-blue-600 dark:hover:bg-blue-700">
              Создать
            </button>
          </div>
        </form>
      </div>

      <AddMemberModal
              isOpen={isAddMemberModalOpen}
              onClose={() => setIsAddMemberModalOpen(false)}
              onSelectMembers={handleSelectMembers}
              initialSelectedMembers={selectedMemberIds} teamId={0}      />
    </div>
  );
};

export default AddTeamModal;