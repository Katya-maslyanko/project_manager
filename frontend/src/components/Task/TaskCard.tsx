import React from "react";
import { Task } from "@/state/api"; // Импортируйте интерфейс Task
import { GripVertical } from "lucide-react"; // Импортируем иконку для перетаскивания

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const [isChecked, setIsChecked] = React.useState(false); // Состояние для чекбокса

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Переключаем состояние чекбокса
  };

  return (
    <tr className="border-t">
      <td className="py-3 pl-2">
        <div className="flex items-center">
          <div className="cursor-pointer" onDragStart={(e) => onDragStart(e, task)} draggable>
            <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`taskCheckbox-${task.id}`} // Уникальный ID для каждого чекбокса
              className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <label
              htmlFor={`taskCheckbox-${task.id}`}
              className={`ml-2 w-[280px] overflow-hidden text-ellipsis whitespace-nowrap ${isChecked ? 'line-through text-gray-400' : ''}`}
            >
              {task.title}
            </label>
          </div>
        </div>
      </td>
      <td className="py-2 px-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{task.description || "Описание отсутствует"}</td>
      <td className="py-2 px-4">
        <div className="avatar-group -space-x-2">
          {task.assignees && task.assignees.map(assignee => (
            <div className="avatar" key={assignee.id}>
              <div className="w-12">
                <img
                  alt="Исполнитель"
                  className="w-full h-full rounded-full border-2 border-white"
                  src={assignee.avatarURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} // Замените на URL изображения исполнителя
                />
              </div>
            </div>
          ))}
        </div>
      </td>
      <td className="py-2 px-4">{new Date(task.due_date).toLocaleDateString()}</td>
      <td className="py-2 px-4">
        <span className={`bg-${task.priority === 'Высокий' ? 'red' : task.priority === 'Средний' ? 'yellow' : 'green'}-200 text-${task.priority === 'Высокий' ? 'red' : task.priority === 'Средний' ? 'yellow' : 'green'}-800 text-xs font-semibold mr-2 px-2 py-1 rounded`}>
          {task.priority}
        </span>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center">
          <div className="w-[80px] bg-gray-200 rounded-full h-2.5 mr-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.points}%` }}></div>
          </div>
          <span className="text-sm">{task.points}%</span>
        </div>
      </td>
    </tr>
  );
};

export default TaskCard;