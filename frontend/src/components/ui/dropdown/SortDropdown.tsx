"use client";

import React, { useEffect, useRef } from "react";
import { ArrowUpDown, Flag, CheckCircle } from "lucide-react";

interface SortDropdownProps {
  onSelectSort: (value: string) => void;
  activeSort: string | null;
  onClearSort: () => void;
  onClose: () => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSelectSort, activeSort, onClearSort, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { label: "По статусу", value: "status", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
    { label: "По приоритету", value: "priority", icon: <Flag className="h-4 w-4 mr-2" /> },
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
      <h5 className="mb-3 text-lg font-semibold">Сортировка</h5>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            onSelectSort(option.value);
            onClose();
          }}
          className={`flex items-center w-full text-left px-4 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 ${activeSort === option.value ? 'bg-blue-100' : ''}`}
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
          className="flex items-center w-full text-left px-4 py-2 text-sm rounded-md text-red-600 hover:bg-red-100 mt-2 flex items-center"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Сбросить
        </button>
      )}
    </div>
  );
};

export default SortDropdown;