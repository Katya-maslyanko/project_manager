"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGetTagsQuery, useGetProjectGoalsQuery } from "@/state/api";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

export interface FilterOptions {
  tags: Set<number>;
  priorities: Set<string>;
  assignedTo: "me" | "all";
  goalId?: number;
}

interface FilterDropdownAdvancedProps {
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
  projectId: number;
}

const FilterDropdownAdvanced: React.FC<FilterDropdownAdvancedProps> = ({ onApply, onClose, projectId }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  const priorityOptions = ["Высокий", "Средний", "Низкий"];
  const { data: tags = [], isLoading: tagsLoading, error: tagsError } = useGetTagsQuery();
  const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useGetProjectGoalsQuery({ projectId });

  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set());
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
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

  const handleApply = () => {
    const filters: FilterOptions = {
      tags: selectedTags,
      priorities: selectedPriorities,
      assignedTo,
      goalId: selectedGoal || undefined,
    };
    console.log("Фил:", filters);
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setSelectedTags(new Set());
    setSelectedPriorities(new Set());
    setSelectedGoal(null);
    setAssignedTo("all");
    onApply({ tags: new Set(), priorities: new Set(), assignedTo: "all" });
    onClose();
  };

  return (
    <div
      className="absolute z-20 mt-2 w-96 rounded-md bg-white shadow-lg p-4 border border-gray-200 dark:bg-dark-bg dark:border-gray-600"
      ref={dropdownRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white">Фильтр</h5>
        <button onClick={onClose}>
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Приоритеты</h6>
        {priorityOptions.map((priority) => (
          <label key={priority} className="inline-flex items-center text-sm mr-4">
            <input
              type="checkbox"
              checked={selectedPriorities.has(priority)}
              onChange={() => toggleSetValue<string>(setSelectedPriorities, priority)}
              className="form-checkbox text-gray-500 dark:text-gray-400"
            />
            <span className="ml-2">{priority}</span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Теги</h6>
        {tagsLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка тегов...</p>
        ) : tagsError ? (
          <p className="text-sm text-red-500 dark:text-red-400">Ошибка загрузки тегов</p>
        ) : tags.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Теги отсутствуют</p>
        ) : (
          tags.map((tag) => (
            <label key={tag.id} className="inline-flex items-center text-sm mr-4">
              <input
                type="checkbox"
                checked={selectedTags.has(tag.id)}
                onChange={() => toggleSetValue<number>(setSelectedTags, tag.id)}
                className="form-checkbox text-gray-500 dark:text-gray-400"
              />
              <span className="ml-2">{tag.name}</span>
            </label>
          ))
        )}
      </div>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Цель</h6>
        {goalsLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка целей...</p>
        ) : goalsError ? (
          <p className="text-sm text-red-500 dark:text-red-400">Ошибка загрузки целей</p>
        ) : goals.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Цели отсутствуют</p>
        ) : (
          <select
            value={selectedGoal || ""}
            onChange={(e) => setSelectedGoal(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-dark-bg dark:border-gray-600 dark:text-white"
          >
            <option value="">Все</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-4">
        <h6 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Исполнители</h6>
        <label className="inline-flex items-center text-sm mr-4">
          <input
            type="radio"
            name="assignedTo"
            value="me"
            checked={assignedTo === "me"}
            onChange={() => setAssignedTo("me")}
            className="form-radio text-gray-500 dark:text-gray-400"
            disabled={!isAuthenticated || !user}
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
            className="form-radio text-gray-500 dark:text-gray-400"
          />
          <span className="ml-2">Все</span>
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Очистить
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Применить
        </button>
      </div>
    </div>
  );
};

export default FilterDropdownAdvanced;