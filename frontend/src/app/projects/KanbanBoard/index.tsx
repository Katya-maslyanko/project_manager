import React from 'react';
import TaskCardBoard from "@/components/Task/TaskCardBoard"; // Импортируем компонент TaskCard
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api"; // Импортируем хуки для получения задач и обновления статуса
import { useParams } from "next/navigation";
import { Task } from "@/state/api";
import { LoaderCircle, CircleCheck, BookCheck } from "lucide-react";

const KanbanBoard: React.FC = () => {
  const { id } = useParams(); // Получаем ID проекта из параметров
  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation(); // Хук для обновления статуса задачи

  const [draggedTask, setDraggedTask] = React.useState<Task | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
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
    <div className="flex space-x-4">
      {/* Колонка "К исполнению" */}
      <div
        className="bg-white shadow-md rounded-lg p-4 w-1/3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Новая')}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center px-2 py-1 text-sm border font-semibold border-yellow-200 bg-yellow-100 rounded-lg text-yellow-700 duration-200 transition-colors">
            <CircleCheck className="h-4 w-4 mr-2" />
            К исполнению
          </span>
          <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
            {tasks.filter(task => task.status === 'Новая').length}
          </span>
        </div>
        <div className="overflow-x-auto">
          {tasks.filter(task => task.status === 'Новая').map(task => (
            <TaskCardBoard key={task.id} task={task} onDragStart={handleDragStart} />
          ))}
        </div>
      </div>

      {/* Колонка "В процессе" */}
      <div
        className="bg-white shadow-md rounded-lg p-4 w-1/3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'В процессе')}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center px-2 py-1 text-sm border font-semibold border-purple-200 bg-purple-100 rounded-lg text-purple-700 duration-200 transition-colors">
            <LoaderCircle className="h-4 w-4 mr-2" />
            В процессе
          </span>
          <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
            {tasks.filter(task => task.status === 'В процессе').length}
          </span>
        </div>
        <div className="overflow-x-auto">
          {tasks.filter(task => task.status === 'В процессе').map(task => (
            <TaskCardBoard key={task.id} task={task} onDragStart={handleDragStart} />
          ))}
        </div>
      </div>

      {/* Колонка "Завершено" */}
      <div
        className="bg-white shadow-md rounded-lg p-4 w-1/3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Завершено')}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center px-2 py-1 text-sm border font-semibold border-green-200 bg-green-100 rounded-lg text-green-700 duration-200 transition-colors">
            <BookCheck className="h-4 w-4 mr-2" />
            Завершено
          </span>
          <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
            {tasks.filter(task => task.status === 'Завершено').length}
          </span>
        </div>
        <div className="overflow-x-auto">
          {tasks.filter(task => task.status === 'Завершено').map(task => (
            <TaskCardBoard key={task.id} task={task} onDragStart={handleDragStart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;