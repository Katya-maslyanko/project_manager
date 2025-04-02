// GanttChart.tsx
import React, { useMemo, useState } from "react";
import { Gantt, ViewMode, DisplayOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useParams } from "next/navigation";
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api"; // Импортируйте хуки для получения задач и обновления статуса
import { Task } from "@/state/api"; // Импортируйте интерфейс Task

const GanttChart: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id); // Преобразуем id в число

  // Проверяем, является ли projectId допустимым числом
  if (isNaN(projectId)) {
    return <div>Неверный идентификатор проекта.</div>;
  }

  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId });
  const [updateTaskStatus] = useUpdateTaskStatusMutation(); // Хук для обновления статуса задачи

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (
      tasks?.map((task: Task) => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.due_date);

        // Проверяем, что даты корректные
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Task with id ${task.id} has invalid dates: start_date=${task.start_date}, due_date=${task.due_date}`);
          return null; // Возвращаем null для задач с некорректными датами
        }

        return {
          start: startDate,
          end: endDate,
          name: task.title,
          id: `Task-${task.id}`,
          type: "task",
          progress: task.points ? (task.points / 10) * 100 : 0,
          isDisabled: false,
        };
      }).filter(task => task !== null) || [] // Удаляем null значения
    );
  }, [tasks]);

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  const handleTaskDrop = async (taskId: string, newStatus: string) => {
    await updateTaskStatus({ id: taskId, status: newStatus });
  };

  if (isLoading) return <div>Загрузка задач...</div>;
  if (error || !tasks) return <div>Произошла ошибка при загрузке задач</div>;

  return (
    <div className="overflow-x-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5">
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>День</option>
            <option value={ViewMode.Week}>Неделя</option>
            <option value={ViewMode.Month}>Месяц</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md sm:rounded-lg">
        <Gantt
          tasks={ganttTasks}
          {...displayOptions}
          columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
          listCellWidth="200px" // Увеличиваем ширину ячейки для отображения информации
          onTaskDrop={(taskId, newStatus) => handleTaskDrop(taskId, newStatus)} // Обработчик перетаскивания
          taskNameRenderer={(task) => (
            <div className="flex flex-col">
              <span>{task.name}</span>
              <span className="text-sm text-gray-500">{task.assignees.map(assignee => assignee.name ).join(', ')}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default GanttChart;