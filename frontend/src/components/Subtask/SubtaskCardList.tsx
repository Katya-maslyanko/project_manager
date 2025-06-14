"use client";
import React, { useEffect, useState } from "react";
import { GripVertical, Flag } from "lucide-react";

const SubtaskCard = ({ subtask, onDragStart, onOpen, onStatusChange }) => {
  const [isChecked, setIsChecked] = useState(subtask.status === 'Завершено');
  const [previousStatus, setPreviousStatus] = useState(subtask.status);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    setPreviousStatus(subtask.status);
    const dueDateObj = new Date(subtask.due_date);
    const currentDate = new Date();
    setIsOverdue(currentDate > dueDateObj && subtask.status !== "Завершено");
  }, [subtask.status, subtask.due_date]);

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);

    if (newCheckedState) {
      onStatusChange(subtask.id, 'Завершено');
    } else {
      onStatusChange(subtask.id, previousStatus);
    }
  };

  const tagColors = [
    'bg-red-100 text-red-600',
    'bg-yellow-100 text-yellow-600',
    'bg-green-100 text-green-600',
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
  ];

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length];
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  return (
    <tr className="border-t border-b cursor-grab active:cursor-grabbing dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors" 
        onClick={onOpen}
        onDragStart={(e) => onDragStart(e, subtask)}
        draggable>
      <td className="py-3 pl-2 border-r">
        <div className="flex items-center">
          <div className="cursor-pointer">
            <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </div>
          <div className="flex items-center pl-1">
            <div className="inline-flex items-center">
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  id={`subtaskCheckbox-${subtask.id}`}
                  className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
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
            <label className={`ml-2 w-[280px] overflow-hidden text-ellipsis whitespace-nowrap`}>
              {subtask.title}
            </label>
          </div>
        </div>
      </td>
      <td className="py-2 px-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap border-r">{subtask.description || "Описание отсутствует"}</td>
      <td className="py-2 px-4 border-r">
        <div className="flex -space-x-4 rtl:space-x-reverse">
          {subtask.assigned_to && subtask.assigned_to.length > 0 ? (
            subtask.assigned_to.map((assignee, index) => (
              <div key={assignee.id} className={`w-10 h-10 border-2 border-gray-100 rounded-full dark:border-gray-800 flex items-center justify-center ${getTagColor(index)}`}>
                {assignee.profile_image ? (
                  <img className="w-10 h-10 rounded-full" src={assignee.profile_image} alt={assignee.username} />
                ) : (
                  <span>{assignee.username ? assignee.username.split(' ').map(n => n[0]).join('') : '?'}</span>
                )}
              </div>
            ))
          ) : (
            <span>Нет ассигнов</span>
          )}
        </div>
      </td>
      <td className="py-2 px-4 border-r w-full">
      <div className="flex items-center space-x-2">
          <span className={isOverdue ? "text-red-400 font-semibold" : ""}>
            {formatDate(subtask.start_date)} - {formatDate(subtask.due_date)}
          </span>
        </div>
      </td>
      <td className="py-2 px-4 border-r">
        <div className={`flex items-center border ${subtask.priority === 'Высокий' ? 'border-red-200' : subtask.priority === 'Средний' ? 'border-stone-200' : 'border-emerald-200'} rounded-md px-2 py-1`}>
          <Flag className={`h-4 w-4 mr-1 ${subtask.priority === 'Высокий' ? 'text-red-600' : subtask.priority === 'Средний' ? 'text-stone-600' : 'text-emerald-600'}`} />
          <span className={`text-xs font-semibold ${subtask.priority === 'Высокий' ? 'text-red-600' : subtask.priority === 'Средний' ? 'text-stone-600' : 'text-emerald-600'}`}>
            {subtask.priority}
          </span>
        </div>
      </td>
      <td className="py-2 px-4 border-r">
        <div className="flex flex-wrap">
          {subtask.tag ? (
            <span key={subtask.tag.id} className={`mr-1 px-2.5 py-0.5 rounded bg-gray-200 text-gray-700 ${getTagColor(subtask.id)}`}>
              {subtask.tag.name}
            </span>
          ) : (
            <span className="mr-1 px-2.5 py-0.5 rounded bg-gray-200 text-gray-700 w-[69px]">Нет тега</span>
          )}
        </div>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center">
          <div className="w-[100px] bg-gray-200 rounded-full h-2 mr-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${subtask.points}%` }}></div>
          </div>
          <span className="text-sm">{subtask.points}%</span>
        </div>
      </td>
    </tr>
  );
};

export default SubtaskCard;