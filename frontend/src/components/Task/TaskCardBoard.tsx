import React from "react";
import { Task } from "@/state/api"; // Импортируйте интерфейс Task
import { GripVertical, Flag } from "lucide-react"; // Импортируем иконку для перетаскивания

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskCardBoard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const [isChecked, setIsChecked] = React.useState(false); // Состояние для чекбокса

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Переключаем состояние чекбокса
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: 'numeric', 
      minute: 'numeric' 
    };
    return new Date(dateString).toLocaleString('ru-RU', options);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-2 rounded-lg border ${isChecked ? 'bg-blue-100' : 'bg-white'} shadow-md`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <div className="flex items-center">
        <div className="cursor-pointer mr-2">
          <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </div>
        <input
          type="checkbox"
          id={`taskCheckbox-${task.id}`} // Уникальный ID для каждого чекбокса
          className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <label
          htmlFor={`taskCheckbox-${task.id}`}
          className={`ml-2 ${isChecked ? 'line-through text-gray-400' : ''}`}
        >
          {task.title}
        </label>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-sm">{task.description || "Описание отсутствует"}</p>
        <p className={`text-sm ${new Date(task.due_date) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
          {formatDate(task.due_date)}
        </p>
        <div className={`flex items-center border ${task.priority === 'Высокий' ? 'border-red-600' : task.priority === 'Средний' ? 'border-yellow-600' : 'border-green-600'} rounded-md px-2 py-1`}>
          <Flag className={`h-4 w-4 mr-1 ${task.priority === 'Высокий' ? 'text-red-600' : task.priority === 'Средний' ? 'text-yellow-600' : 'text-green-600'}`} />
          <span className={`text-xs font-semibold ${task.priority === 'Высокий' ? 'text-red-600' : task.priority === 'Средний' ? 'text-yellow-600' : 'text-green-600'}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCardBoard;