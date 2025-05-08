import React from 'react';
import { Handle, Position } from 'reactflow';
import { Task } from '@/state/api';
import { Trash2 } from 'lucide-react';

interface TaskNodeProps {
    data: {
        task: Task;
        onDelete?: () => void;
    };
}

const TaskNode: React.FC<TaskNodeProps> = ({ data }) => {
    return (
        <div className="p-3 rounded-lg shadow-md w-64 bg-gray-50 border border-gray-200 transition-all hover:shadow-md">
        <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-400 rounded-full" />
        <h4 className="text-md font-semibold truncate">{data.task.title}</h4>
        <p className="text-xs text-gray-600 truncate">{data.task.description}</p>
        <div className="flex items-center justify-between mt-2">
            <span
            className={`text-xs px-2 py-1 rounded ${
                data.task.status === 'Завершено'
                ? 'bg-green-100 text-green-700'
                : data.task.status === 'В процессе'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
            >
            {data.task.status}
            </span>
            <span className="text-xs">Приоритет: {data.task.priority}</span>
            {data.onDelete && (
            <button onClick={data.onDelete} className="text-red-600 hover:text-red-800">
                <Trash2 size={14} />
            </button>
            )}
        </div>
        <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-400 rounded-full" />
        </div>
    );
};

export default React.memo(TaskNode);