import React, { useState } from "react";
import { User } from "@/state/api";
import { X, Check } from "lucide-react";

interface SubtaskAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[]; // Ensure this is always an array
  selectedAssignees: number[]; // Ensure this is always an array
  assignedTo: number[]; // Changed to an array
  onAssigneeToggle: (userId: number) => void;
}

const SubtaskAssigneeModal: React.FC<SubtaskAssigneeModalProps> = ({
  isOpen,
  onClose,
  users = [], // Default to an empty array
  selectedAssignees = [], // Default to an empty array
  assignedTo = [], // Default to an empty array
  onAssigneeToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredUsers = users
  .filter((user) => assignedTo.includes(user.id))
  .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOpen ? 'bg-black bg-opacity-5' : ''} z-50`}>
      <div className="w-[400px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Назначить исполнителей</h3>
          <button className="p-1 rounded cursor-pointer hover:bg-gray-200" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Отображаем выбранных исполнителей */}
        <div className="flex flex-wrap border border-gray-200 rounded-md shadow-sm p-2 mb-4">
          {selectedAssignees.map((id) => {
            const user = users.find((u) => u.id === id);
            return user ? (
              <div key={id} className="flex items-center mr-2 mb-2 bg-gray-100 px-2 py-1 rounded-md">
                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                  {user.username.charAt(0)}
                </span>
                <span className="text-sm">{user.username}</span>
                <button className="ml-2 text-red-500" onClick={() => onAssigneeToggle(id)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null;
          })}
        </div>

        {/* Поле поиска */}
        <input
          type="text"
          placeholder="Поиск исполнителей..."
          className="border border-gray-300 rounded-md p-2 mb-4 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Список пользователей */}
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md mt-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 ${selectedAssignees.includes(user.id) ? 'bg-gray-200' : ''}`}
                onClick={() => onAssigneeToggle(user.id)}
              >
                <span className="text-sm">{user.username}</span>
                <span className="text-xs text-gray-500">
                  {selectedAssignees.includes(user.id) ? <Check className="h-4 w-4 text-green-500" /> : null}
                </span>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">Нет исполнителей для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtaskAssigneeModal;