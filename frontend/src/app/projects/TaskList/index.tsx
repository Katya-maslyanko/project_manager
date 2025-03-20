"use client";

import React from "react";
import { useGetTasksQuery } from "@/state/api"; // Импортируем хук для получения задач

type Props = {
  projectId: number; // Убедитесь, что projectId имеет тип number
};

const TaskList: React.FC<Props> = ({ projectId }) => {
    console.log(`Запрос к API для projectId: ${projectId}`); // Логируем projectId
    const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId });
  
    if (isLoading) {
      return <p>Загрузка задач...</p>;
    }
  
    if (error) {
      console.error("Ошибка при загрузке задач:", error);
      return <p>Ошибка при загрузке задач: {JSON.stringify(error)}</p>;
    }
  
    return (
      <div>
        <h4>Задачи для проекта {projectId}</h4>
        {tasks.map((task) => (
          <div key={task.id}>
            <h5>{task.title}</h5>
            <p>{task.description || "Описание отсутствует"}</p>
          </div>
        ))}
      </div>
    );
  };

export default TaskList;