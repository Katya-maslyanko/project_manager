import React, { useEffect, useState } from "react";
import { Task, useUpdateTaskMutation, useDeleteTaskMutation, useCreateCommentMutation, useGetCommentsByTaskIdQuery, useGetTagsQuery, useGetUsersQuery } from "@/state/api"; // Импортируем хуки для работы с задачами
import { Ellipsis, X, Plus } from "lucide-react"; // Импортируем иконки

interface EditTaskModalProps {
  isOpen: boolean; // Открыто ли модальное окно
  onClose: () => void; // Функция для закрытия модального окна
  task: Task | null; // Задача, которую нужно редактировать
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { data: tags = [] } = useGetTagsQuery(); // Получаем теги
  const { data: users = [] } = useGetUsersQuery(); // Получаем пользователей
  const [title, setTitle] = useState(""); // Состояние для названия задачи
  const [description, setDescription] = useState(""); // Состояние для описания задачи
  const [priority, setPriority] = useState("Новая"); // Состояние для приоритета
  const [points, setPoints] = useState(0); // Состояние для очков
  const [tag, setTag] = useState<number | null>(null); // Состояние для тега
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]); // Состояние для выбранных исполнителей
  const [updateTask] = useUpdateTaskMutation(); // Хук для обновления задачи
  const [deleteTask] = useDeleteTaskMutation(); // Хук для удаления задачи
  const [createComment] = useCreateCommentMutation(); // Хук для создания комментария
  const { data: comments, refetch: refetchComments } = useGetCommentsByTaskIdQuery(task?.id || 0, { skip: !task }); // Получаем комментарии к задаче
  const [newComment, setNewComment] = useState(""); // Состояние для нового комментария
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Состояние для управления выпадающим меню
  const [status, setStatus] = useState(""); // Состояние для статуса задачи
  const [startDate, setStartDate] = useState(""); // Состояние для даты начала
  const [dueDate, setDueDate] = useState(""); // Состояние для даты завершения

  // Заполняем состояние при получении задачи
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setPoints(task.points || 0);
      setTag(task.tag ? task.tag.id : null); // Устанавливаем ID тега
      setSelectedAssignees(task.assignees.map(assignee => assignee.id)); // Устанавливаем assignees
      setStatus(task.status); // Устанавливаем статус задачи
      setStartDate(task.start_date.split('T')[0]); // Устанавливаем дату начала
      setDueDate(task.due_date.split('T')[0]); // Устанавливаем дату завершения
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
          assignee_ids: selectedAssignees, // Передаем массив ID исполнителей
          tag_id: tag, // Передаем ID тега
          status,
          start_date: startDate,
          due_date: dueDate,
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

  // Обработка добавления комментария
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task && newComment.trim()) {
      try {
        await createComment({
          taskId: task.id,
          content: newComment,
        });
        setNewComment(""); // Очищаем поле ввода комментария
        refetchComments(); // Обновляем список комментариев
      } catch (error) {
        console.error("Ошибка при добавлении комментария:", error);
      }
    }
  };

  // Обработчик изменения тега
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTag(Number(e.target.value));
  };

  // Обработчик изменения исполнителей
  const handleAssigneeToggle = (userId: number) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Проверяем, открыто ли модальное окно
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-[800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Редактировать задачу</h2>
          <div className="flex items-center">
            <div>
              <button className="p-1 rounded cursor-pointer hover:bg-gray-200" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <Ellipsis className="h-5 w-5 text-gray-500" />
              </button>
              {isDropdownOpen && (
                <div className="absolute mt-2 mr-4 bg-white shadow-lg rounded-md">
                  <button
                    className="block px-4 py-2 text-red-600 shadow-lg rounded-md hover:bg-red-100 w-full text-left"
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
                <div className="flex flex-col mt-1">
                  <div className="flex flex-wrap border border-gray-200 rounded-md shadow-sm p-2">
                    {selectedAssignees.map(id => {
                      const user = users.find(u => u.id === id);
                      return user ? (
                        <div key={id} className="flex items-center mr-2 mb-2">
                          <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-1">
                            {user.username ? user.username.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                          <span>{user.username}</span>
                          <button onClick={() => handleAssigneeToggle(id)} className="ml-2 text-red-500">×</button>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="mt-2 bg-blue-500 text-white py-1 px-4 rounded">
                    Добавить исполнителей
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleAssigneeToggle(user.id)}>
                          <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                            {user.username ? user.username.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                          <span>{user.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
            <button type="button" className="mr-2 bg-gray-300 text-gray-700 py-2 px-4 rounded" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              Сохранить
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Комментарии</h3>
          <form onSubmit={handleAddComment} className="space-y-4">
            <textarea
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий"
            />
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              Добавить комментарий
            </button>
          </form>
          <div className="mt-4 space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border border-gray-300 rounded-md p-4">
                  <div className="flex items-center mb-2">
                    {comment.user.profile_image ? (
                      <img
                        className="w-8 h-8 rounded-full mr-2"
                        src={comment.user.profile_image}
                        alt={comment.user.username}
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        {comment.user.username[0]}
                      </span>
                    )}
                    <span className="font-semibold">{comment.user.username}</span>
                  </div>
                  <p>{comment.content}</p>
                  <span className="text-gray-500 text-sm">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Нет комментариев</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;