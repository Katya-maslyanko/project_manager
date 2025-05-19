"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Ellipsis,
  X,
  Flag,
  Calendar,
  Users,
  Tag,
  TrendingUp,
  Plus,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import {
  Task,
  useGetTagsQuery,
  useGetUsersQuery,
  useUpdateTaskMutation,
  useGetSubtasksByTaskIdQuery,
  useGetProjectByIdQuery,
  Subtask,
} from "@/state/api";
import AddAssigneeModal from "./modal/AddAssigneeModal";
import DeleteConfirmationModal from "./modal/DeleteConfirmationModal";
import CommentsSection from "./CommentSection";
import SubtaskList from "../Subtask/SubtaskList";

const formatDate = (dateString: string) => {
  const options = { day: "numeric", month: "long", year: "numeric" } as const;
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

interface TaskSidebarProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (completed: boolean) => void;
  onDelete: () => void;
  onEdit?: (updatedTask: Partial<Task>) => void;
  onOpenSubtask: (subtaskId: number) => void;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({
  task,
  onClose,
  onComplete,
  onDelete,
  onEdit,
  onOpenSubtask,
}) => {
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [updateTask] = useUpdateTaskMutation();
  const { data: subtasks = [] } = useGetSubtasksByTaskIdQuery(task?.id || 0);
  const { data: project } = useGetProjectByIdQuery(task?.project || 0, { skip: !task });
  const projectMembers = project?.members_info || [];

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingTag, setEditingTag] = useState(false);
  const [editingPoints, setEditingPoints] = useState(false);

  const [titleValue, setTitleValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priorityValue, setPriorityValue] = useState("");
  const [tagValue, setTagValue] = useState<number | null>(null);
  const [pointsValue, setPointsValue] = useState(0);
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);

  const [isCompleted, setIsCompleted] = useState(task?.status === "Завершено");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAssigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (task) {
      setTitleValue(task.title);
      setDescriptionValue(task.description || "");
      setPriorityValue(task.priority);
      setTagValue(task.tag ? task.tag.id : null);
      setStartDate(task.start_date.split("T")[0]);
      setDueDate(task.due_date.split("T")[0]);
      setPointsValue(task.points || 0);
      setSelectedAssignees(task.assignees.map((a) => a.id));
      setIsCompleted(task.status === "Завершено");

      const dueDateObj = new Date(task.due_date);
      const currentDate = new Date();
      setIsOverdue(currentDate > dueDateObj && task.status !== "Завершено");
    }
  }, [task]);

  const handleUpdate = async (fields: Partial<Task>) => {
    if (task) {
      try {
        await updateTask({ id: task.id, ...fields });
        onEdit && onEdit(fields);
      } catch (error) {
        console.error("Ошибка обновления:", error);
      }
    }
  };

  const handleCompleteClick = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    handleUpdate({ status: newStatus ? "Завершено" : "В процессе" });
    onComplete(newStatus);
  };

  const commonInputStyle =
    "w-full px-1 py-1 border rounded-md focus:outline-none focus:border-gray-200 transition-colors";
  const commonSelectStyle =
    "px-1 py-1 border rounded-md focus:outline-none focus:border-gray-200 transition-colors";

  const renderTagDisplay = () => {
    if (task?.tag) {
      return (
        <span className={`flex items-center rounded-md px-2 py-1 text-xs ${getTagColor(task.tag.id)}`}>
          {task.tag.name}
        </span>
      );
    }
    return (
      <span className="mr-1 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs">
        Нет тега
      </span>
    );
  };

  const StarRating = ({ stars }: { stars: number }) => {
    const safeStars = Math.min(Math.max(stars || 0, 0), 5); // Ограничиваем значение от 0 до 5
  
    return (
      <span className="text-lg">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`
              ${index < safeStars ? 'text-yellow-500' : 'text-gray-300'}
              font-[Arial]
            `}
          >
            {index < safeStars ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  const tagColors = [
    "bg-red-100 text-red-600",
    "bg-yellow-100 text-yellow-600",
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
  ];
  const getTagColor = (index: number) => tagColors[index % tagColors.length];

  const handleAssigneeToggle = (userId: number) => {
    let newAssignees: number[] = [];
    if (selectedAssignees.includes(userId)) {
      newAssignees = selectedAssignees.filter((id) => id !== userId);
    } else {
      newAssignees = [...selectedAssignees, userId];
    }
    setSelectedAssignees(newAssignees);
    handleUpdate({ assignee_ids: newAssignees });
  };

  const openAssigneeModal = () => setAssigneeModalOpen(true);
  const closeAssigneeModal = () => setAssigneeModalOpen(false);
  const openDeleteConfirmation = () => {
    setDeleteConfirmationOpen(true);
    setDropdownOpen(false);
  };

  if (!task) return null; 

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-lg z-40 flex flex-col p-4 overflow-y-auto dark:bg-dark-bg dark:border-gray-800 dark:text-white">
      <div >
      {/* Верхняя панель с кнопками выполнения, удаления, закрытия */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
      <button
        onClick={handleCompleteClick}
        className={`group flex items-center gap-2 py-3 px-4 rounded-lg transition-colors border ${
            isCompleted
            ? "border-green-200 bg-green-200 text-green-700 cursor-default"
            : "border-gray-200 dark:border-gray-800 dark:text-white text-gray-600 hover:bg-gray-200"
        }`}
        disabled={isCompleted}
        >
        <label className="flex items-center cursor-pointer relative">
            <input
            type="checkbox"
            className={`peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-400 ${
                isCompleted
                ? "checked:bg-green-600 checked:border-green-600"
                : "checked:bg-gray-600 checked:border-gray-600"
            }`}
            checked={isCompleted}
            readOnly
            />
            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            </span>
        </label>
        {isCompleted ? "Завершено" : "Выполнить"}
      </button>

        <div className="flex items-center relative">
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Ellipsis className="h-5 w-5 text-gray-500" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-10 mt-2 bg-white shadow-lg rounded-md z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  openDeleteConfirmation();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Удалить
              </button>
            </div>
          )}
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="space-y-4 h-full">
        <div>
          {editingTitle ? (
            <input
              type="text"
              className={commonInputStyle + " text-xl w-full font-bold"}
              value={titleValue}
              autoFocus
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTitleValue(e.target.value)
              }
              onBlur={() => {
                setEditingTitle(false);
                if (titleValue !== task.title) {
                  handleUpdate({ title: titleValue });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  if (titleValue !== task.title) {
                    handleUpdate({ title: titleValue });
                  }
                }
              }}
            />
          ) : (
            <h2
              className="text-xl font-bold cursor-pointer transition-colors"
              onClick={() => setEditingTitle(true)}
            >
              {titleValue}
            </h2>
          )}
        </div>

        <div>
          {editingDescription ? (
            <textarea
              className={commonInputStyle + "w-full resize-none"}
              value={descriptionValue}
              autoFocus
              rows={3}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescriptionValue(e.target.value)
              }
              onBlur={() => {
                setEditingDescription(false);
                if (descriptionValue !== task.description) {
                  handleUpdate({ description: descriptionValue });
                }
              }}
            />
          ) : (
            <p
              className="text-sm text-gray-600 cursor-pointer transition-colors"
              onClick={() => setEditingDescription(true)}
            >
              {descriptionValue || "Нажмите, чтобы добавить описание"}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Users className="h-5 w-5" />
            <span>Исполнители:</span>
          </div>
          <div
            className="flex -space-x-3 cursor-pointer"
            onClick={openAssigneeModal}
          >
            {selectedAssignees.length > 0 ? (
              selectedAssignees.map((id, idx) => {
                const user = users.find((u) => u.id === id);
                return user ? (
                  <div key={user.id} className={`relative`}>
                    <div className={`w-10 h-10 border-2 border-gray-100 rounded-full flex items-center justify-center overflow-hidden ${getTagColor(idx)}`}>
                      {user.profile_image ? (
                        <img className="w-10 h-10 rounded-full" src={user.profile_image} alt={user.username} />
                      ) : (
                        <span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-gray-500 text-sm">Нет исполнителей</span>
            )}
            <button className="pl-3 text-gray-500 hover:text-blue-600">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Calendar className="h-5 w-5" />
            <span>Срок выполнения:</span>
          </div>
          {editingDates ? (
            <div className="flex space-x-2 items-center">
              <input
                type="date"
                className={commonInputStyle + " w-40"}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={project?.startDate?.split("T")[0] || ""}
                onBlur={() => {
                  if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
                      alert("Дата завершения не может быть раньше даты начала");
                      setDueDate(startDate);
                  }
                  handleUpdate({
                      start_date: startDate,
                      due_date: dueDate,
                  });
                  setEditingDates(false);
              }}
              />
              <input
                  type="date"
                  className={commonInputStyle + " w-40"}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={startDate || project?.startDate?.split("T")[0] || ""}
                  max={project?.endDate?.split("T")[0] || ""}
                  onBlur={() => {
                      if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
                          alert("Дата завершения не может быть раньше даты начала");
                          setDueDate(startDate);
                      }
                      handleUpdate({
                          start_date: startDate,
                          due_date: dueDate,
                      });
                      setEditingDates(false);
                  }}
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm cursor-pointer hover:text-blue-600 transition-colors ${
                  isOverdue ? "text-red-400 font-semibold" : "text-gray-600"
                }`}
                onClick={() => setEditingDates(true)}
              >
                {formatDate(startDate)} – {formatDate(dueDate)}
              </span>
              {isOverdue && (
                <span className="flex items-center text-red-400 text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Приоритет */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Flag className="h-5 w-5" />
            <span>Приоритет:</span>
          </div>
          {editingPriority ? (
            <select
              className={commonSelectStyle + "w-[150px] ml-2"}
              value={priorityValue}
              autoFocus
              onChange={(e) => setPriorityValue(e.target.value)}
              onBlur={() => {
                setEditingPriority(false);
                handleUpdate({ priority: priorityValue });
              }}
            >
              <option value="Высокий">Высокий</option>
              <option value="Средний">Средний</option>
              <option value="Низкий">Низкий</option>
            </select>
          ) : (
            <div
              className={`flex items-center border rounded-md px-2 py-1 gap-1 text-xs font-semibold cursor-pointer transition-colors ${
                priorityValue === "Высокий"
                  ? "border-red-200 text-red-600"
                  : priorityValue === "Средний"
                  ? "border-yellow-200 text-yellow-600"
                  : "border-green-200 text-green-600"
              }`}
              onClick={() => setEditingPriority(true)}
            >
              <Flag className="h-5 w-5" />
              <span>{priorityValue}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Tag className="h-5 w-5" />
            <span>Тэг:</span>
          </div>
          {editingTag ? (
            <select
              className={commonSelectStyle + " w-[150px] ml-2"}
              value={tagValue || ""}
              autoFocus
              onChange={(e) => {
                const newTag = e.target.value ? Number(e.target.value) : null;
                setTagValue(newTag);
                handleUpdate({ tag_id: newTag });
              }}
              onBlur={() => setEditingTag(false)}
            >
              <option value="" disabled>
                Выберите тег
              </option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="cursor-pointer" onClick={() => setEditingTag(true)}>
              {renderTagDisplay()}
            </div>
          )}
        </div>

        {/* Прогресс (очки) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <TrendingUp className="h-5 w-5" />
            <span>Прогресс:</span>
          </div>
          <div className="flex items-center" onClick={() => setEditingPoints(true)}>
            <div className="w-[150px] bg-gray-200 rounded-full h-2">
                <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pointsValue}%` }}
                ></div>
            </div>
            {editingPoints ? (
            <input
              type="number"
              className={commonInputStyle + "w-[50px] ml-2"}
              value={pointsValue}
              autoFocus
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const num = Number(e.target.value);
                setPointsValue(num);
              }}
              onBlur={() => {
                setEditingPoints(false);
                handleUpdate({ points: pointsValue });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingPoints(false);
                  handleUpdate({ points: pointsValue });
                }
              }}
            />
          ) : (
            <span
              className="text-sm ml-2 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setEditingPoints(true)}
            >
              {pointsValue}%
            </span>
          )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <BadgeCheck className="h-5 w-5" />
            <span>Сложность:</span>
          </div>
          <div className="text-current">
            <StarRating stars={task.stars} />
          </div>
        </div>
        <div className="space-y-4">
        <SubtaskList
          subtasks={subtasks}
          taskId={task.id}
          taskAssignees={users.filter(u => selectedAssignees.includes(u.id))}
          onOpenSubtask={(sub: Subtask) => onOpenSubtask(sub)}
        />
        </div>
        {/* Комментарии */}
        <CommentsSection taskId={task.id} />
      </div>

      {/* Модальные окна */}
      <DeleteConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onDelete={() => {
          onDelete();
          setDeleteConfirmationOpen(false);
        }}
      />
      <AddAssigneeModal
        isOpen={isAssigneeModalOpen}
        onClose={closeAssigneeModal}
        users={users}
        selectedAssignees={selectedAssignees}
        onAssigneeToggle={handleAssigneeToggle}
        projectMembers={projectMembers}
      />
    </div>
    </div>
  );
};

export default TaskSidebar;