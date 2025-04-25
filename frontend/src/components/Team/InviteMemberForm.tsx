'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useInviteMemberMutation } from '@/state/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number; // ID команды, в которую приглашается участник
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, teamId }) => {
  const [email, setEmail] = useState('');
  const [inviteMember, { isLoading, error }] = useInviteMemberMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember({ teamId, email }).unwrap();
      setEmail('');
      onClose();
    } catch (err) {
      console.error('Ошибка при отправке приглашения:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Добавить участника</h2>
          <button className="p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email участника</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border dark:border-gray-700 rounded px-3 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">Ошибка при отправке приглашения: {JSON.stringify(error)}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded px-4 py-2 hover:bg-green-200 dark:hover:bg-green-800"
              disabled={isLoading}
            >
              {isLoading ? 'Отправка...' : 'Пригласить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;