import React from "react";
import { User } from "@/state/api"; // Импортируйте тип User из вашего API
import { X} from "lucide-react";

interface AddAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  selectedAssignees: number[];
  onAssigneeToggle: (userId: number) => void;
}

const AddAssigneeModal: React.FC<AddAssigneeModalProps> = ({ isOpen, onClose, users, selectedAssignees, onAssigneeToggle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed pb-60 pl-96 inset-0 flex items-center justify-center bg-black bg-opacity-5 z-50">
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
                <button onClick={() => onAssigneeToggle(id)} className="ml-2"><X className="h-3 w-3 text-red-500" /></button>
              </div>
            ) : null;
          })}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Выберите исполнителей</label>
          <select
            className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
            onChange={(e) => onAssigneeToggle(Number(e.target.value))}
          >
            <option value="" disabled>Выберите исполнителя</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AddAssigneeModal;