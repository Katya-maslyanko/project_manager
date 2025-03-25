"use client";

import React, { useEffect, useState } from "react";
import TaskCard from "@/components/Task/TaskCard"; // Импортируем компонент TaskCard
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api"; // Импортируем хук для получения задач и обновления статуса
import { useParams } from "next/navigation";
import { Task } from "@/state/api";

const TaskList: React.FC = () => {
  const { id } = useParams(); // Получаем ID проекта из параметров
  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation(); // Хук для обновления статуса задачи

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      console.log(`Перемещаем задачу ${draggedTask.title} в статус ${status}`);
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
    <div className="mx-auto max-w-5xl">
      {/* <!-- To Do list --> */}
      <div
        className="swim-lane flex flex-col gap-5.5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Новая')}
      >
        <h4 className="text-xl font-semibold text-black dark:text-white">
          To Do&apos;s ({tasks.filter(task => task.status === 'Новая').length})
        </h4>
        {tasks.filter(task => task.status === 'Новая').map(task => (
          <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
        ))}
      </div>

      {/* <!-- In Progress list --> */}
      <div
        className="swim-lane flex flex-col gap-5.5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'В процессе')}
      >
        <h4 className="text-xl font-semibold text-black dark:text-white">
          In Progress ({tasks.filter(task => task.status === 'В процессе').length})
        </h4>
        {tasks.filter(task => task.status === 'В процессе').map(task => (
          <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
        ))}
      </div>

      {/* <!-- Completed list --> */}
      <div
        className="swim-lane flex flex-col gap-5.5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Завершено')}
      >
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Completed ({tasks.filter(task => task.status === 'Завершено').length})
        </h4>
        {tasks.filter(task => task.status === 'Завершено').map(task => (
          <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
        ))}
      </div>
    </div>
  );
};

export default TaskList;