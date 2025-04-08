import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGetTasksQuery } from "@/state/api";
import { Task } from "@/state/api";

declare global {
  interface Window {
    Gantt: any;
  }
}

const TimeLineList: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);

  if (isNaN(projectId)) {
    return <div>Неверный идентификатор проекта.</div>;
  }

  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js";
    script.onload = () => {
      const today = new Date().toISOString().split("T")[0];

      const formattedTasks = tasks.map((task: Task) => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.due_date);

        // Проверка на корректность дат
        if (startDate > endDate) {
          console.warn(`Задача "${task.title}" имеет неправильные даты: начало позже окончания.`);
          return null;
        }

        return {
          id: task.id,
          name: task.title,
          start: task.start_date || today,
          end: task.due_date,
          progress: task.points || 0,
          dependencies: task.dependencies || [],
        };
      }).filter(task => task !== null);

      const gantt = new window.Gantt("#gantt", formattedTasks, {
        column_width: 50,
        view_mode: "Week",
        date_format: "YYYY-MM-DD",
        scroll_to: "start",
        language: "ru",
        custom_popup_html: function (task) {
          return `
            <div class="px-4 py-2 text-sm">
              <strong>${task.name}</strong><br />
              <span>Дата начала: ${task.start}</span><br />
              <span>Дата окончания: ${task.end}</span><br />
              <span>Прогресс: ${task.progress}%</span><br />
            </div>
          `;
        },
        on_item_click: (id) => {
          console.log("Задача была выбрана", id);
        },
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, [tasks]);

  if (isLoading) return <div>Загрузка задач...</div>;
  if (error) return <div>Ошибка при загрузке задач: {JSON.stringify(error)}</div>;

  return (
    <div className="p-4 overflow-x-auto">
      <div
        id="gantt"
        className="w-full"
      ></div>
    </div>
  );
};

export default TimeLineList;