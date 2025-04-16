import React, { useState } from "react";
import { Subtask, User } from "@/state/api";
import { Plus, Pencil } from "lucide-react";
import {
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} from "@/state/api";
import SubtaskAssigneeModal from "./modal/SubtaskAssigneeModal";

interface SubtaskListProps {
  subtasks: Subtask[];
  taskId: number;
  taskAssignees: User[];
  onEditSubtask?: (subtask: Subtask) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  taskId,
  taskAssignees,
  onEditSubtask,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [createSubtask] = useCreateSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const [editingDatesSubtaskId, setEditingDatesSubtaskId] = useState<number | null>(null);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempDueDate, setTempDueDate] = useState("");

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [activeSubtaskForAssignees, setActiveSubtaskForAssignees] = useState<Subtask | null>(null);

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Partial<Subtask> = {
      title: newSubtaskTitle,
      description: "",
      status: "Новая",
      priority: "Низкий",
      tag: null,
      points: 0,
      start_date: null,
      due_date: null,
      assignees: [],
      taskId: taskId,
      assigned_to: [],
    };
    try {
      await createSubtask(newSubtask).unwrap();
      setNewSubtaskTitle("");
    } catch (error) {
      console.error("Ошибка создания подзадачи:", error);
    }
  };

  const handleToggleSubtaskStatus = async (subtask: Subtask) => {
    try {
      await updateSubtask({
        id: subtask.id,
        status: subtask.status === "Завершено" ? "Новая" : "Завершено",
      }).unwrap();
    } catch (error) {
      console.error("Ошибка обновления статуса подзадачи:", error);
    }
  };

  const handleDeleteSubtask = async (id: number) => {
    try {
      await deleteSubtask(id).unwrap();
    } catch (error) {
      console.error("Ошибка удаления подзадачи:", error);
    }
  };

  const handleDatesClick = (subtask: Subtask) => {
    setEditingDatesSubtaskId(subtask.id);
    setTempStartDate(subtask.start_date || "");
    setTempDueDate(subtask.due_date || "");
  };

  const handleDatesUpdate = async (subtask: Subtask) => {
    try {
      await updateSubtask({
        id: subtask.id,
        start_date: tempStartDate,
        due_date: tempDueDate,
      }).unwrap();
      setEditingDatesSubtaskId(null);
    } catch (error) {
      console.error("Ошибка обновления дат подзадачи:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const completedCount = subtasks.filter(sub => sub.status === "Завершено").length;

  return (
    <div className="p-4">
      <h3 className="text-sm text-gray-500 mb-3">
        Подзадачи ({completedCount}/{subtasks.length})
      </h3>
      {subtasks.length === 0 && (
        <p className="text-sm text-gray-500">Нет подзадач</p>
      )}
      <ul className="space-y-3">
        {subtasks.map((subtask) => (
 <li
            key={subtask.id}
            className="flex items-center justify-between border-b border-gray-200 pb-2"
          >
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  id={`subtaskCheckbox-${subtask.id}`}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
                  checked={subtask.status === "Завершено"}
                  onChange={() => handleToggleSubtaskStatus(subtask)}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    strokeWidth="1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </label>
              <span className={`${subtask.status === "Завершено" ? "line-through text-gray-500" : "text-gray-800"} text-sm`}>
                {subtask.title}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => onEditSubtask && onEditSubtask(subtask)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Редактировать подзадачу"
              >
                <Pencil size={16} className="text-gray-600" />
              </button>

              <div
                className="text-xs text-gray-600 cursor-pointer"
                onClick={() => handleDatesClick(subtask)}
              >
                {editingDatesSubtaskId === subtask.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={tempStartDate}
                      className="border rounded p-1 text-xs"
                      onChange={(e) => setTempStartDate(e.target.value)}
                    />
                    <span>по</span>
                    <input
                      type="date"
                      value={tempDueDate}
                      className="border rounded p-1 text-xs"
                      onChange={(e) => setTempDueDate(e.target.value)}
                      onBlur={() => handleDatesUpdate(subtask)}
                    />
                  </div>
                ) : (
                  <span>
                    Срок: с {formatDate(subtask.start_date)} по {formatDate(subtask.due_date)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {(subtask.assignees || []).map((userId) => {
                  const user = (taskAssignees || []).find((u: User) => u.id === userId);
                  return user ? (
                    <div key={user.id} className="w-6 h-6 rounded-full overflow-hidden border border-white">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ) : null;
                })}
                <button
                  onClick={() => {
                    setActiveSubtaskForAssignees(subtask);
                    setIsAssigneeModalOpen(true);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Добавить исполнителя"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Добавить новую подзадачу"
          className="flex-1 border rounded-md px-2 py-1 focus:outline-none focus:border-blue-400 text-sm"
        />
        <button
          onClick={handleAddSubtask}
          className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus size={16} />
          <span>Добавить</span>
        </button>
      </div>

      {isAssigneeModalOpen && activeSubtaskForAssignees && (
      <SubtaskAssigneeModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        users={taskAssignees || []} // Передаем массив без фильтрации
        selectedAssignees={activeSubtaskForAssignees.assignees || []}
        assignedTo={activeSubtaskForAssignees.assigned_to}
        onAssigneeToggle={(userId) => {
          const updatedAssignees = activeSubtaskForAssignees.assignees.includes(userId)
            ? activeSubtaskForAssignees.assignees.filter((id) => id !== userId)
            : [...(activeSubtaskForAssignees.assignees || []), userId];

          updateSubtask({
            id: activeSubtaskForAssignees.id,
            assignees: updatedAssignees,
            assigned_to: userId, // Обновляем assigned_to
          });
        }}
      />
    )}
    </div>
  );
};

export default SubtaskList;