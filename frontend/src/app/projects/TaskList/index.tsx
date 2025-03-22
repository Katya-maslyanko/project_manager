"use client";

import React from "react";
import { useGetTasksQuery } from "@/state/api"; // Импортируем хук для получения задач

interface Props {
  projectId: number; // Убедитесь, что projectId имеет тип number
}

const TaskList: React.FC<Props> = ({ projectId }) => {
    const query = { projectId };
    console.log(`Запрос к API для projectId: ${projectId}`); // Логируем projectId
    const { data: tasks = [], error, isLoading } = useGetTasksQuery(query);
  
    if (isLoading) {
      return <p>Загрузка задач...</p>;
    }
  
    if (error) {
      console.error("Ошибка при загрузке задач:", error); // Логируем ошибку
      return <p>Ошибка при загрузке задач: {JSON.stringify(error)}</p>; // Сообщение об ошибке
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