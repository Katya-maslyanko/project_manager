import React, { useEffect, useState } from "react";
import { Task } from "@/state/api";
import { useUpdateTaskMutation, useDeleteTaskMutation } from "@/state/api"; // Импортируем хуки для обновления и удаления задачи
import { Ellipsis, X } from "lucide-react";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  tags: { id: number; name: string }[]; // Добавьте список тегов, если он у вас есть
  users: { id: number; username: string; profile_image: string | null }[]; // Добавьте список пользователей
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, tags = [], users = [] }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Новая");
  const [points, setPoints] = useState(0);
  const [tag, setTag] = useState<number | null>(null); // Состояние для тега
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [updateTask] = useUpdateTaskMutation(); // Хук для обновления задачи
  const [deleteTask] = useDeleteTaskMutation(); // Хук для удаления задачи
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Состояние для выпадающего меню
  const [status, setStatus] = useState("Новая"); // Состояние для статуса
  const [startDate, setStartDate] = useState(""); // Состояние для даты начала
  const [dueDate, setDueDate] = useState(""); // Состояние для даты завершения

  // Заполняем состояние при получении задачи
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setPoints(task.points || 0);
      setTag(task.tag); // Устанавливаем ID тега
      setSelectedAssignees(task.assignees.map(assignee => assignee.id)); // Устанавливаем assignees
      setStatus(task.status); // Устанавливаем статус задачи
      setStartDate(task.start_date); // Устанавливаем дату начала
      setDueDate(task.due_date); // Устанавливаем дату завершения
    }
  }, [task]);

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      try {
        await updateTask({ 
          id: task.id, 
          title, 
          description, 
          priority, 
          points, 
          assignees: selectedAssignees, 
          tag, // Передаем ID тега
          status, // Добавляем статус в обновление
          start_date: startDate, // Добавляем дату начала
          due_date: dueDate // Добавляем дату завершения
        });
        onClose(); // Закрываем модальное окно после обновления
      } catch (error) {
        console.error("Ошибка при обновлении задачи:", error);
      }
    }
  };

  // Обработка удаления задачи
  const handleDeleteTask = async () => {
    if (task) {
      try {
        await deleteTask(task.id);
        onClose(); // Закрываем модальное окно после удаления
      } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
      }
    }
  };

  // Проверяем, открыто ли модальное окно
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <div className="flex items-center">
            <div className="">
              <button className="p-1 rounded cursor-pointer hover:bg-gray-200" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <Ellipsis className="h-5 w-5 text-gray-500" />
              </button>
              {/* Выпадающее меню для удаления задачи */}
              {isDropdownOpen && (
                <div className="absolute mt-2 mr-4 bg-white shadow-lg rounded-md">
                  <button 
                    className="block px-4 py-2 text-red-600 hover:bg-red-100 w-full text-left"
                    onClick={handleDeleteTask}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
            <button className="ml-2 p-1 rounded cursor-pointer hover:bg-gray-200" onClick={onClose}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="title">Title</label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="description">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32" // Устанавливаем фиксированную высоту
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Новая">Новая</option>
                  <option value="В процессе">В процессе</option>
                  <option value="Завершено">Завершено</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="start-date">Start Date</label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="due-date">Due Date</label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assignees</label>
                <div className="flex items-center mt-1">
                  <div className="flex -space-x-2">
                    {task?.assignees && task.assignees.length > 0 ? (
                      task.assignees.map(assignee => (
                        <img 
                          key={assignee.id} 
                          alt={assignee.username} 
                          className="w-8 h-8 rounded-full border-2 border-white" 
                          src={assignee.profile_image || "https://placehold.co/32x32"} 
                        />
                      ))
                    ) : (
                      <span className="text-gray-500">Нет назначенных исполнителей</span>
                    )}
                    <button className="ml-2 text-blue-500 hover:text-blue-700">
                      + Пригласить исполнителя
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <div className="flex items-center mt-1 space-x-4">
                  {["Высокий", "Средний", "Низкий"].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={option}
                        checked={priority === option}
                        onChange={() => setPriority(option)}
                        className="form-radio text-gray-600"
                      />
                      <span className="ml-2">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tag</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={tag || ""}
                  onChange={(e) => setTag(Number(e.target.value))}
                >
                  <option value="" disabled>Выберите тег</option>
                  {tags && tags.length > 0 ? (
                    tags.map((tagOption) => (
                      <option key={tagOption.id} value={tagOption.id}>
                        {tagOption.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Нет доступных тегов</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="points">Points</label>
                <input
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" className="mr-2 bg-gray-300 text-gray-700 py-2 px-4 rounded" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;