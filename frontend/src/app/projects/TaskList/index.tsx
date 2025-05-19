"use client";

import React, { useState } from "react";
import TaskCard from "@/components/Task/TaskCardList";
import {
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useUpdateSubTaskStatusMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useDeleteSubtaskMutation,
  useUpdateSubtaskMutation,
  useGetUsersQuery,
} from "@/state/api";
import { useParams } from "next/navigation";
import { Task, Subtask } from "@/state/api";
import TaskSidebar from "@/components/Task/TaskSidebar";
import SubtaskSidebar from "@/components/Subtask/SubtaskSidebar";
import EditTaskModal from "@/components/Task/EditTaskModal";
import DeleteConfirmationModal from "@/components/Task/modal/DeleteConfirmationModal";
import AddTaskModal from "@/components/Task/AddTaskModal";
import { useAuth } from "@/context/AuthContext";
import { Plus, CircleCheck, LoaderCircle, BookCheck } from "lucide-react";
import { FilterOptions } from "@/components/ui/dropdown/FilterDropdownAdvanced";

interface TaskListProps {
  projectId: number;
  filters?: FilterOptions;
  sort?: string;
  searchQuery?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  projectId,
  filters = { tags: new Set(), priorities: new Set(), assignedTo: "all" },
  sort,
  searchQuery = "",
}) => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  // console.log("фил:", filters);

  const queryParams: any = { projectId: Number(id) };
  if (filters?.priorities?.size > 0) queryParams.priority = Array.from(filters.priorities).join(",");
  if (filters?.tags?.size > 0) queryParams.tagId = Array.from(filters.tags);
  if (filters?.assignedTo === "me" && isAuthenticated && user) queryParams.assignedTo = "me";
  if (filters?.goalId) queryParams.goalId = filters.goalId;
  if (sort) queryParams.ordering = sort;
  if (searchQuery) queryParams.title = searchQuery;

  // console.log("параметрн:", queryParams);

  const {
    data: tasks = [],
    data: subtasks = [],
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery(queryParams);
  console.log("Tasks from server:", tasks);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubTaskStatus] = useUpdateSubTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const { data: taskAssignees = [] } = useGetUsersQuery();

  const [isTaskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [isSubtaskSidebarOpen, setSubtaskSidebarOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string>("Новая");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);

  // Функция для фильтрации и сортировки задач внутри статуса
  const filterAndSortTasks = (tasks: Task[], status: string) => {
    let filteredTasks = tasks.filter(task => task.status === status);

    if (searchQuery) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filters?.priorities?.size > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priorities.has(task.priority));
    }
    if (filters?.tags?.size > 0) {
      filteredTasks = filteredTasks.filter(task => task.tag && filters.tags.has(task.tag.id));
    }
    if (filters?.assignedTo === "me" && isAuthenticated && user) {
      filteredTasks = filteredTasks.filter(task =>
        task.assignees.some(assignee => assignee.id === user.id)
      );
    }
    if (filters?.goalId) {
      filteredTasks = filteredTasks.filter(task =>
        task.connected_goals?.some(goal => goal.id === filters.goalId)
      );
    }

    if (sort) {
      filteredTasks.sort((a, b) => {
        const isDescending = sort.startsWith('-');
        const field = isDescending ? sort.slice(1) : sort;

        let valueA, valueB;
        switch (field) {
          case 'priority':
            const priorityOrder = { 'Высокий': 3, 'Средний': 2, 'Низкий': 1 };
            valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            break;
          case 'created_at':
            valueA = new Date(a.created_at).getTime();
            valueB = new Date(b.created_at).getTime();
            break;
          case 'due_date':
            valueA = a.due_date ? new Date(a.due_date).getTime() : 0;
            valueB = b.due_date ? new Date(b.due_date).getTime() : 0;
            break;
          case 'points':
            valueA = a.points || 0;
            valueB = b.points || 0;
            break;
          default:
            return 0;
        }
        return isDescending ? valueB - valueA : valueA - valueB;
      });
    }

    return filteredTasks;
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, task: Task) => {
    console.log("Drag started for task:", task.id);
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChangeSub = async (subtaskId: number, newStatus: string) => {
    await updateSubTaskStatus({ id: subtaskId, status: newStatus });
    refetch();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setEditModalOpen(true);
  };

  const handleEditTaskSubmit = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
      setEditModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Ошибка при обновлении задачи:", error);
    }
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setDeleteModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedTask && !isUpdating) {
      console.log("Dropping task", draggedTask.id, "to status:", status);
      await handleStatusChange(draggedTask.id, status);
      setDraggedTask(null);
    }
  };

  const openAddTaskModal = (status: string) => {
    setCurrentTaskStatus(status);
    setAddModalOpen(true);
  };

  const openTaskSidebar = (task: Task) => {
    setSelectedTaskId(task.id);
    setTaskSidebarOpen(true);
    setSubtaskSidebarOpen(false);
  };

  const openSubtaskSidebar = (subtask: Subtask) => {
    setSelectedSubtask(subtask);
    setSubtaskSidebarOpen(true);
    setTaskSidebarOpen(false);
  };

  const closeTaskSidebar = () => {
    setTaskSidebarOpen(false);
    setSelectedTaskId(null);
  };

  const closeSubtaskSidebar = () => {
    setSubtaskSidebarOpen(false);
    setSelectedSubtask(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedTaskId) {
      try {
        await deleteTask(selectedTaskId);
        setDeleteModalOpen(false);
        closeTaskSidebar();
        refetch();
      } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
      }
    }
  };

  const handleSubtaskEdit = async (fields: Partial<Subtask>) => {
    if (!selectedSubtask) return;
    try {
      await updateSubtask({ id: selectedSubtask.id, ...fields }).unwrap();
      refetch();
    } catch (error) {
      console.error("Ошибка при обновлении подзадачи:", error);
    }
  };

  const handleSubtaskDelete = async () => {
    if (!selectedSubtask) return;
    try {
      await deleteSubtask(selectedSubtask.id).unwrap();
      closeSubtaskSidebar();
      refetch();
    } catch (error) {
      console.error("Ошибка при удалении подзадачи:", error);
    }
  };

  if (isLoading) {
    return <p className="text-gray-600 dark:text-gray-400">Загрузка задач...</p>;
  }

  if (error) {
    console.error("Ошибка при загрузке задач:", error);
    return <p className="text-red-500 dark:text-red-400">Ошибка при загрузке задач: {JSON.stringify(error)}</p>;
  }

  const newTasks = filterAndSortTasks(tasks, 'Новая');
  const inProgressTasks = filterAndSortTasks(tasks, 'В процессе');
  const completedTasks = filterAndSortTasks(tasks, 'Завершено');

  return (
    <div style={{ borderLeft: 'none' }} className="border border-gray-200 rounded-md p-4 grid grid-cols-1 dark:border-gray-600 dark:bg-dark-bg">
      {/* К исполнению */}
      <div
        className="p-4 mb-6"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'Новая')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-yellow-200 bg-yellow-100 rounded-lg text-yellow-700 duration-200 transition-colors">
              <CircleCheck className="h-4 w-4 mr-2" />
              К исполнению
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              {newTasks.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm dark:text-gray-300">
              {newTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={handleStatusChange}
                  onOpenSidebar={openTaskSidebar}
                  searchQuery={searchQuery}
                />
              ))}
            </tbody>
          </table>
          <button
            className="text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center dark:text-gray-300"
            onClick={() => openAddTaskModal("Новая")}
          >
            <Plus className="text-gray-600 w-5 h-5 dark:text-gray-300" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* В процессе */}
      <div
        className="p-4 mb-6"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'В процессе')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-purple-200 bg-purple-100 rounded-lg text-purple-700 duration-200 transition-colors">
              <LoaderCircle className="h-4 w-4 mr-2" />
              В процессе
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              {inProgressTasks.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm dark:text-gray-300">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={handleStatusChange}
                  onOpenSidebar={openTaskSidebar}
                  searchQuery={searchQuery}
                />
              ))}
            </tbody>
          </table>
          <button
            className="text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center dark:text-gray-300"
            onClick={() => openAddTaskModal("В процессе")}
          >
            <Plus className="text-gray-600 w-5 h-5 dark:text-gray-300" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* Завершено */}
      <div
        className="p-4 mb-6"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'Завершено')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-green-200 bg-green-100 rounded-lg text-green-700 duration-200 transition-colors">
              <BookCheck className="h-4 w-4 mr-2" />
              Завершено
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              {completedTasks.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm dark:text-gray-300">
              {completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={handleStatusChange}
                  onOpenSidebar={openTaskSidebar}
                  searchQuery={searchQuery}

                />
              ))}
            </tbody>
          </table>
          <button
            className="text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center dark:text-gray-300"
            onClick={() => openAddTaskModal("Завершено")}
          >
            <Plus className="text-gray-600 w-5 h-5 dark:text-gray-300" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* Боковая панель задач */}
      {isTaskSidebarOpen && selectedTask && (
        <TaskSidebar
          task={selectedTask}
          onClose={closeTaskSidebar}
          onDelete={() => handleDeleteTask(selectedTask)}
          onComplete={async () => {
            await updateTaskStatus({
              id: selectedTask.id,
              status: "Завершено",
            });
            refetch();
          }}
          onOpenSubtask={openSubtaskSidebar}
        />
      )}

      {/* Боковая панель подзадач */}
      {isSubtaskSidebarOpen && selectedSubtask && (
        <SubtaskSidebar
          subtask={selectedSubtask}
          taskAssignees={taskAssignees.filter((user) => 
            selectedSubtask.assigned_to?.some(a => a.id === user.id)
          )}
          onClose={closeSubtaskSidebar}
          onDelete={handleSubtaskDelete}
          onEdit={handleSubtaskEdit}
          onComplete={async () => {
            await updateSubTaskStatus({
              id: selectedSubtask.id,
              status: "Завершено",
            });
            refetch();
          }}
          
        />
      )}

      {/* Модальное окно добавления задачи */}
      {isAddModalOpen && (
        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          projectId={projectId}
          currentStatus={currentTaskStatus}
          refetchTasks={refetch}
        />
      )}

      {/* Модальное окно редактирования */}
      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          task={selectedTask}
          onSubmit={handleEditTaskSubmit}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={handleConfirmDelete}
        />
      )}
      
    </div>
  );
};

export default TaskList;