import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDate: string, dueDate: string) => Promise<void>;
  currentStartDate: string;
  currentDueDate: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStartDate,
  currentDueDate,
}) => {
  const [startDate, setStartDate] = useState(currentStartDate);
  const [dueDate, setDueDate] = useState(currentDueDate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartDate(currentStartDate);
    setDueDate(currentDueDate);
  }, [currentStartDate, currentDueDate]);

  if (!isOpen) return null;

  const handleDateChange = async (newStartDate: string, newDueDate: string) => {
    try {
      setError(null);
      await onSave(newStartDate, newDueDate);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при сохранении дат.");
    }
  };

  return (
    <div className="absolute z-50 bg-white rounded-lg shadow-lg p-4 mt-1 right-0 mr-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Выберите даты</h3>
        <button onClick={onClose} className="p-1 rounded cursor-pointer hover:bg-gray-200">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4">
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700">Начало</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              const newStartDate = e.target.value;
              setStartDate(newStartDate);
              handleDateChange(newStartDate, dueDate);
            }}
            className="border rounded p-2"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700">Конец</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              const newDueDate = e.target.value;
              setDueDate(newDueDate);
              handleDateChange(startDate, newDueDate);
            }}
            className="border rounded p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;