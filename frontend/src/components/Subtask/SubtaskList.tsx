import React, { useState, useEffect } from "react";
import { Subtask, User } from "@/state/api";
import { Plus, Calendar } from "lucide-react";
import {
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useGetTaskByIdQuery,
  useGetSubtasksByTaskIdQuery,
} from "@/state/api";
import SubtaskAssigneeModal from "./modal/SubtaskAssigneeModal";
import DatePickerModal from "../Task/modal/DatePickerModal";

interface SubtaskListProps {
  taskId: number;
  taskAssignees: User[];
  onEditSubtask?: (subtask: Subtask) => void;
  onOpenSubtask?: (sub: Subtask) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  taskId,
  taskAssignees,
  onEditSubtask,
  onOpenSubtask,
}) => {
  const { data: task } = useGetTaskByIdQuery(taskId);
  const { data: fetchedSubtasks = [], refetch } = useGetSubtasksByTaskIdQuery(taskId);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [createSubtask] = useCreateSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [activeSubtaskForAssignees, setActiveSubtaskForAssignees] = useState<Subtask | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempDueDate, setTempDueDate] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }

    const newSubtask: Partial<Subtask> = {
      title: newSubtaskTitle,
      description: "",
      status: "Новая",
      priority: "Низкий",
      tag: null,
      points: 0,
      start_date: task?.start_date || new Date().toISOString(),
      due_date: task?.due_date || new Date().toISOString(),
      task: taskId,
      assigned_to: [],
    };

    console.log("Создание подзадачи:", newSubtask);

    try {
      await createSubtask(newSubtask).unwrap();
      setNewSubtaskTitle("");
      refetch();

    } catch (error: any) {
      console.error("Ошибка создания подзадачи:", error);

    }
  };

  const handleToggleSubtaskStatus = async (subtask: Subtask) => {
    try {
      await updateSubtask({
        id: subtask.id,
        status: subtask.status === "Завершено" ? "Новая" : "Завершено",
      }).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Ошибка обновления статуса подзадачи:", error);
    }
  };

  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    return dateString.split("T")[0];
  };

  const handleDatesClick = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setTempStartDate(formatDateForInput(subtask.start_date));
    setTempDueDate(formatDateForInput(subtask.due_date));
    setIsDatePickerOpen(true);
  };

  const handleDatesUpdate = async (newStartDate: string, newDueDate: string) => {
    if (!editingSubtaskId) {
      throw new Error("ID подзадачи не определен");
    }

    if (!newStartDate || !newDueDate) {
      throw new Error("Даты не могут быть пустыми");
    }

    if (task) {
      const taskStartDate = new Date(task.start_date);
      const taskDueDate = new Date(task.due_date);
      const startDate = new Date(newStartDate);
      const dueDate = new Date(newDueDate);

      if (startDate < taskStartDate) {
        throw new Error("Дата начала подзадачи не может быть раньше даты начала основной задачи.");
      }

      if (dueDate > taskDueDate) {
        throw new Error("Дата завершения подзадачи не может быть позже даты завершения основной задачи.");
      }

      if (dueDate < startDate) {
        throw new Error("Дата завершения подзадачи не может быть раньше даты начала.");
      }
    }

    try {
      await updateSubtask({
        id: editingSubtaskId,
        start_date: newStartDate,
        due_date: newDueDate,
      }).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Ошибка обновления дат подзадачи:", error);
    }
  };

  const completedCount = fetchedSubtasks.filter(sub => sub.status === "Завершено").length;

  const tagColors = [
    "bg-red-100 text-red-600",
    "bg-yellow-100 text-yellow-600",
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
  ];
  const getTagColor = (index: number) => tagColors[index % tagColors.length];

  return (
    <div className="border-b border-gray-200 pb-4">
      <h2 className="text-lg font-bold cursor-pointer transition-colors mb-1">
        Подзадачи <span className="text-base text-gray-300">{completedCount}/{fetchedSubtasks.length}</span>
      </h2>

      {fetchedSubtasks.length === 0 && (
        <p className="text-sm text-gray-500">Нет подзадач</p>
      )}

      <ul className="space-y-1 hover:rounded-lg">
        {fetchedSubtasks.map((subtask) => (
          <li
            key={subtask.id}
            className="flex items-center justify-between hover:bg-gray-50 p-1.5 cursor-pointer"
            onClick={() => {
              if (onOpenSubtask) onOpenSubtask(subtask);
            }}
          >
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  id={`subtaskCheckbox-${subtask.id}`}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
                  checked={subtask.status === "Завершено"}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleSubtaskStatus(subtask);
                  }}
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
              <span
                className={`${subtask.status === "Завершено"
                  ? "line-through text-gray-500"
                  : "text-gray-800"
                  } text-sm w-[200px] overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {subtask.title}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex -space-x-3 cursor-pointer">
                    {(subtask.assigned_to || []).length > 0 ? (
                      <>
                        {subtask.assigned_to.slice(0, 2).map((user, idx) => {
                          console.log("Rendering assignee:", user);
                          return (
                            <div key={user.id} className="relative">
                              <div
                                className={`w-10 h-10 border-2 border-gray-100 rounded-full flex items-center justify-center overflow-hidden ${getTagColor(idx)}`}
                              >
                                {user.profile_image ? (
                                  <img
                                    src={user.profile_image}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold">
                                    {user.username ? user.username.charAt(0) : "?"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {subtask.assigned_to.length > 2 && (
                          <div className="w-10 h-10 border-2 border-gray-100 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">
                            +{subtask.assigned_to.length - 2}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Нет исполнителей</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubtaskForAssignees(subtask);
                      setIsAssigneeModalOpen(true);
                    }}
                    className="text-gray-500 hover:text-blue-600"
                    title="Добавить исполнителя"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDatesClick(subtask);
                }}
                className="p-1 rounded cursor-pointer hover:bg-gray-200 ml-1"
                title="Изменить сроки"
              >
                <Calendar className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSave={handleDatesUpdate}
        currentStartDate={tempStartDate || new Date().toISOString().split("T")[0]}
        currentDueDate={tempDueDate || new Date().toISOString().split("T")[0]}
        taskId={taskId}
      />

      <div className="mt-1 flex items-center hover:bg-gray-50 px-1.5 py-3 rounded-md transition-colors">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Добавить новую подзадачу"
          className="flex-1 border-none rounded-md text-sm focus:outline-none bg-transparent"
        />
        <button
          onClick={handleAddSubtask}
          className="ml-2 bg-blue-100 text-blue-700 rounded-md px-3 py-1 transition-colors"
        >
          Добавить
        </button>
      </div>

      <SubtaskAssigneeModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        users={taskAssignees || []}
        selectedAssignees={(activeSubtaskForAssignees?.assigned_to || []).map(a => a.id)}
        onAssigneeToggle={async (userId) => {
          if (!activeSubtaskForAssignees) return;

          try {
            const currentAssignees = new Set(activeSubtaskForAssignees.assigned_to.map(a => a.id));

            if (currentAssignees.has(userId)) {
              currentAssignees.delete(userId);
            } else {
              currentAssignees.add(userId);
            }

            const newAssignees = Array.from(currentAssignees);
            await updateSubtask({
              id: activeSubtaskForAssignees.id,
              assigned_to_ids: newAssignees,
            }).unwrap();

            const updatedAssignedTo = (taskAssignees || []).filter(user =>
              newAssignees.includes(user.id)
            );

            setActiveSubtaskForAssignees((prev: Subtask | null) => {
              if (!prev) return null;
              return {
                ...prev,
                assigned_to: updatedAssignedTo,
              };
            });
            refetch();
          } catch (error: any) {
            console.error("Ошибка обновления исполнителей:", error);
          }
        }}
      />
    </div>
  );
};

export default SubtaskList;

function getTaskById(taskId: number) {
  throw new Error("Function not implemented.");
}