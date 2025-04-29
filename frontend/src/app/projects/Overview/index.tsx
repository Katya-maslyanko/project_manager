import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetProjectByIdQuery, useUpdateProjectMutation, useDeleteProjectMutation } from '@/state/api';
import {
  Calendar,
  Clock,
  CircleCheck,
  LoaderCircle,
  BookCheck,
  Ellipsis,
  Bold,
  Italic,
  Underline,
  Heading2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProjectTeamMember from '@/components/Project/ProjectTeamMember';

const formatDate = (date: string | null) => {
  if (!date) return '—';
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(date).toLocaleDateString('ru-RU', opts);
};

const ProjectOverviewPage: React.FC<{ projectId: number; refetch: () => void }> = ({ projectId, refetch }) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: project, isLoading: projLoading } = useGetProjectByIdQuery(projectId, {
    pollingInterval: 1000000,
  });
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    heading: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    heading: false,
  });
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

  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      setValues({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate?.split('T')[0] || '',
        endDate: project.endDate?.split('T')[0] || '',
      });
    }
  }, [project]);

  const handleBlur = async (field: keyof typeof values) => {
    if (!project) return;

    if (field === 'description' && descriptionRef.current) {
      const updatedDescription = descriptionRef.current.innerHTML;
      setValues((v) => ({ ...v, description: updatedDescription }));
      if (updatedDescription !== project.description) {
        await updateProject({ id: project.id, description: updatedDescription });
        refetch();
      }
    } else if (values[field] !== (project as any)[field]) {
      await updateProject({ id: project.id, [field]: values[field] });
      refetch();
    }
  };

  const handleSaveAndClose = async () => {
    setEditingField(null);
    await handleBlur('description');
  };

  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
      await deleteProject(projectId);
      router.push('/');
    }
  };

  const toggleFormat = (format: keyof typeof activeFormats) => {
    setActiveFormats((prev) => {
      const newFormats = { ...prev, [format]: !prev[format] };
      applyFormat(format, !prev[format]);
      return newFormats;
    });
  };

  const applyFormat = (format: keyof typeof activeFormats, apply: boolean) => {
    if (!descriptionRef.current) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      if (format === 'heading') {
        if (apply) {
          document.execCommand('formatBlock', false, 'h2');
        } else {
          document.execCommand('formatBlock', false, 'p');
        }
      } else {
        const formatCommand = {
          bold: 'bold',
          italic: 'italic',
          underline: 'underline',
        }[format];
        const isAlreadyApplied = document.queryCommandState(formatCommand);
        if (apply && !isAlreadyApplied) {
          document.execCommand(formatCommand);
        } else if (!apply && isAlreadyApplied) {
          document.execCommand(formatCommand);
        }
      }
    }
    descriptionRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveAndClose();
      return;
    }
    if (activeFormats.bold && !document.queryCommandState('bold')) {
      document.execCommand('bold', false, undefined);
    }
    if (activeFormats.italic && !document.queryCommandState('italic')) {
      document.execCommand('italic', false, undefined);
    }
    if (activeFormats.underline && !document.queryCommandState('underline')) {
      document.execCommand('underline', false, undefined);
    }
    if (activeFormats.heading) {
      document.execCommand('formatBlock', false, 'h2');
    } else {
      document.execCommand('formatBlock', false, 'p');
    }
  };

  if (projLoading || !project) return <div className="p-4">Загрузка...</div>;

  const isCurator = project.curator?.id === user?.id;

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex gap-4 mb-8">
        {/* Блок с показателями проекта */}
        <div className="flex-1 flex gap-4">
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-blue-100 rounded-lg">
              <Clock size={20} className="text-blue-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.total_tasks}</div>
              <div className="text-xs text-gray-500">Всего задач</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-rose-100 rounded-lg">
              <Calendar size={20} className="text-rose-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.total_subtasks}</div>
              <div className="text-xs text-gray-500">Всего подзадач</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-yellow-100 rounded-lg">
              <CircleCheck size={20} className="text-yellow-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.tasks_new}</div>
              <div className="text-xs text-gray-500">Новые</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-purple-100 rounded-lg">
              <LoaderCircle size={20} className="text-purple-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.tasks_in_progress}</div>
              <div className="text-xs text-gray-500">В процессе</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-center w-11 h-11 bg-green-100 rounded-lg">
              <BookCheck size={20} className="text-green-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.tasks_done}</div>
              <div className="text-xs text-gray-500">Завершено</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-6 w-full">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center mb-6 gap-4">
            <div className="relative flex items-center justify-center w-20 h-20 bg-blue-700 rounded-lg overflow-hidden">
              <span className="text-xl font-bold text-white">{project.name?.charAt(0) || 'П'}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                {editingField === 'name' ? (
                  <input
                    type="text"
                    className="px-2 py-1 border rounded focus:outline-none text-2xl font-semibold"
                    value={values.name}
                    autoFocus
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    onBlur={() => handleBlur('name')}
                    onKeyDown={(e) => e.key === 'Enter' && handleBlur('name')}
                    disabled={!isCurator}
                  />
                ) : (
                  <h3
                    className="text-2xl font-semibold cursor-pointer"
                    onClick={() => isCurator && setEditingField('name')}
                  >
                    {values.name || 'Без названия'}
                  </h3>
                )}
                {isCurator && (
                  <div className="relative">
                    <button
                      className="ml-4 p-2 rounded hover:bg-gray-100 text-gray-500"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <Ellipsis className="h-5 w-5" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(false);
                            handleDelete();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Удалить проект
                        </button>
                      </div>
                    )}
                  </div>
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
                      onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
                      onBlur={() => handleBlur('startDate')}
                      disabled={!isCurator}
                    />
                    <span>—</span>
                    <input
                      type="date"
                      className="px-2 py-1 border rounded focus:outline-none"
                      value={values.endDate}
                      onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
                      onBlur={() => handleBlur('endDate')}
                      disabled={!isCurator}
                    />
                  </>
                ) : (
                  <p
                    className="text-sm text-gray-600 cursor-pointer"
                    onClick={() => isCurator && setEditingField('dates')}
                  >
                    {formatDate(values.startDate)} — {formatDate(values.endDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
            {editingField === 'description' ? (
              <div className="w-full border rounded p-2">
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => toggleFormat('bold')}
                    className={`p-1 mr-2 rounded text-gray-500 ${activeFormats.bold ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    title="Жирный шрифт"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFormat('italic')}
                    className={`p-1 mr-2 rounded text-gray-500 ${activeFormats.italic ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    title="Курсив"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFormat('underline')}
                    className={`p-1 mr-2 rounded text-gray-500 ${activeFormats.underline ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    title="Подчеркнутый"
                  >
                    <Underline className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFormat('heading')}
                    className={`p-1 mr-2 rounded text-gray-500 ${activeFormats.heading ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    title="Заголовок (H2)"
                  >
                    <Heading2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSaveAndClose}
                    className="p-1 ml-auto rounded text-gray-500 hover:bg-gray-100"
                    title="Сохранить и закрыть"
                  >
                    Сохранить
                  </button>
                </div>
                <div
                  ref={descriptionRef}
                  contentEditable={isCurator}
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[100px] outline-none text-base text-gray-800 border border-transparent p-2"
                  dangerouslySetInnerHTML={{ __html: values.description || 'Нажмите для добавления описания' }}
                />
              </div>
            ) : (
              <p
                className={`text-base text-gray-600 ${isCurator ? 'cursor-pointer' : ''}`}
                onClick={() => isCurator && setEditingField('description')}
                dangerouslySetInnerHTML={{ __html: values.description || 'Нажмите для добавления описания' }}
              />
            )}
          </div>
        </div>
        <div className="flex-1 max-w-full">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <ProjectTeamMember members={project.members_info || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewPage;