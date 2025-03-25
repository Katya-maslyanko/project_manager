import React from "react";
import { Task } from "@/state/api";
import { GripVertical, Flag } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <tr className="border-t">
      <td className="py-3 pl-2">
        <div className="flex items-center">
          <div className="cursor-pointer" onDragStart={(e) => onDragStart(e, task)} draggable>
            <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </div>
          <div className="flex items-center pl-1">
            <div className="inline-flex items-center">
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  id={`taskCheckbox-${task.id}`} // Уникальный ID для каждого чекбокса
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-slate-200 checked:bg-blue-600 checked:border-blue-600"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </label>
            </div>
            <label
              htmlFor={`taskCheckbox-${task.id}`}
              className={`ml-2 w-[280px] overflow-hidden text-ellipsis whitespace-nowrap`}
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
                  className=" h-full rounded-full border-2 border-white"
                  src={assignee.avatarURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} // Замените на URL изображения исполнителя
                />
              </div>
            </div>
          ))}
        </div>
      </td>
      <td className="py-2 px-4">{new Date(task.due_date).toLocaleDateString()}</td>
      <td className="py-2 px-4">
        <div className={`flex items-center border ${task.priority === 'Высокий' ? 'border-red-200' : task.priority === 'Средний' ? 'border-yellow-200' : 'border-green-200'} rounded-md px-2 py-1`}>
          <Flag className={`h-4 w-4 mr-1 ${task.priority === 'Высокий' ? 'text-red-600' : task.priority === 'Средний' ? 'text-yellow-600' : 'text-green-600'}`} />
          <span className={`text-xs font-semibold ${task.priority === 'Высокий' ? 'text-red-600' : task.priority === 'Средний' ? 'text-yellow-600' : 'text-green-600'}`}>
            {task.priority}
          </span>
        </div>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center">
          <div className="w-[100px] bg-gray-200 rounded-full h-2.5 mr-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.points}%` }}></div>
          </div>
          <span className="text-sm">{task.points}%</span>
        </div>
      </td>
      {/* <td className="py-2 px-4">
        <div className="flex flex-wrap">
            {task.tags && task.tags.split(',').map(tag => (
            <span key={tag.trim()} className="bg-gray-200 text-gray-700 text-xs font-semibold mr-1 px-2.5 py-0.5 rounded">
                {tag.trim()}
            </span>
            ))}
        </div>
      </td> */}
    </tr>
  );
};

export default TaskCard;