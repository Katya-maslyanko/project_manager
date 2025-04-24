import React, { useState, useEffect } from "react";
import TaskCard from "@/components/Task/TaskCardList";
import {
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useUpdateSubTaskStatusMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  Subtask,
  useDeleteSubtaskMutation,
  useUpdateSubtaskMutation,
  useGetUsersQuery,
} from "@/state/api";
import { useParams } from "next/navigation";
import { Task } from "@/state/api";
import TaskSidebar from "@/components/Task/TaskSidebar";
import SubtaskSidebar from "@/components/Subtask/SubtaskSidebar";
import EditTaskModal from "@/components/Task/EditTaskModal";
import DeleteConfirmationModal from "@/components/Task/modal/DeleteConfirmationModal";
import AddTaskModal from "@/components/Task/AddTaskModal";
import { Plus, CircleCheck, LoaderCircle, BookCheck } from "lucide-react";

const TaskList: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { id } = useParams();
  const {
    data: tasks = [],
    data: subtasks = [],
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });
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
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string>("Новая"); 
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await updateTaskStatus({ id: taskId, status: newStatus });
    refetch();
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      await updateTaskStatus({ id: draggedTask.id, status });
      await updateSubTaskStatus({ id: draggedTask.id, status });
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
    return <p>Загрузка задач...</p>;
  }

  if (error) {
    console.error("Ошибка при загрузке задач:", error);
    return <p>Ошибка при загрузке задач: {JSON.stringify(error)}</p>;
  }

  return (
    <div style={{ borderLeft: 'none' }} className="border border-gray-200 rounded-md p-4 grid grid-cols-1">
      {/* <!-- К исполнению --> */}
      <div
        className="p-4 mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Новая')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-yellow-200 bg-yellow-100 rounded-lg text-yellow-700 duration-200 transition-colors">
              <CircleCheck className="h-4 w-4 mr-2" />
              К исполнению
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
              {tasks.filter(task => task.status === 'Новая').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className={`w-full text-left`}>
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap]">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {tasks.filter(task => task.status === 'Новая').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={handleStatusChange}
                  onOpenSidebar={openTaskSidebar}
                />
              ))}
            </tbody>
          </table>
          <button className=" text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center"
          onClick={() => openAddTaskModal("Новая")}>
                <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
           </button>
        </div>
      </div>

      {/* <!-- В процессе --> */}
      <div
        className="p-4 mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'В процессе')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-purple-200 bg-purple-100 rounded-lg text-purple-700 duration-200 transition-colors">
              <LoaderCircle className="h-4 w-4 mr-2" />
              В процессе
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
              {tasks.filter(task => task.status === 'В процессе').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className={`w-full text-left`}>
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {tasks.filter(task => task.status === 'В процессе').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={handleStatusChange}
                  onOpenSidebar={openTaskSidebar}
                />
              ))}
            </tbody>
          </table>
          <button className=" text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center"
          onClick={() => openAddTaskModal("В процессе")}>
                <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
           </button>
        </div>
      </div>

      {/* <!-- Завершено --> */}
      <div
        className="p-4 mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Завершено')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-green-200 bg-green-100 rounded-lg text-green-700 duration-200 transition-colors">
              <BookCheck className="h-4 w-4 mr-2" />
              Завершено
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
              {tasks.filter(task => task.status === 'Завершено').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className={`w-full text-left`}>
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrapp">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {tasks.filter(task => task.status === 'Завершено').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={handleStatusChange}
                  onOpenSidebar={openTaskSidebar}
                />
              ))}
            </tbody>
          </table>
          <button className=" text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center"
          onClick={() => openAddTaskModal("Завершено")}>
                <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
           </button>
        </div>
      </div>
      {/* Боковая панель задач */}
      {isTaskSidebarOpen && selectedTask && (
        <TaskSidebar
          task={tasks.find(t => t.id === selectedTaskId) || null}
          onClose={closeTaskSidebar}
          onDelete={() => handleDeleteTask(tasks.find(t => t.id === selectedTaskId)!)}
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