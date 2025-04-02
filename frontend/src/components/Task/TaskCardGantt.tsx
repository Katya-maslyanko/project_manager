import React from "react";
import { GanttOriginal } from "react-gantt-chart"; // Используйте GanttOriginal вместо Gantt
import { useGetTasksQuery } from "@/state/api";

interface GanttChartProps {
  projectId: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ projectId }) => {
  const { data: tasks = [], error, isLoading } = useGetTasksQuery({ projectId });

  if (isLoading) {
    return <p>Загрузка задач...</p>;
  }

  if (error) {
    console.error("Ошибка при загрузке задач:", error);
    return <p>Ошибка при загрузке задач: {JSON.stringify(error)}</p>;
  }

  // Преобразуем данные задач в формат, необходимый для диаграммы Ганта
  const ganttData = tasks.map(task => ({
    id: task.id,
    name: task.title,
    start: new Date(task.start_date).getTime(),
    end: new Date(task.due_date).getTime(),
    progress: task.points || 0, // Убедитесь, что points определены
    dependencies: [], // Если у вас есть зависимости, добавьте их здесь
  }));

  return (
    <div className="p-4">
      <GanttOriginal
        data={ganttData}
        viewMode="Day" // Вы можете изменить режим просмотра на "Week" или "Month"
        onClick={(task) => console.log(task)} // Обработчик клика по задаче
      />
    </div>
  );
};

export default GanttChart;