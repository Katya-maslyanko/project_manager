import React, { useEffect, useState } from "react";
import TaskCard from "@/components/Task/TaskCardList";
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import { useParams } from "next/navigation";
import { Task } from "@/state/api";
import { LoaderCircle, CircleCheck, BookCheck, Plus } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import EditTaskModal from "@/components/Task/EditTaskModal";

const TaskList: React.FC = () => {
  const { id } = useParams(); // Получаем ID проекта из параметров
  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation(); // Хук для обновления статуса задачи
  const { isExpanded, isHovered, isMobileOpen } = useSidebar(); // Получаем состояние сайдбара

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      await updateTaskStatus({ id: draggedTask.id, status }); // Обновляем статус задачи
      setDraggedTask(null); // Сбрасываем перетаскиваемую задачу
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
                <th className="py-3 px-4 min-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap]">Срок выполнения</th>
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
                  onEdit={() => handleEditTask(task)} // Передаем обработчик редактирования
                />
              ))}
            </tbody>
          </table>
          <button className=" text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center">
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
                <th className="py-3 px-4 min-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
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
                  onEdit={() => handleEditTask(task)} // Передаем обработчик редактирования
                />
              ))}
            </tbody>
          </table>
          <button className=" text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center">
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
                <th className="py-3 px-4 min-w-[260px] overflow-hidden text-ellipsis whitespace-nowrapp">Срок выполнения</th>
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
                  onEdit={() => handleEditTask(task)} // Передаем обработчик редактирования
                />
              ))}
            </tbody>
          </table>
          <button className=" text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center">
                <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
           </button>
        </div>
      </div>

      {/* Модальное окно редактирования */}
      <EditTaskModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} task={selectedTask} />
    </div>
  );
};

export default TaskList;