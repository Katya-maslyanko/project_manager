"use client";

import React, { useEffect, useRef } from "react";
import { ArrowUpDown, Flag, Calendar, Star } from "lucide-react";

interface SortDropdownProps {
  onSelectSort: (value: string) => void;
  activeSort: string | null;
  onClearSort: () => void;
  onClose: () => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSelectSort, activeSort, onClearSort, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { label: "По приоритету (возр.)", value: "priority", icon: <Flag className="h-4 w-4 mr-2" /> },
    { label: "По приоритету (убыв.)", value: "-priority", icon: <Flag className="h-4 w-4 mr-2" /> },
    { label: "По дате создания (возр.)", value: "created_at", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { label: "По дате создания (убыв.)", value: "-created_at", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { label: "По сроку выполнения (возр.)", value: "due_date", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { label: "По сроку выполнения (убыв.)", value: "-due_date", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { label: "По сложности (возр.)", value: "points", icon: <Star className="h-4 w-4 mr-2" /> },
    { label: "По сложности (убыв.)", value: "-points", icon: <Star className="h-4 w-4 mr-2" /> },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="absolute z-20 mt-2 w-56 rounded-md bg-white shadow-lg p-4"
      ref={dropdownRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white">Сортировка</h5>
        <button onClick={onClose}>
          <ArrowUpDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            onSelectSort(option.value);
            onClose();
          }}
          className={`flex items-center w-full text-left px-4 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
            activeSort === option.value ? 'bg-blue-100 dark:bg-blue-600' : ''
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
      {activeSort && (
        <button
          type="button"
          onClick={() => {
            onClearSort();
            onClose();
          }}
          className="flex items-center w-full text-left px-4 py-2 text-sm rounded-md text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-600 mt-2"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Сбросить
        </button>
      )}
    </div>
  );
};

export default SortDropdown;