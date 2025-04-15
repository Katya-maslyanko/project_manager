import React, { useEffect } from "react";
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

  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId });

  useEffect(() => {
    const loadScript = () =>
      new Promise<void>((resolve) => {
        if (window.Gantt) return resolve();
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.umd.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css";
    document.head.appendChild(link);

    const initGantt = () => {
      const today = new Date().toISOString().split("T")[0];

      const formattedTasks = tasks.map((task: Task) => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.due_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
        if (startDate > endDate) return null;

        return {
          id: task.id.toString(),
          name: task.title,
          start: task.start_date.slice(0, 10),
          end: task.due_date.slice(0, 10),
          progress: task.points || 0,
          dependencies: task.dependencies?.join(",") || "",
          assignees: task.assignees || [],
        };
      }).filter(Boolean);

      const container = document.getElementById("gantt");
      if (container) container.innerHTML = "";

      if (window.Gantt && formattedTasks.length > 0) {
        const gantt = new window.Gantt("#gantt", formattedTasks, {
          view_mode: "Day",
          date_format: "YYYY-MM-DD",
          view_mode_select: true,
          container_height: 550,
          custom_popup_html: (task: any) => {
            const assignees = task.assignees || [];
            const avatars = assignees
              .slice(0, 3)
              .map((assignee: any) => {
                if (assignee.profile_image) {
                  return `<img src="${assignee.profile_image}" alt="${assignee.username}" class="w-6 h-6 rounded-full border-2 border-white shadow" />`;
                } else {
                  const initials = assignee.username?.split(" ").map((n: string) => n[0]).join("") || "?";
                  return `<div class="w-6 h-6 bg-gray-400 text-white text-xs rounded-full flex items-center justify-center">${initials}</div>`;
                }
              }).join("");

            const extraCount = assignees.length - 3;
            const extraCircle = extraCount > 0
              ? `<div class="w-6 h-6 bg-gray-300 text-xs text-gray-700 rounded-full flex items-center justify-center">+${extraCount}</div>`
              : "";

            return `
              <div class="flex items-center space-x-2 p-2">
                <div>
                  <div class="font-semibold">${task.name}</div>
                  <div class="text-xs text-gray-500">С ${task.start} по ${task.end}</div>
                  <div class="mt-2">
                    <strong>Прогресс:</strong> ${task.progress}%
                  </div>
                  <div class="mt-2">
                    <strong>Ассигнеры:</strong> ${avatars}${extraCircle}
                  </div>
                </div>
              </div>
            `;
          },
          popup_on: "hover",
          on_date_change: (task: any, newStartDate: string, newEndDate: string) => {
            const updatedTask = {
              ...task,
              start_date: newStartDate,
              due_date: newEndDate,
            };

            console.log('Updated task:', updatedTask);
          },
        });
      }
    };

    loadScript().then(initGantt);
  }, [tasks]);

  if (isLoading) return <div>Загрузка задач...</div>;
  if (error) return <div>Ошибка загрузки: {JSON.stringify(error)}</div>;

  return (
    <div className="px-4 xl:px-6 grid grid-cols-1 max-w-full">
      <div className="overflow-x-auto sm:rounded-lg">
        <div id="gantt" className="min-w-[1000px] w-full h-auto"></div>
      </div>
    </div>
  );
};

export default TimeLineList;