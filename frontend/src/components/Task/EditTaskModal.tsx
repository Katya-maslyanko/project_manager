import React, { useEffect, useState } from "react";
import { Task, useUpdateTaskMutation, useDeleteTaskMutation, useCreateCommentMutation, useGetCommentsByTaskIdQuery, useGetTagsQuery, useGetUsersQuery, useUpdateCommentMutation, useDeleteCommentMutation } from "@/state/api"; 
import { Ellipsis, X, Plus } from "lucide-react";
import DeleteConfirmationModal from "./modal/DeleteConfirmationModal"; 
import AddAssigneeModal from "./modal/AddAssigneeModal"; 
import CommentsSection from "./CommentSection"; 

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Новая");
  const [points, setPoints] = useState(0);
  const [tag, setTag] = useState<number | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const { data: comments = [], refetch: refetchComments } = useGetCommentsByTaskIdQuery(
    task ? { taskId: task.id } : null,
    { skip: !task }
  );
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isAddAssigneeModalOpen, setIsAddAssigneeModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setPoints(task.points || 0);
      setTag(task.tag ? task.tag.id : null);
      setSelectedAssignees(task.assignees.map(assignee => assignee.id));
      setStatus(task.status);
      setStartDate(task.start_date.split('T')[0]);
      setDueDate(task.due_date.split('T')[0]);
    }
  }, [task]);

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
          assignee_ids: selectedAssignees,
          tag_id: tag,
          status,
          start_date: startDate,
          due_date: dueDate,
        });
        onClose();
      } catch (error) {
        console.error("Ошибка при обновлении задачи:", error);
      }
    }
  };

  const handleDeleteTask = async () => {
    if (task) {
      try {
        await deleteTask(task.id);
        onClose(); 
      } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
      }
    }
  };

  const handleAddComment = async (content: string) => {
    if (content.trim()) {
      try {
        await createComment({
          taskId: task.id,
          content,
        });
        refetchComments();
      } catch (error) {
        console.error("Ошибка при добавлении комментария:", error);
      }
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      await updateComment({ id: commentId, content });
      refetchComments();
    } catch (error) {
      console.error("Ошибка при редактировании комментария:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      refetchComments();
    } catch (error) {
      console.error("Ошибка при удалении комментария:", error);
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

  const openDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(true);
    setIsAssigneeDropdownOpen(false);
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y: auto">
      <div className="w-[800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Редактировать задачу</h2>
          <div className="flex items-center">
            <div>
              <button className="p-1 rounded cursor-pointer hover:bg-gray-200" onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}>
                <Ellipsis className="h-5 w-5 text-gray-500" />
              </button>
              {isAssigneeDropdownOpen && (
                <div className="absolute mt-2 mr-4 bg-white shadow-lg rounded-md">
                  <button
                    className="block px-4 py-2 text-red-600 shadow-lg rounded-md hover:bg-red-100 w-full text-left"
                    onClick={openDeleteConfirmation}
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
              <div>
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
                    <span className="text-gray-500">Нет назначенных исполнителей</span>
                  )}
                  <button type="button" className="pl-4 flex items-center text-blue-500 hover:text-blue-700" onClick ={openAddAssigneeModal}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="start-date">Дата начала</label>
                  <input
                    className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
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
              Сохранить
            </button>
          </div>
        </form>

        <DeleteConfirmationModal 
          isOpen={isDeleteConfirmationOpen} 
          onClose={() => setIsDeleteConfirmationOpen(false)} 
          onDelete={handleDeleteTask} 
        />

        <AddAssigneeModal 
          isOpen={isAddAssigneeModalOpen} 
          onClose={closeAddAssigneeModal} 
          users={users} 
          selectedAssignees={selectedAssignees} 
          onAssigneeToggle={handleAssigneeToggle} 
        />

        <CommentsSection
          comments={comments}
          users={users}
          taskId={task.id}
          onAddComment={handleAddComment} 
          onEditComment={handleEditComment} 
          onDeleteComment={handleDeleteComment} 
        />
      </div>
    </div>
  );
};

export default EditTaskModal;