"use client";

import React, { useEffect, useRef, useState } from "react";

export interface FilterOptions {
  statuses: Set<string>;
  tags: Set<number>;
  priorities: Set<string>;
  assignedTo: "me" | "all";
}

interface FilterDropdownAdvancedProps {
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
}

const FilterDropdownAdvanced: React.FC<FilterDropdownAdvancedProps> = ({ onApply, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = ["Новая", "В процессе", "Завершено"];
  const priorityOptions = ["Высокий", "Средний", "Низкий"];

  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set());
  const [assignedTo, setAssignedTo] = useState<"me" | "all">("all");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const toggleSetValue = <T,>(
    setState: React.Dispatch<React.SetStateAction<Set<T>>>,
    value: T
  ) => {
    setState((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  return (
    <div
      className="absolute z-20 mt-2 w-96 rounded-md bg-white shadow-lg p-4"
      ref={dropdownRef}
    >
      <h5 className="mb-3 text-lg font-semibold">Фильтр</h5>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold">Статусы</h6>
        {statusOptions.map((status) => (
          <label key={status} className="inline-flex items-center text-sm mr-4">
            <input
              type="checkbox"
              checked={selectedStatuses.has(status)}
              onChange={() => toggleSetValue<string>(setSelectedStatuses, status)}
              className="form-checkbox text-gray-500"
            />
            <span className="ml-2">{status}</span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold">Приоритеты</h6>
        {priorityOptions.map((priority) => (
          <label key={priority} className="inline-flex items-center text-sm mr-4">
            <input
              type="checkbox"
              checked={selectedPriorities.has(priority)}
              onChange={() => toggleSetValue<string>(setSelectedPriorities, priority)}
              className="form-checkbox text-gray-500"
            />
            <span className="ml-2">{priority}</span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold">Исполнители</h6>
        <label className="inline-flex items-center text-sm mr-4">
          <input
            type="radio"
            name="assignedTo"
            value="me"
            checked={assignedTo === "me"}
            onChange={() => setAssignedTo("me")}
            className="form-radio text-gray-500"
          />
          <span className="ml-2">Я</span>
        </label>
        <label className="inline-flex items-center text-sm">
          <input
            type="radio"
            name="assignedTo"
            value="all"
            checked={assignedTo === "all"}
            onChange={() => setAssignedTo("all")}
            className="form-radio text-gray-500"
          />
          <span className="ml-2">Все</span>
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          onApply({
            statuses: selectedStatuses,
            tags: selectedTags,
            priorities: selectedPriorities,
            assignedTo,
          });
          onClose();
        }}
        className="w-full rounded-md bg-blue-100 py-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        Применить
      </button>
    </div>
  );
};

export default FilterDropdownAdvanced;