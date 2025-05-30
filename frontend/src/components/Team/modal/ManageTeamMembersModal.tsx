'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useUpdateTeamMutation } from '@/state/api';
import AddMemberModal from './AddMemberModal';

interface ManageTeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  currentMembers: number[];
  currentMembersInfo: Array<{ id: number; username: string; email: string }>;
  onSuccess?: () => void;
}

const ManageTeamMembersModal: React.FC<ManageTeamMembersModalProps> = ({
  isOpen,
  onClose,
  teamId,
  currentMembers,
  currentMembersInfo,
  onSuccess,
}) => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [members, setMembers] = useState<number[]>(currentMembers);
  const [updateTeam, { isLoading, error }] = useUpdateTeamMutation();

  // Синхронизация состояния members с currentMembers
  useEffect(() => {
    setMembers(currentMembers);
  }, [currentMembers]);

  const handleRemoveMember = async (userId: number) => {
    const updatedMembers = members.filter(id => id !== userId);
    try {
      await updateTeam({ id: teamId, members: updatedMembers }).unwrap();
      setMembers(updatedMembers);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Ошибка при удалении участника:', err);
      // Можно добавить уведомление для пользователя о неудаче
    }
  };

  const handleSelectMembers = async (selectedMemberIds: number[]) => {
    const updatedMembers = [...members, ...selectedMemberIds];
    try {
      await updateTeam({ id: teamId, members: updatedMembers }).unwrap();
      setMembers(updatedMembers);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Ошибка при добавлении участников:', err);
      // Можно добавить уведомление для пользователя о неудаче
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50 overflow-y-auto">
      <div className="w-[500px] mx-auto bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Управление участниками команды</h3>
          <button className="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Текущие участники</h4>
            <button
              className="flex items-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Добавить участника
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2 dark:bg-gray-700">
            {currentMembersInfo.length > 0 ? (
              currentMembersInfo.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600 rounded-md mb-2"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center mr-3">
                      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800 dark:text-white">{member.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Нет участников в команде</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mb-4">Ошибка: {JSON.stringify(error)}</p>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="mr-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-4"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSelectMembers={handleSelectMembers}
        teamId={teamId}
        currentMembers={members}
        onSuccess={onSuccess}
        initialSelectedMembers={[]}
      />
    </div>
  );
};

export default ManageTeamMembersModal;