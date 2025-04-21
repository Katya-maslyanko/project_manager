import React, { useEffect, useState } from "react";
import TaskCardBoard from "@/components/Task/TaskCardBoard";
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import { useParams } from "next/navigation";
import { Task } from "@/state/api";
import { LoaderCircle, CircleCheck, BookCheck, Plus } from "lucide-react";
import EditTaskModal from "@/components/Task/EditTaskModal";
import AddTaskModal from "@/components/Task/AddTaskModal";
import TaskSidebar from "@/components/Task/TaskSidebar";
import { useDeleteTaskMutation } from "@/state/api";

const KanbanBoard: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { id } = useParams();
  const { data: tasks = [], error, isLoading, refetch } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string>("Новая"); 
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await updateTaskStatus({ id: taskId, status: newStatus });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTaskId) {
      try {
        await deleteTask(selectedTaskId);
        setDeleteModalOpen(false);
        closeSidebar();
      } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
      }
    }
  }; 

  const openSidebar = (task: Task) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedTask(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      await updateTaskStatus({ id: draggedTask.id, status });
      setDraggedTask(null);
    }
  };

  const openAddTaskModal = (status: string) => {
    setCurrentTaskStatus(status);
    setAddModalOpen(true);
  };

  if (isLoading) {
    return <p>Загрузка задач...</p>;
  }

  if (error) {
    console.error("Ошибка при загрузке задач:", error);
    return <p>Ошибка при загрузке задач: {JSON.stringify(error)}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* К исполнению */}
      <div
        className="p-4 border border-gray-200 rounded-md"
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
              {tasks .filter(task => task.status === 'Новая').length}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {tasks.filter(task => task.status === 'Новая').map(task => (
            <TaskCardBoard key={task.id} task={task} onDragStart={handleDragStart} onEdit={() => handleEditTask(task)} onStatusChange={handleStatusChange} onOpenSidebar={openSidebar} onDelete={() => handleDeleteTask(task)}/>
          ))}
          <button className="text-gray-600 font-semibold mt-2 p-3 w-full rounded-md bg-gray-100 flex items-center justify-center"
          onClick={() => openAddTaskModal("Новая")}>
            <Plus className="text-gray-600 w-5 h-5 mr-2" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* В процессе */}
      <div
        className="p-4 border border-gray-200 rounded-md"
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
        <div className="space-y-2">
          {tasks.filter(task => task.status === 'В процессе').map(task => (
            <TaskCardBoard key={task.id} task={task} onDragStart={handleDragStart} onEdit={() => handleEditTask(task)} onStatusChange={handleStatusChange} onOpenSidebar={openSidebar} onDelete={() => handleDeleteTask(task)}/>
          ))}
          <button className="text-gray-600 font-semibold mt-2 p-3 w-full rounded-md bg-gray-100 flex items-center justify-center"
          onClick={() => openAddTaskModal("В процессе")}>
            <Plus className="text-gray-600 w-5 h-5 mr-2" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* Завершено */}
      <div
        className="p-4 border border-gray-200 rounded-md"
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
        <div className="space-y-2">
          {tasks.filter(task => task.status === 'Завершено').map(task => (
            <TaskCardBoard key={task.id} task={task} onDragStart={handleDragStart} onEdit={() => handleEditTask(task)} onStatusChange={handleStatusChange} onOpenSidebar={openSidebar} onDelete={() => handleDeleteTask(task)}/>
          ))}
          <button className="text-gray-600 font-semibold mt-2 p-3 w-full rounded-md bg-gray-100 flex items-center justify-center"
          onClick={() => openAddTaskModal("Завершено")}>
            <Plus className="text-gray-600 w-5 h-5 mr-2" /> Добавить задачу
          </button>
        </div>
      </div>
      {/* Боковая панель задач */}
      {isSidebarOpen && selectedTask && (
        <TaskSidebar
          task={selectedTask}
          onClose={closeSidebar}
          onDelete={() => handleDeleteTask(selectedTask)}
          onComplete={async () => {
            await updateTaskStatus({
              id: selectedTask.id,
              status: "Завершено",
            });
          refetch();
          }}
        />
      )}
      {/* Модальное окно добавления задачи */}
      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        projectId={projectId}
        currentStatus={currentTaskStatus}
      />
      {/* Модальное окно редактирования */}
      <EditTaskModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        task={selectedTask} 
      />
    </div>
  );
};

export default KanbanBoard;