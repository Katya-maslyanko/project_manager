"use client";
import React, { useState, useEffect } from "react";
import { GripVertical, Flag } from "lucide-react";

interface Props {
  subtask: {
    id: number;
    title: string;
    description: string;
    status: string;
    start_date: string;
    due_date: string;
    priority: string;
    points: number;
    assigned_to: Array<{ id: number; username: string; profile_image?: string }>;
    tag?: { id: number; name: string };
  };
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onOpen: () => void;
  onStatusChange: (status: string) => void;
}

const SubtaskCard: React.FC<Props> = ({ subtask, onDragStart, onOpen, onStatusChange }) => {
  const [isChecked, setIsChecked] = useState(subtask.status === 'Завершено');
  const [previousStatus, setPreviousStatus] = useState(subtask.status);

  useEffect(() => {
    setPreviousStatus(subtask.status);
  }, [subtask.status]);

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onStatusChange(newCheckedState ? 'Завершено' : previousStatus);
  };

  const formatDate = (dateString: string) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
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
      onDragStart={onDragStart}
      onClick={onOpen}
    >
      {/* Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
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
          <label
            htmlFor={`subtaskCheckbox-${subtask.id}`}
            className={`ml-2 w-[270px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold`}
          >
            {subtask.title}
          </label>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
        {subtask.description || "Описание отсутствует"}
      </p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{formatDate(subtask.start_date)} - {formatDate(subtask.due_date)}</span>
      </div>

      <div className="flex items-center mb-3">
        <div
          className={`flex items-center border ${
            subtask.priority === "Высокий"
              ? "border-red-200"
              : subtask.priority === "Средний"
              ? "border-stone-200"
              : "border- emerald-200"
          } rounded-md px-2 py-1`}
        >
          <Flag
            className={`h-4 w-4 mr-1 ${
              subtask.priority === "Высокий"
                ? "text-red-600"
                : subtask.priority === "Средний"
                ? "text-stone-600"
                : "text-emerald-600"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              subtask.priority === "Высокий"
                ? "text-red-600"
                : subtask.priority === "Средний"
                ? "text-stone-600"
                : "text-emerald-600"
            }`}
          >
            {subtask.priority}
          </span>
        </div>
        <div
          className={`flex items-center ml-3 ${
            subtask.tag ? getTagColor(subtask.id) : " text-gray-700"
          } rounded-md px-2 py-1`}
        >
          {subtask.tag ? (
            <span className="mr-1">{subtask.tag.name}</span>
          ) : (
            <span>Нет тега</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[100px] bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${subtask.points}%` }}
            ></div>
          </div>
          <span className="text-sm">{subtask.points}%</span>
        </div>
        <div className="flex -space-x-3 cursor-pointer">
          {subtask.assigned_to && subtask.assigned_to.length > 0 ? (
            <>
              {subtask.assigned_to.slice(0, 3).map((assignee, index) => (
                <div key={assignee.id} className={`w-10 h-10 border-2 border-gray-100 rounded-full dark:border-gray-800 flex items-center justify-center ${getTagColor(index)}`}>
                  {assignee.profile_image ? (
                    <img className="w-10 h-10 rounded-full" src={assignee.profile_image} alt={assignee.username} />
                  ) : (
                    <span>{assignee.username ? assignee.username.split(' ').map(n => n[0]).join('') : '?'}</span>
                  )}
                </div>
              ))}
              {subtask.assigned_to.length > 3 && (
                <div className="w-10 h-10 border-2 border-gray-100 rounded-full flex items-center justify-center bg-gray-200 right-0">
                  <span className="text-gray-500">+{subtask.assigned_to.length - 3}</span>
                </div>
              )}
            </>
          ) : (
            <span>Нет ассигнов</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtaskCard;