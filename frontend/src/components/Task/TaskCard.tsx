// components/TaskCard.tsx
"use client";

import React from "react";
import { Task } from "@/state/api"; // Импортируйте интерфейс Task

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="task relative flex cursor-move justify-between rounded-sm border border-stroke bg-white p-7 shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div>
        <h5 className="mb-4 text-lg font-medium text-black dark:text-white">
          {task.title}
        </h5>
        <p>{task.description || "Описание отсутствует"}</p>
        <p className="text-sm text-gray-500">Приоритет: {task.priority}</p>
        <p className="text-sm text-gray-500">Срок: {new Date(task.due_date).toLocaleDateString()}</p>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          className="taskCheckbox sr-only"
          // Здесь можно добавить логику для обработки изменения состояния чекбокса
        />
        <div className="box mr-3 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark dark:bg-boxdark-2">
          <span className="text-white opacity-0">
            <svg
              className="fill-current"
              width="10"
              height="7"
              viewBox="0 0 10 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.70685 0.292804C9.89455 0.480344 10 0.734667 10 0.999847C10 1.26503 9.89455 1.51935 9.70685 1.70689L4.70059 6.7072C4.51283 6.89468 4.2582 7 3.9927 7C3.72721 7 3.47258 6.89468 3.28482 6.7072L0.281063 3.70701C0.0986771 3.5184 -0.00224342 3.26578 3.785e-05 3.00357C0.00231912 2.74136 0.10762 2.49053 0.29326 2.30511C0.4789 2.11969 0.730026 2.01451 0.992551 2.01224C1.25508 2.00996 1.50799 2.11076 1.69683 2.29293L3.9927 4.58607L8.29108 0.292804C8.47884 0.105322 8.73347 0 8.99896 0C9.26446 0 9.51908 0.105322 9.70685 0.292804Z"
                fill=""
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;