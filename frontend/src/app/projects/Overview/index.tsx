import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetProjectByIdQuery, useUpdateProjectMutation } from '@/state/api';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  CircleCheck,
  LoaderCircle,
  BookCheck,
} from 'lucide-react';

const formatDate = (date: string | undefined | null) => {
    if (!date) return '—';
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('ru-RU', opts);
};

const ProjectOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { data: project, isLoading: projLoading } = useGetProjectByIdQuery(projectId);
  const [updateProject] = useUpdateProjectMutation();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [values, setValues] = useState<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (project) {
      setValues({
        name: project.name,
        description: project.description || '',
        startDate: project.startDate?.split('T')[0] || '',
        endDate: project.endDate?.split('T')[0] || '',
      });
    }
  }, [project]);

  const handleBlur = async (field: keyof typeof values) => {
    setEditingField(null);
    if (!project) return;
    if (values[field] !== (project as any)[field]) {
      await updateProject({ id: project.id, [field]: values[field] });
    }
  };

  if (projLoading || !project) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex gap-4 mb-8">
        <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className='flex items-center justify-center w-11 h-11 bg-blue-100 rounded-lg'>
                <Clock size={20} className="text-blue-700" />
            </div>
          <div className="ml-3 text-right">
            <div className="font-bold text-2xl">{project.total_tasks}</div>
            <div className="text-xs text-gray-500">Всего задач</div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
          <div className='flex items-center justify-center w-11 h-11 bg-rose-100 rounded-lg'>
                <Calendar size={20} className="text-rose-700" />
            </div>
          <div className="ml-3 text-right">
            <div className="font-bold text-2xl">{project.total_subtasks}</div>
            <div className="text-xs text-gray-500">Всего подзадач</div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className='flex items-center justify-center w-11 h-11 bg-yellow-100 rounded-lg'>
                <CircleCheck size={20} className="text-yellow-700" />
            </div>
          <div className="ml-3 text-right">
            <div className="font-bold text-2xl">{project.tasks_new}</div>
            <div className="text-xs text-gray-500">Новые</div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className='flex items-center justify-center w-11 h-11 bg-purple-100 rounded-lg'>
                <LoaderCircle size={20} className="text-purple-700" />
            </div>
          <div className="ml-3 text-right">
            <div className="font-bold text-2xl">{project.tasks_in_progress}</div>
            <div className="text-xs text-gray-500">В процессе</div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className='flex items-center justify-center w-11 h-11 bg-green-100 rounded-lg'>
                <BookCheck size={20} className="text-green-700" />
            </div>
          <div className="ml-3 text-right">
            <div className="font-bold text-2xl">{project.tasks_done}</div>
            <div className="text-xs text-gray-500">Завершено</div>
          </div>
        </div>
      </div>

      {/* Блок с названием проекта и датой */}
      <div className="flex items-center mb-6 gap-4">
        <div
          className="relative flex items-center justify-center w-20 h-20 bg-blue-700 rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(150deg, bg-blue-100, bg-blue-500)',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span className="text-xl font-bold text-white">{project.name.charAt(0)}</span>
        </div>
        <div>
        <div className="flex-1">
            {editingField === 'name' ? (
              <input
                type="text"
                className="w-full px-2 py-1 border rounded focus:outline-none text-2xl font-semibold"
                value={values.name}
                autoFocus
                onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
                onBlur={() => handleBlur('name')}
                onKeyDown={e => e.key === 'Enter' && handleBlur('name')}
              />
            ) : (
              <h3 className="text-2xl font-semibold cursor-pointer" onClick={() => setEditingField('name')}>
                {values.name || 'Без названия'}
              </h3>
            )}
        </div>
        <div className="flex items-center space-x-3 mt-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            {editingField === 'dates' ? (
              <>
                <input
                  type="date"
                  className="px-2 py-1 border rounded focus:outline-none"
                  value={values.startDate}
                  onChange={e => setValues(v => ({ ...v, startDate: e.target.value }))}
                  onBlur={() => handleBlur('startDate')}
                />
                <span>—</span>
                <input
                  type="date"
                  className="px-2 py-1 border rounded focus:outline-none"
                  value={values.endDate}
                  onChange={e => setValues(v => ({ ...v, endDate: e.target.value }))}
                  onBlur={() => handleBlur('endDate')}
                />
              </>
            ) : (
              <p className="text-sm text-gray-600 cursor-pointer" onClick={() => setEditingField('dates')}>
                {formatDate(values.startDate)} — {formatDate(values.endDate)}
              </p>
            )}
        </div>
        </div>
        
      </div>

      {/* Описание проекта */}
      <div>
        {editingField === 'description' ? (
          <textarea
            className="w-full px-2 py-1 border rounded focus:outline-none text-base"
            rows={3}
            value={values.description}
            autoFocus
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            onBlur={() => handleBlur('description')}
          />
        ) : (
          <p
            className="text-base text-gray-600 cursor-pointer"
            onClick={() => setEditingField('description')}
          >
            {values.description || 'Нажмите для добавления описания'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectOverviewPage;