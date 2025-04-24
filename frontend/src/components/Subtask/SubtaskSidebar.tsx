import React, { useState, useEffect, ChangeEvent } from "react";
import { Ellipsis, X, Flag, Calendar, Users, Tag, TrendingUp, Plus, BadgeCheck } from "lucide-react";
import { Subtask, useGetTagsQuery, useGetUsersQuery, useUpdateSubtaskMutation, useDeleteSubtaskMutation, User } from "@/state/api";
import SubtaskAssigneeModal from "./modal/SubtaskAssigneeModal";
import DeleteConfirmationModal from "../Task/modal/DeleteConfirmationModal";
import CommentsSectionSubtask from "./CommentsSectionSubtask";

const formatDate = (dateString: string) => {
  const options = { day: "numeric", month: "long", year: "numeric" } as const;
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

interface SubtaskSidebarProps {
  subtask: Subtask | null;
  taskAssignees: User[];
  onClose: () => void;
  onComplete: (completed: boolean) => void;
  onDelete: () => void;
  onEdit?: (updatedTask: Partial<Subtask>) => void;
}

const SubtaskSidebar: React.FC<SubtaskSidebarProps> = ({ subtask, onClose, onComplete, onDelete, onEdit, taskAssignees, }) => {
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

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
  const [isCompleted, setIsCompleted] = useState(subtask?.status === "Завершено");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [activeSubtaskForAssignees, setActiveSubtaskForAssignees] = useState<Subtask | null>(null);

  useEffect(() => {
    if (subtask) {
      setTitleValue(subtask.title);
      setDescriptionValue(subtask.description || "");
      setPriorityValue(subtask.priority);
      setTagValue(subtask.tag ? subtask.tag.id : null);
      setStartDate(subtask.start_date?.split("T")[0] || "");
      setDueDate(subtask.due_date?.split("T")[0] || "");
      setPointsValue(subtask.points || 0);
      setSelectedAssignees(subtask.assigned_to?.map((a) => a.id) || []);
      setIsCompleted(subtask.status === "Завершено");
    }
  }, [subtask]);

  const handleUpdate = async (fields: Partial<Subtask>) => {
    if (subtask) {
      try {
        await updateSubtask({ id: subtask.id, ...fields });
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

  const commonInputStyle = "w-full px-1 py-1 border rounded-md focus:outline-none focus:border-gray-200 transition-colors";
  const commonSelectStyle = "px-1 py-1 border rounded-md focus:outline-none focus:border-gray-200 transition-colors";

  const currentTag = tags.find(t => t.id === tagValue);

  const renderTagDisplay = () => {
    if (currentTag) {
      return (
        <span className={`flex items-center rounded-md px-2 py-1 text-xs ${getTagColor(currentTag.id)}`}>
          {currentTag.name}
        </span>
      );
    }
    return (
      <span className="mr-1 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs">
        Нет тега
      </span>
    );
  };

  const handleAssigneeToggle = (userId: number) => {
    let newAssignees: number[] = [];
    if (selectedAssignees.includes(userId)) {
      newAssignees = selectedAssignees.filter((id) => id !== userId);
    } else {
      newAssignees = [...selectedAssignees, userId];
    }
    setSelectedAssignees(newAssignees);
    handleUpdate({ assigned_to_ids: newAssignees });
  };

  const openAssigneeModal = () => setIsAssigneeModalOpen(true);
  const closeAssigneeModal = () => setIsAssigneeModalOpen(false);
  const openDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(true);
    setDropdownOpen(false);
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

  const StarRating = ({ stars }: { stars: number }) => {
    const safeStars = Math.min(Math.max(stars || 0, 0), 5);
  
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

  if (!subtask) return null;

  return (
    <div>
      <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-lg z-40 flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <button
            onClick={handleCompleteClick}
            className={`group flex items-center gap-2 py-3 px-4 rounded-lg transition-colors border ${
              isCompleted ? "border-green-200 bg-green-200 text-green-700 cursor-default" : "border-gray-200 text-gray-600 hover:bg-gray-200"
            }`}
            disabled={isCompleted}
          >
            <label className="flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className={`peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-400 ${
                  isCompleted ? "checked:bg-green-600 checked:border-green-600" : "checked:bg-gray-600 checked:border-gray-600"
                }`}
                checked={isCompleted}
                readOnly
              />
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" strokeWidth="1">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </label>
            {isCompleted ? "Завершено" : "Выполнить"}
          </button>

          <div className="flex items-center relative">
            <button className="p-1 rounded hover:bg-gray-100" onClick={() => setDropdownOpen(!dropdownOpen)}>
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
            <button className="ml-2 p-1 rounded hover:bg-gray-100" onClick={onClose}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="space-y-4 h-full">
          <div>
            {editingTitle ? (
              <input
                type="text"
                className={`${commonInputStyle} text-xl w-full font-bold`}
                value={titleValue}
                autoFocus
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleValue(e.target.value)}
                onBlur={() => {
                  setEditingTitle(false);
                  if (titleValue !== subtask.title) {
                    handleUpdate({ title: titleValue });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingTitle(false);
                    if (titleValue !== subtask.title) {
                      handleUpdate({ title: titleValue });
                    }
                  }
                }}
              />
            ) : (
              <h2 className="text-xl font-bold cursor-pointer transition-colors" onClick={() => setEditingTitle(true)}>
                {titleValue}
              </h2>
            )}
          </div>

          <div>
            {editingDescription ? (
              <textarea
                className={`${commonInputStyle} w-full resize-none`}
                value={descriptionValue}
                autoFocus
                rows={3}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescriptionValue(e.target.value)}
                onBlur={() => {
                  setEditingDescription(false);
                  if (descriptionValue !== subtask.description) {
                    handleUpdate({ description: descriptionValue });
                  }
                }}
              />
            ) : (
              <p className="text-sm text-gray-600 cursor-pointer transition-colors" onClick={() => setEditingDescription(true)}>
                {descriptionValue || "Нажмите, чтобы добавить описание"}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Users className="h-5 w-5" />
              <span>Исполнители:</span>
            </div>
            <div className="flex -space-x-3 cursor-pointer"
                onClick={(e) => {
                e.stopPropagation();
                setActiveSubtaskForAssignees(subtask);
                setIsAssigneeModalOpen(true);
                }}>
              {selectedAssignees.length > 0 ? (
                selectedAssignees.map((id, idx) => {
                  const user = users.find((u) => u.id === id);
                  return user ? (
                    <div key={user.id} className="relative">
                      <div
                        className={`w-10 h-10 border-2 border-gray-100 rounded-full flex items-center justify-center overflow-hidden ${getTagColor(idx)}`}
                      >
                        {user.profile_image ? (
                          <img src={user.profile_image} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null;
                })
              ) : (
                <span className="text-gray-500 text-sm">Нет исполнителей</span>
              )}
              <button className="pl-3 text-gray-500 hover:text-blue-600" onClick={openAssigneeModal}>
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
                  className={`${commonInputStyle} w-40`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={() => {
                    handleUpdate({
                      start_date: startDate,
                      due_date: dueDate,
                    });
                    setEditingDates(false);
                  }}
                />
                <input
                  type="date"
                  className={`${commonInputStyle} w-40`}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => {
                    handleUpdate({
                      start_date: startDate,
                      due_date: dueDate,
                    });
                    setEditingDates(false);
                  }}
                />
              </div>
            ) : (
              <span
                className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingDates(true)}
              >
                {formatDate(startDate)} – {formatDate(dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Flag className="h-5 w-5" />
              <span>Приоритет:</span>
            </div>
            {editingPriority ? (
              <select
                className={`${commonSelectStyle} w-[150px] ml-2`}
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
                className={`${commonSelectStyle} w-[150px] ml-2`}
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
                  className={`${commonInputStyle} w-[50px] ml-2`}
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
              <StarRating stars={subtask.stars} />
            </div>
          </div>

          <CommentsSectionSubtask subtaskId={subtask.id} />
        </div>

        <SubtaskAssigneeModal
          isOpen={isAssigneeModalOpen}
          onClose={closeAssigneeModal}
          users={taskAssignees}
          selectedAssignees={selectedAssignees}
          onAssigneeToggle={handleAssigneeToggle}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setIsDeleteConfirmationOpen(false)}
          onDelete={() => {
            onDelete();
            setIsDeleteConfirmationOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default SubtaskSidebar;