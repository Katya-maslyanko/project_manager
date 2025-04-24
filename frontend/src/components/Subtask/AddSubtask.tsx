import React, { useState } from "react";
import { X } from "lucide-react";
import { useCreateSubtaskMutation, useGetTagsQuery } from "@/state/api"; 
import { useAuth } from "@/context/AuthContext";

interface AddSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSubtaskModal: React.FC<AddSubtaskModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { data: tags = [] } = useGetTagsQuery();
  const [createSubtask] = useCreateSubtaskMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Новая");
  const [points, setPoints] = useState(0);
  const [tag, setTag] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const assignedTo = user ? [user.id] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubtask({
        title,
        description,
        priority,
        points,
        assigned_to: assignedTo,
        tag_id: tag,
        task_id: null,
        start_date: startDate || null,
        due_date: dueDate || null,
      });
      onClose();
    } catch (error) {
      console.error("Ошибка при добавлении подзадачи:", error);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTag(Number(e.target.value));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-[800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Добавить подзадачу</h2>
          <button className="ml-2 p-1 rounded cursor-pointer hover:bg-gray-200" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="title">Название</label>
                <input
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="description">Описание</label>
                <textarea
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2 h-[174px]"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="pt-1">
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <select
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  value="Новая"
                  disabled
                >
                  <option value="Новая">Новая</option>
                  <option value="В процессе">В процессе</option>
                  <option value="Завершено">Завершено</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="points">Очки</label>
                <input
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="tag">Тег</label>
                <select
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  id="tag"
                  value={tag ?? ""}
                  onChange={handleTagChange}
                >
                  <option value="" disabled>Выберите тег</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4 mt-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="start-date">Дата начала</label>
                  <input
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="due-date">Дата завершения</label>
                  <input
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" className="mr-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 py-2 px-4" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="mr-2 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white py-2 px-4">
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubtaskModal;