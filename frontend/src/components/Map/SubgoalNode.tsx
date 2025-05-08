import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Plus, Trash2, Check, BookCheck, LoaderCircle, CircleCheck } from 'lucide-react';
import { useUpdateTaskMutation, useUpdateSubtaskMutation } from '@/state/api';

interface SubgoalNodeProps {
  data: {
    label: string;
    description: string;
    status: string;
    tasks?: any[];
    subtasks?: any[];
    progress?: number;
    onDelete?: () => void;
    onUpdate?: (updatedData: { title: string; description: string; status: string }) => void;
    onAssignTask?: (taskIds: number[]) => void;
    availableTasks?: any[];
    availableSubtasks?: any[];
  };
}

const SubgoalNode: React.FC<SubgoalNodeProps> = ({ data }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [title, setTitle] = useState(data.label);
  const [description, setDescription] = useState(data.description);
  const [status, setStatus] = useState(data.status);
  const [showTasks, setShowTasks] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<number[]>(data.tasks?.map((task) => task.id) || []);
  const [pendingAssignedTasks, setPendingAssignedTasks] = useState<number[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [updateTask] = useUpdateTaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<number[]>([]);
  const [assignedSubtasks, setAssignedSubtasks] = useState<number[]>(data.subtasks?.map((subtask) => subtask.id) || []);
  const [showAssignSubtaskMenu, setShowAssignSubtaskMenu] = useState(false);

  useEffect(() => {
    const updatedAssignedTasks = data.tasks?.map((task) => task.id) || [];
    setAssignedTasks(updatedAssignedTasks);
    const updatedAssignedSubtasks = data.subtasks?.map((subtask) => subtask.id) || [];
    setAssignedSubtasks(updatedAssignedSubtasks);
}, [data.tasks, data.subtasks]);


  const getStatusStyle = () => {
    switch (status) {
      case 'Завершено':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'В процессе':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getTaskStatusStyle = (taskStatus: string) => {
    switch (taskStatus) {
      case 'Завершено':
        return {
          className: 'flex items-center px-2 py-1 text-xs border font-semibold border-green-200 bg-green-100 rounded-md text-green-700',
          icon: <BookCheck className="h-3 w-3 mr-1" />,
        };
      case 'В процессе':
        return {
          className: 'flex items-center px-2 py-1 text-xs border font-semibold border-purple-200 bg-purple-100 rounded-md text-purple-700',
          icon: <LoaderCircle className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          className: 'flex items-center px-2 py-1 text-xs border font-semibold border-yellow-200 bg-yellow-100 rounded-md text-yellow-700',
          icon: <CircleCheck className="h-3 w-3 mr-1" />,
        };
    }
  };

  const handleBlur = () => {
    if (
      data.onUpdate &&
      (title !== data.label || description !== data.description || status !== data.status)
    ) {
      data.onUpdate({ title, description, status });
    }
    setIsEditingTitle(false);
    setIsEditingDesc(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const toggleTaskSelection = (taskId: number) => {
    if (!assignedTasks.includes(taskId) && !pendingAssignedTasks.includes(taskId)) {
      setSelectedTaskIds((prev) =>
        prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
      );
    }
  };

  const toggleSubtaskSelection = (subtaskId: number) => {
    if (!assignedSubtasks.includes(subtaskId)) {
      setSelectedSubtaskIds((prev) =>
        prev.includes(subtaskId) ? prev.filter((id) => id !== subtaskId) : [...prev, subtaskId]
      );
    }
  };

  const handleAssignTask = () => {
    if (data.onAssignTask && selectedTaskIds.length > 0) {
        data.onAssignTask(selectedTaskIds);
        setAssignedTasks((prev) => [...prev, ...selectedTaskIds]); // Обновляем состояние UI
        setSelectedTaskIds([]);
        setShowAssignMenu(false);
    }
};


  const handleTaskStatusChange = async (task: any) => {
    try {
      const newStatus = task.status === 'Завершено' ? 'В процессе' : 'Завершено';
      await updateTask({ id: task.id, status: newStatus }).unwrap();
      sendTaskUpdate(task.id, task.title, newStatus);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const handleSubtaskStatusChange = async (subtask: any) => {
    try {
      const newStatus = subtask.status === 'Завершено' ? 'В процессе' : 'Завершено';
      await updateSubtask({ id: subtask.id, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const isTaskAssigned = (taskId: number) => {
    return assignedTasks.includes(taskId) || pendingAssignedTasks.includes(taskId);
  };

  return (
    <div className="relative">
      <div className="p-4 rounded-lg shadow-md w-72 bg-white border border-blue-200 transition-all hover:shadow-lg">
        <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-400 rounded-full" />
        <div className="flex justify-between items-center mb-3">
          {isEditingTitle ? (
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold text-gray-700 bg-transparent border-b border-gray-300 focus:border-blue-600 focus:outline-none transition-colors"
              autoFocus
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
            />
          ) : (
            <h3
              className="text-sm font-semibold text-gray-700 truncate cursor-text hover:text-blue-600 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {data.label}
            </h3>
          )}
        </div>

        <div className="mb-3">
          {isEditingDesc ? (
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-1.5 focus:border-blue-600 focus:outline-none resize-none h-12 transition-colors"
              autoFocus
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
            />
          ) : (
            <p
              className="text-xs text-gray-500 mt-1 line-clamp-2 cursor-text hover:text-gray-700 transition-colors"
              onClick={() => setIsEditingDesc(true)}
            >
              {data.description || 'Описание отсутствует'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`text-xs px-2 py-1 border rounded-md font-semibold ${getStatusStyle()} focus:outline-none`}
          >
            <option value="Новая">Новая</option>
            <option value="В процессе">В процессе</option>
            <option value="Завершено">Завершено</option>
          </select>
          {data.onDelete && (
            <button
              onClick={data.onDelete}
              className="p-1 rounded-md hover:bg-red-100 transition-colors"
              title="Удалить"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          )}
        </div>

        <div className="mb-3">
          <div
            className="flex justify-between items-center cursor-pointer mb-1"
            onClick={() => setShowTasks(!showTasks)}
          >
            <p className="text-xs font-semibold text-gray-600">
              Задачи: {(data.tasks?.length || 0)}
            </p>
            <span className="text-xs text-blue-600">{showTasks ? 'Свернуть' : 'Показать'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${data.progress || 0}%` }}
            />
          </div>
          {showTasks && (
            <div className="mt-2 overflow-y-auto space-y-1 max-h-40">
              {data.tasks?.map((task) => (
                <div
                  key={`task-${task.id}`}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <label className="flex items-center cursor-pointer relative">
                    <input
                      type="checkbox"
                      checked={task.status === 'Завершено'}
                      onChange={() => handleTaskStatusChange(task)}
                      className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </label>
                  <span className="text-xs text-gray-700 truncate flex-1">{task.title}</span>
                  <span className={getTaskStatusStyle(task.status).className}>
                    {getTaskStatusStyle(task.status).icon}
                    {task.status}
                  </span>
                </div>
              ))}
              {data.subtasks?.map((subtask) => (
                <div
                  key={`subtask-${subtask.id}`}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <label className="flex items-center cursor-pointer relative">
                    <input
                      type="checkbox"
                      checked={subtask.status === 'Завершено'}
                      onChange={() => handleSubtaskStatusChange(subtask)}
                      className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full hover:shadow-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </label>
                  <span className="text-xs text-gray-700 truncate flex-1">{subtask.title} (Подзадача)</span>
                  <span className={getTaskStatusStyle(subtask.status).className}>
                    {getTaskStatusStyle(subtask.status).icon}
                    {subtask.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAssignMenu(!showAssignMenu)}
            className="w-full text-xs text-blue-700 font-semibold p-1.5 flex items-center justify-center bg-blue-100 rounded-md hover:bg-blue-700 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" /> Назначить задачу
          </button>

          {showAssignMenu && (
            <div className="absolute z-40 bg-white border border-gray-200 rounded-md shadow-lg p-4 mt-2 w-full overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Задачи</p>
              {data.availableTasks && data.availableTasks.length > 0 ? (
                data.availableTasks.map((task) => (
                  <div
                    key={`task-${task.id}`}
                    className={`flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
                      isTaskAssigned(task.id) || selectedTaskIds.includes(task.id) ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    <span className="text-gray-800 text-xs flex-1">{task.title}</span>
                    {(isTaskAssigned(task.id) || selectedTaskIds.includes(task.id)) && (
                      <Check className="h-4 w-4 text-gray-500 ml-2" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">Нет доступных задач</p>
              )}
              <button
                type="button"
                className="w-full mt-3 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-200 py-1.5 px-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAssignTask}
                disabled={selectedTaskIds.length === 0}
              >
                Назначить ({selectedTaskIds.length})
              </button>
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-400 rounded-full" />
      </div>
    </div>
  );
};

export default React.memo(SubgoalNode);

function sendTaskUpdate(id: any, title: any, newStatus: string) {
  throw new Error('Function not implemented.');
}
