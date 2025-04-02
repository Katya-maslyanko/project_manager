import React from "react";
import { Task } from "@/state/api";
import { GripVertical, Flag } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskCardBoard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const formatDateRange = (startDateString: string | undefined, endDateString: string | undefined) => {
    if (!startDateString || !endDateString) return "Дата не указана";
  
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return "Некорректная дата";
    }
  
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    };
  
    const formattedStartDate = startDate.toLocaleString("ru-RU", options);
    const formattedEndDate = endDate.toLocaleString("ru-RU", options);
  
    return `${formattedStartDate} - ${formattedEndDate}`;
  };

  const tagColors = [
    "bg-red-100 text-red-600",
    "bg-yellow-100 text-yellow-600",
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <div
      className="bg-white rounded-md shadow-md p-4 mb-2 cursor-grab"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      {/* Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="inline-flex items-center">
            <label className="flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                id={`taskCheckbox-${task.id}`}
                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>
            </label>
          </div>
          <label
            htmlFor={`taskCheckbox-${task.id}`}
            className={`ml-2 w-[280px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold`}
          >
            {task.title}
          </label>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
        {task.description || "Описание отсутствует"}
      </p>

      {/* Date Range */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{formatDateRange(task.start_date, task.due_date)}</span>
      </div>

      {/* Tag and Priority */}
      <div className="flex items-center mb-3 ">
        <div
          className={`flex items-center border ${
            task.priority === "Высокий"
              ? "border-red-200"
              : task.priority === "Средний"
              ? "border-stone-200"
              : "border-emerald-200"
          } rounded-md px-2 py-1`}
        >
          <Flag
            className={`h-4 w-4 mr-1 ${
              task.priority === "Высокий"
                ? "text-red-600"
                : task.priority === "Средний"
                ? "text-stone-600"
                : "text-emerald-600"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              task.priority === "Высокий"
                ? "text-red-600"
                : task.priority === "Средний"
                ? "text-stone-600"
                : "text-emerald-600"
            }`}
          >
            {task.priority}
          </span>
        </div>
        <div
          className={`flex items-center ml-3 ${
            task.tag ? getTagColor(task.id) : " text-gray-700"
          } rounded-md px-2 py-1`}
        >
          {task.tag ? (
            <span className="mr-1">{task.tag.name}</span>
          ) : (
            <span>Нет тега</span>
          )}
        </div>
      </div>

      {/* Points and Assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[100px] bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${task.points}%` }}
            ></div>
          </div>
          <span className="text-sm">{task.points}%</span>
        </div>
        <div className="flex -space-x-2 rtl:space-x-reverse">
          {task.assignee ? (
            task.assignee.profile_image ? (
              <img
                className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800"
                src={task.assignee.profile_image}
                alt={task.assignee.name}
              />
            ) : (
              <div className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800 flex items-center justify-center">
                <span className="text-white">
                  {task.assignee.name
                    ? task.assignee.name.split(" ").map((n) => n[0]).join("")
                    : "?"}
                </span>
              </div>
            )
          ) : (
            <div className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800 flex items-center justify-center">
              <span className="text-white">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCardBoard;