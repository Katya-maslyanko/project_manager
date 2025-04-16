import React, {useState} from "react";
import { User } from "@/state/api";
import { X, Check } from "lucide-react";

interface AddAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  selectedAssignees: number[];
  onAssigneeToggle: (userId: number) => void;
}

const AddAssigneeModal: React.FC<AddAssigneeModalProps> = ({
  isOpen,
  onClose,
  users,
  selectedAssignees,
  onAssigneeToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOpen ? 'bg-black bg-opacity-5' : ''} z-50`}>
      <div className="w-[400px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Добавить исполнителей</h3>
          <button className="p-1 rounded cursor-pointer hover:bg-gray-200" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex flex-wrap border border-gray-200 rounded-md shadow-sm p-2 mb-4">
          {selectedAssignees.map(id => {
            const user = users.find(u => u.id === id);
            return user ? (
              <div key={id} className="flex items-center mr-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                  {user.username ? user.username.split(' ').map(n => n[0]).join('') : '?'}
                </span>
                <span>{user.username}</span>
                <button onClick={() => onAssigneeToggle(id)} className="ml-2">
                  <X className="h-3 w-3 text-red-500" />
                </button>
              </div>
            ) : null;
          })}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Выберите исполнителей</label>
          <input
            type="text"
            placeholder="Поиск исполнителей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
          />
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md mt-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedAssignees.includes(user.id) ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => onAssigneeToggle(user.id)}
                >
                  <span>{user.username}</span>
                  {selectedAssignees.includes(user.id) && (
                    <Check className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-2">Нет доступных исполнителей</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAssigneeModal;