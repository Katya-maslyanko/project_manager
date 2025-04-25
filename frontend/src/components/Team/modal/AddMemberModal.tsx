'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useGetUsersQuery } from '@/state/api';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMembers: (selectedMemberIds: number[]) => void;
  teamId: number;
  currentMembers?: number[];
  onSuccess?: () => void;
  initialSelectedMembers?: number[];
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSelectMembers,
  teamId,
  currentMembers = [],
  onSuccess,
  initialSelectedMembers = [],
}) => {
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>(initialSelectedMembers);

  const availableMembers = users.filter(
    user => user.role === 'team_member' && !currentMembers.includes(user.id)
  );

  const filteredMembers = availableMembers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleMember = (userId: number) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectMembers(selectedMemberIds);
    onClose();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="w-[400px] mx-auto bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Добавить участников</h3>
          <button className="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-2 mb-4 dark:bg-gray-700">
          {selectedMemberIds.length > 0 ? (
            selectedMemberIds.map(id => {
              const user = users.find(u => u.id === id);
              return user ? (
                <div key={id} className="flex items-center mr-2 mb-2 bg-gray-100 dark:bg-gray-600 rounded-full px-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center mr-2">
                    <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-800 dark:text-white">{user.username}</span>
                  <button onClick={() => handleToggleMember(id)} className="ml-2">
                    <X className="h-3 w-3 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              ) : null;
            })
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">Нет выбранных участников</span>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Выберите участников</label>
          <input
            type="text"
            placeholder="Поиск участников..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full border border-gray-200 dark:border-gray-700 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:text-white"
          />
          <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md mt-1 dark:bg-gray-700">
            {isLoading ? (
              <div className="p-2 text-center text-gray-500 dark:text-gray-400">Загрузка...</div>
            ) : error ? (
              <div className="p-2 text-center text-red-500 dark:text-red-400">Ошибка: {JSON.stringify(error)}</div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                    selectedMemberIds.includes(user.id) ? 'bg-gray-200 dark:bg-gray-600' : ''
                  }`}
                  onClick={() => handleToggleMember(user.id)}
                >
                  <span className="text-gray-800 dark:text-white">{user.username}</span>
                  {selectedMemberIds.includes(user.id) && (
                    <Check className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 dark:text-gray-400">Нет доступных участников</div>
            )}
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
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white rounded-lg py-2 px-4 disabled:bg-blue-300 dark:disabled:bg-blue-800"
            disabled={selectedMemberIds.length === 0}
          >
            Выбрать ({selectedMemberIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;