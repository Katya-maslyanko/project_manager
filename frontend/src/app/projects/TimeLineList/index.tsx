import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useGetTasksQuery, useUpdateTaskMutation, useUpdateTaskStatusMutation } from "@/state/api";
import { Task } from "@/state/api";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { Flag, LoaderCircle, CircleCheck, BookCheck } from "lucide-react";

declare global {
  interface Window {
    gantt: any;
    handleCheckboxChange: (taskId: number, currentStatus: string) => void;
  }
}

const TimeLineList: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);

  const { data: tasks = [], error, isLoading, refetch } = useGetTasksQuery({ projectId });
  const [updateTask] = useUpdateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const ganttContainer = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ taskId: number; x: number; y: number } | null>(null);
  const [gridWidth, setGridWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const draggedTaskRef = useRef<{ id: number; startY: number; startParent: string | null } | null>(null);

  const getTagColor = (index: number) => {
    const tagColors = [
      "bg-red-100 text-red-600",
      "bg-yellow-100 text-yellow-600",
      "bg-green-100 text-green-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
    ];
    return tagColors[index % tagColors.length];
  };

  const formatDate = (dateString: string) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const handleCheckboxChange = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Завершено" ? "Новая" : "Завершено";
    await updateTaskStatus({ id: taskId, status: newStatus });
    refetch();
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await updateTaskStatus({ id: taskId, status: newStatus });
    setContextMenu(null);
    refetch();
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeRef.current && ganttContainer.current) {
        const containerRect = ganttContainer.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        setGridWidth(Math.max(250, Math.min(800, newWidth)));
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const loadScript = () => new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Gantt script"));
      document.body.appendChild(script);
    });

    loadScript().then(() => {
      if (window.gantt && ganttContainer.current) {
        window.gantt.config.columns = [
          {
            name: "text",
            label: "Задача",
            width: 220,
            tree: true,
            template: (task: any) => {
              if (task.isGroup) {
                const icon = task.id === "nova" 
                  ? '<svg class="h-5 w-5 mr-2 text-yellow-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
                  : task.id === "in_progress"
                    ? '<svg class="h-5 w-5 mr-2 text-purple-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle-icon lucide-loader-circle"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>'
                    : '<svg class="h-5 w-5 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-check-icon lucide-book-check"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="m9 9.5 2 2 4-4"/></svg>';
                    return `<div class="mt-1.5 flex items-center justify-center w-full font-semibold text-gray-800 text-sm px-2 py-1 rounded-md">${icon}${task.text}</div>`;
              }
              const checkbox = `<div class="inline-flex items-center"><label class="flex items-center cursor-pointer relative"><input type="checkbox" id="taskCheckbox-${task.id}" class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600" ${task.status === "Завершено" ? "checked" : ""} onclick="window.handleCheckboxChange(${task.id}, '${task.status}')"/><span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></span></label></div>`;
              return `<div class="flex items-center justify-center w-full">${checkbox}<label for="taskCheckbox-${task.id}" class="ml-2 w-[180px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-gray-800">${task.text}</label></div>`;
            },
          },
          {
            name: "assignees",
            label: "Исполнители",
            width: 200,
            template: (task: any) => {
              if (task.isGroup || !task.assignees || task.assignees.length === 0) return "<span class='text-gray-500 text-sm flex justify-center items-center mt-2'>Нет</span>";
              let html = task.assignees.slice(0, 2).map((assignee: any, index: number) => (
                `<div class="w-10 h-10 font-semibold border-2 border-white rounded-full dark:border-gray-800 flex items-center justify-center ${getTagColor(index)}">
                  ${assignee.profile_image ? 
                    `<img class="w-10 h-10 rounded-full object-cover" src="${assignee.profile_image}" alt="${assignee.username}" />` : 
                    `<span class="text-sm">${assignee.username ? assignee.username.split(' ').map((n: string) => n[0]).join('') : '?'}</span>`}
                </div>`
              )).join('');
              if (task.assignees.length > 2) {
                html += `<div class="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center bg-gray-200"><span class="text-gray-500 text-sm">+${task.assignees.length - 2}</span></div>`;
              }
              return `<div class="flex -space-x-2 justify-center items-center">${html}</div>`;
            },
          },
          {
            name: "priority",
            label: "Приоритет",
            width: 100,
            template: (task: any) => {
              if (task.isGroup) return "";
              return `<div class="flex items-center justify-center border mt-1.5 ${
                task.priority === "Высокий" ? "border-red-200" : task.priority === "Средний" ? "border-amber-200" : "border-green-200"
              } rounded-md px-2 py-1">
                <span class="text-xs font-semibold ${
                  task.priority === "Высокий" ? "text-red-600" : task.priority === "Средний" ? "text-amber-600" : "text-green-600"
                }">${task.priority}</span>
              </div>`;
            },
          },
          {
            name: "dates",
            label: "Сроки",
            width: 120,
            template: (task: any) => {
              if (task.isGroup) return "";
              const isOverdue = new Date(task.end_date).getTime() < new Date().getTime() && task.status !== "Завершено";
              return `<span class="text-xs mt-3 flex justify-center items-center ${isOverdue ? "text-red-500 font-semibold" : "text-gray-600"}">${formatDate(task.start_date)} - ${formatDate(task.end_date)}</span>`;
            },
          },
        ];

        window.gantt.init(ganttContainer.current);
        window.gantt.config.drag_move = true;
        window.gantt.config.drag_resize = true;
        window.gantt.config.drag_progress = true;
        window.gantt.config.fit_tasks = true;
        window.gantt.config.show_progress = true;
        window.gantt.config.open_tree_initially = true;
        window.gantt.config.grid_width = gridWidth;

        window.gantt.templates.task_class = (start: Date, end: Date, task: any) => {
          if (task.status === "Новая") return "gantt-task-nova";
          if (task.status === "В процессе") return "gantt-task-in-progress";
          if (task.status === "Завершено") return "gantt-task-done";
          return "";
        };

        window.gantt.templates.rightside_text = (start: Date, end: Date, task: any) => {
          if (!task.isGroup) {
            return `<span class="text-xs text-gray-700">${task.text} (${Math.round(task.progress * 100)}%)</span>`;
          }
          return "";
        };
        window.gantt.attachEvent("onContextMenu", (taskId: number, linkId: number, event: MouseEvent) => {
          if (taskId && !window.gantt.getTask(taskId).isGroup) {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            let x = event.clientX;
            let y = event.clientY;
            const menuHeight = 160;
            const menuWidth = 200;
            if (y + menuHeight > viewportHeight) y = viewportHeight - menuHeight - 10;
            if (x + menuWidth > viewportWidth) x = viewportWidth - menuWidth - 10;
            if (y < 0) y = 10;
            if (x < 0) x = 10;
            setContextMenu({ taskId, x, y });
            return false;
          }
          return true;
        });

        window.gantt.attachEvent("onBeforeTaskDrag", (id: number, mode: string, e: any) => {
          const task = window.gantt.getTask(id);
          draggedTaskRef.current = {
            id,
            startY: e.clientY || (e.touches && e.touches[0]?.clientY) || 0,
            startParent: task.parent || null,
          };
          const taskElement = document.querySelector(`[task_id="${id}"]`);
          if (taskElement) {
            taskElement.classList.add("dragging-task");
            taskElement.style.zIndex = "1000";
          }
          return true;
        });

        window.gantt.attachEvent("onTaskDrag", (id: number, mode: string, task: any, e: any) => {
          const parent = task.parent ? window.gantt.getTask(task.parent) : null;
          if (parent) {
            const targetStatus = parent.id === "nova" ? "Новая" : parent.id === "in_progress" ? "В процессе" : "Завершено";
            const taskElement = document.querySelector(`[task_id="${id}"]`);
            if (taskElement) {
              taskElement.setAttribute("data-target-status", targetStatus);
            }
          }
          return true;
        });

        window.gantt.attachEvent("onAfterTaskDrag", async (id: number, mode: string, e: any) => {
          const task = window.gantt.getTask(id);
          const taskElement = document.querySelector(`[task_id="${id}"]`);
          if (taskElement) {
            taskElement.classList.remove("dragging-task");
            (taskElement as HTMLElement).style.zIndex = "";
            taskElement.removeAttribute("data-target-status");
          }
          if (task.parent && draggedTaskRef.current && task.parent !== draggedTaskRef.current.startParent) {
            const parent = window.gantt.getTask(task.parent);
            const newStatus = parent.id === "nova" ? "Новая" : parent.id === "in_progress" ? "В процессе" : "Завершено";
            await updateTaskStatus({ id, status: newStatus });
            refetch();
          }
          draggedTaskRef.current = null;
        });

        const formattedTasks = tasks.map((task: Task) => ({
          id: task.id,
          text: task.title,
          description: task.description,
          start_date: task.start_date.slice(0, 10),
          end_date: task.due_date.slice(0, 10),
          duration: Math.ceil((new Date(task.due_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 3600 * 24)) || 1,
          progress: task.points / 100,
          status: task.status,
          assignees: task.assignees,
          tag: task.tag,
          priority: task.priority,
          parent: task.status === "Новая" ? "nova" : task.status === "В процессе" ? "in_progress" : "done",
        }));

        const groups = [
          { id: "nova", text: "Новая", open: true, isGroup: true },
          { id: "in_progress", text: "В процессе", open: true, isGroup: true },
          { id: "done", text: "Завершено", open: true, isGroup: true },
        ];

        window.gantt.parse({
          data: [...groups, ...formattedTasks],
          links: [],
        });

        window.gantt.attachEvent("onAfterTaskUpdate", async (id: number, task: any) => {
          if (!task.isGroup) {
            const startDate = new Date(task.start_date).toISOString().slice(0, 10);
            const endDate = new Date(task.end_date).toISOString().slice(0, 10);
            await updateTask({ id, start_date: startDate, due_date: endDate });
            refetch();
          }
        });

        window.handleCheckboxChange = async (taskId: number, currentStatus: string) => {
          const newStatus = currentStatus === "Завершено" ? "Новая" : "Завершено";
          await updateTaskStatus({ id: taskId, status: newStatus });
          refetch();
        };

        const ganttElement = ganttContainer.current;
        if (ganttElement) {
          ganttElement.addEventListener("touchstart", (e: TouchEvent) => {
            const taskId = (e.target as HTMLElement).getAttribute("task_id");
            if (taskId) {
              const task = window.gantt.getTask(parseInt(taskId));
              if (task) {
                draggedTaskRef.current = {
                  id: parseInt(taskId),
                  startY: e.touches[0].clientY,
                  startParent: task.parent || null,
                };
                const taskElement = document.querySelector(`[task_id="${taskId}"]`);
                if (taskElement) {
                  taskElement.classList.add("dragging-task");
                }
              }
            }
          });

          ganttElement.addEventListener("touchmove", (e: TouchEvent) => {
            if (draggedTaskRef.current) {
              const task = window.gantt.getTask(draggedTaskRef.current.id);
              if (task) {
                const y = e.touches[0].clientY;
                const diffY = y - draggedTaskRef.current.startY;
                if (Math.abs(diffY) > 20) {
                  const newParent = diffY > 0 ? "done" : diffY < 0 ? "nova" : "in_progress";
                  if (task.parent !== newParent) {
                    task.parent = newParent;
                    window.gantt.refreshData();
                    const taskElement = document.querySelector(`[task_id="${draggedTaskRef.current.id}"]`);
                    if (taskElement) {
                      const targetStatus = newParent === "nova" ? "Новая" : newParent === "in_progress" ? "В процессе" : "Завершено";
                      taskElement.setAttribute("data-target-status", targetStatus);
                    }
                  }
                }
              }
            }
          });

          ganttElement.addEventListener("touchend", async () => {
            if (draggedTaskRef.current) {
              const task = window.gantt.getTask(draggedTaskRef.current.id);
              const taskElement = document.querySelector(`[task_id="${draggedTaskRef.current.id}"]`);
              if (taskElement) {
                taskElement.classList.remove("dragging-task");
                taskElement.removeAttribute("data-target-status");
              }
              if (task.parent && task.parent !== draggedTaskRef.current.startParent) {
                const parent = window.gantt.getTask(task.parent);
                const newStatus = parent.id === "nova" ? "Новая" : parent.id === "in_progress" ? "В процессе" : "Завершено";
                await updateTaskStatus({ id: draggedTaskRef.current.id, status: newStatus });
                refetch();
              }
              draggedTaskRef.current = null;
            }
          });
        }
      }
    }).catch(error => console.error('Error loading Gantt script:', error));
  }, [tasks, updateTask, updateTaskStatus, refetch, gridWidth]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-96 text-gray-600">Загрузка задач...</div>;
  if (error) return <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">Ошибка загрузки: {JSON.stringify(error)}</div>;

  return (
    <div className="px-4 xl:px-6 grid grid-cols-1 max-w-full dark:bg-dark-bg dark:text-white">
      <div className="overflow-x-auto sm:rounded-lg relative">
        <div className="relative shadow-md rounded-xl overflow-hidden bg-white dark:bg-dark-bg dark:border-dark-border">
          <div ref={ganttContainer} id="gantt" className="min-w-[1000px] w-full h-[600px] border border-gray-200 dark:border-dark-border dark:bg-dark-bg" />
          <div
            ref={resizeRef}
            className="absolute top-0 bottom-0 w-1 bg-gray-200 cursor-ew-resize hover:bg-blue-400 transition-colors duration-200 z-10 select-none"
            style={{ left: `${gridWidth}px` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          >
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1 h-12 bg-blue-400 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        </div>
        {contextMenu && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-5 dark:bg-opacity-30 z-50"
            onClick={() => setContextMenu(null)}
          >
            <div
              className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[200px] backdrop-blur-sm animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-semibold text-gray-800 mb-3 text-lg border-b pb-2 text-center">Изменить статус</h4>
              <button
                className="w-full text-left px-4 py-2 hover:bg-yellow-50 rounded-lg text-gray-800 text-sm flex items-center transition-colors duration-200"
                onClick={() => handleStatusChange(contextMenu.taskId, "Новая")}
              >
                <CircleCheck className="h-5 w-5 mr-3 text-yellow-600" />
                <span className="font-medium">Новая</span>
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-purple-50 rounded-lg text-gray-800 text-sm flex items-center transition-colors duration-200"
                onClick={() => handleStatusChange(contextMenu.taskId, "В процессе")}
              >
                <LoaderCircle className="h-5 w-5 mr-3 text-purple-600" />
                <span className="font-medium">В процессе</span>
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-green-50 rounded-lg text-gray-800 text-sm flex items-center transition-colors duration-200"
                onClick={() => handleStatusChange(contextMenu.taskId, "Завершено")}
              >
                <BookCheck className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-medium">Завершено</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .gantt-task-nova .gantt_task_progress {
          background-color: #fbbf24 !important;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        .gantt-task-in-progress .gantt_task_progress {
          background-color: #a855f7 !important;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        .gantt-task-done .gantt_task_progress {
          background-color: #22c55e !important;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        .gantt_grid_head_cell {
          font-weight: 600;
          color: #2d3748;
          background-color: #f7fafc;
          border-right: 1px solid #e2e8f0;
          padding: 12px;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gantt_task_line {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
          background-color: #ffffff;
          margin: 8px 0;
          transition: all 0.3s ease;
          cursor: grab;
          position: relative;
          overflow: hidden;
          height: 40px;
        }
        .gantt_task_line:hover {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
          cursor: grabbing;
          transform: translateY(-2px);
        }
        .gantt_grid_data .gantt_row {
          border-bottom: 1px solid #edf2f7;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          height: 48px;
        }
        .gantt_grid_data .gantt_row:hover {
          background-color: #f8fafc;
        }
        .gantt_grid_data .gantt_row.gantt_row_project {
          background-color: #f1f5f9;
          font-weight: 600;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease;
        }
        .gantt_grid_data .gantt_row.gantt_row_project:hover {
          background-color: #e2e6ea;
        }
        .gantt_grid_data .gantt_row.gantt_row_project.gantt_grid_row_nova:hover {
          background-color: #fefce8;
        }
        .gantt_grid_data .gantt_row.gantt_row_project.gantt_grid_row_in_progress:hover {
          background-color: #faf5ff;
        }
        .gantt_grid_data .gantt_row.gantt_row_project.gantt_grid_row_done:hover {
          background-color: #f0fdf4;
        }
        .gantt_task_line.dragging-task {
          opacity: 0.8;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          transform: scale(1.02);
          z-index: 1000;
          background-color: rgba(255, 255, 255, 0.9);
        }
        .gantt_task_line::after {
          content: attr(data-target-status);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 100;
        }
        .gantt_task_line.dragging-task::after {
          opacity: 1;
        }
        .gantt_side_content {
          color: #4a5568;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .gantt_cal_light {
          border-radius: 0.75rem;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TimeLineList;