import React, { useState, useEffect } from "react";
import { Task, useCreateTaskMutation, useGetTagsQuery, useGetUsersQuery, useGetProjectByIdQuery } from "@/state/api"; 
import { X, Plus } from "lucide-react";
import AddAssigneeModal from "./modal/AddAssigneeModal";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  currentStatus: string;
  refetchTasks: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, projectId, currentStatus, refetchTasks }) => {
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: project, isLoading: projectLoading, error: projectError } = useGetProjectByIdQuery(projectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Новая");
  const [points, setPoints] = useState(0);
  const [tag, setTag] = useState<number | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState(currentStatus);
  const [createTask, { isLoading, error }] = useCreateTaskMutation();
  const [isAddAssigneeModalOpen, setIsAddAssigneeModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const projectMembers = project?.members_info || [];

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    if (error && 'data' in error) {
      const errorData = error.data as any;
      if (errorData && typeof errorData === 'object') {
        if (errorData.start_date) {
          setErrorMessage(errorData.start_date[0] || "Ошибка с датой начала");
        } else if (errorData.due_date) {
          setErrorMessage(errorData.due_date[0] || "Ошибка с датой завершения");
        } else {
          setErrorMessage("Произошла ошибка при создании задачи");
        }
      } else {
        setErrorMessage("Произошла ошибка при создании задачи");
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Сбрасываем сообщение об ошибке перед отправкой
    try {
      await createTask({
        title,
        description,
        priority,
        points,
        assignee_ids: selectedAssignees,
        tag_id: tag,
        status,
        start_date: startDate,
        due_date: dueDate,
        project: projectId,
      }).unwrap();
      refetchTasks();
      onClose();
    } catch (err) {
      console.error("Ошибка при добавлении задачи:", err);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTag(Number(e.target.value));
  };

  const handleAssigneeToggle = (userId: number) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const openAddAssigneeModal = () => {
    setIsAddAssigneeModalOpen(true);
  };

  const closeAddAssigneeModal = () => {
    setIsAddAssigneeModalOpen(false);
  };

  if (!isOpen) return null;

  if (projectLoading) return <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">Загрузка данных проекта...</div>;
  if (projectError) return <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">Ошибка загрузки данных проекта: {JSON.stringify(projectError)}</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="w-[800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Добавить задачу</h2>
          <button className="ml-2 p-1 rounded cursor-pointer hover:bg-gray-200" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

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
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2 h-[154px]"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="pt-1">
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <select
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Новая">Новая</option>
                  <option value="В процессе">В процессе</option>
                  <option value="Завершено">Завершено</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="">
                <label className="block text-sm font-medium text-gray-700">Исполнители</label>
                <div className="flex -space-x-2 mt-1">
                  {selectedAssignees.length > 0 ? (
                    selectedAssignees.map((id) => {
                      const assignee = users.find(user => user.id === id);
                      return assignee ? (
                        <div key={assignee.id} className="flex items-center">
                          {assignee.profile_image ? (
                            <img 
                              alt={assignee.username} 
                              className="w-10 h-10 rounded-full border-2 border-white" 
                              src={assignee.profile_image} 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                              <span className="text-gray-700">
                                {assignee.username ? assignee.username.split(' ').map(n => n[0]).join('') : '?'}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-500 mt-3 mb-2">Нет назначенных исполнителей</span>
                  )}
                  <button type="button" className="pl-4 flex items-center text-blue-500 hover:text-blue-700" onClick={openAddAssigneeModal}>
                    <Plus className="h-5 w-5" /> Добавить исполнителя
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Приоритет</label>
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
                <label className="block text-sm font-medium text-gray-700">Тэг</label>
                <select
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  value={tag || ""}
                  onChange={handleTagChange}
                >
                  <option value="" disabled>Выберите тег</option>
                  {tags.length > 0 ? (
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
                <label className="block text-sm font-medium text-gray-700" htmlFor="points">Очки</label>
                <input
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
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
                    min={project?.startDate?.split("T")[0] || ""}
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
                    max={project?.endDate?.split("T")[0] || ""}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" className="mr-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 py-2 px-4" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="mr-2 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white py-2 px-4" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить"}
            </button>
          </div>
        </form>

        <AddAssigneeModal 
          isOpen={isAddAssigneeModalOpen} 
          onClose={closeAddAssigneeModal} 
          users={users} 
          selectedAssignees={selectedAssignees} 
          onAssigneeToggle={handleAssigneeToggle} 
          projectMembers={projectMembers}
        />
      </div>
    </div>
  );
};

export default AddTaskModal;