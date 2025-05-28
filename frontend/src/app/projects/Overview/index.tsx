"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useGetProjectGoalsQuery,
  useGetStickyNotesQuery,
  useGetStrategicConnectionsQuery,
  useGetNotificationsQuery,
} from '@/state/api';
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
  FileDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProjectTeamMember from '@/components/Project/ProjectTeamMember';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { notoSerifBase64 } from '@/utils/Regular_base64.ts';
import { notoSerifBoldBase64 } from '@/utils/Bold_base64.ts';

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
    pollingInterval: 10000,
  });
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery({ projectId });
  const { data: goals = [], isLoading: goalsLoading } = useGetProjectGoalsQuery({ projectId });
  const { data: stickyNotes = [], isLoading: notesLoading } = useGetStickyNotesQuery({ projectId });
  const { data: connections = [], isLoading: connectionsLoading } = useGetStrategicConnectionsQuery({ projectId });
  const { data: notifications = [], isLoading: notificationsLoading } = useGetNotificationsQuery({ projectId });

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
        name: project.name || 'Путешествуй с нами',
        description: project.description || 'Онлайн-сервис для планирования путешествий',
        startDate: project.startDate?.split('T')[0] || '2025-04-26',
        endDate: project.endDate?.split('T')[0] || '2025-05-11',
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

  const handleSaveAsPDF = () => {
    if (!project) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yOffset = margin;
    let sectionNumber = 1;

    pdf.addFileToVFS('NotoSerif-Regular.ttf', notoSerifBase64.split(',')[1]);
    pdf.addFont('NotoSerif-Regular.ttf', 'NotoSerif', 'normal');
    pdf.addFileToVFS('NotoSerif-Bold.ttf', notoSerifBoldBase64.split(',')[1]);
    pdf.addFont('NotoSerif-Bold.ttf', 'NotoSerif', 'bold');
    pdf.setFont('NotoSerif');
    const checkPageOverflow = (additionalHeight: number) => {
      if (yOffset + additionalHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yOffset = margin;
        addHeaderFooter();
      }
    };

    const addText = (text: string, fontSize = 12, maxWidth = pageWidth - 2 * margin, bold = false) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      checkPageOverflow(lines.length * (fontSize * 0.4));
      pdf.setFontSize(fontSize);
      pdf.addFileToVFS('NotoSerif-Regular.ttf', notoSerifBase64.split(',')[1]);
      pdf.setFont('NotoSerif', bold ? 'bold' : 'normal');
      pdf.text(lines, margin, yOffset);
      yOffset += lines.length * (fontSize * 0.4) + 2;
    };

    const addSectionTitle = (title: string) => {
      checkPageOverflow(10);
      pdf.setFontSize(14);
      pdf.setFont('NotoSerif', 'bold');
      pdf.text(`${sectionNumber}. ${title}`, margin, yOffset);
      yOffset += 8;
      sectionNumber++;
    };

    const addSubSectionTitle = (title: string, parentSection: number) => {
      checkPageOverflow(8);
      pdf.setFontSize(12);
      pdf.setFont('NotoSerif', 'bold');
      pdf.text(`${parentSection}.${sectionNumber - 1}. ${title}`, margin + 5, yOffset);
      yOffset += 6;
    };

    const addHeaderFooter = () => {
      pdf.setFontSize(10);
      pdf.setFont('NotoSerif', 'normal');
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        if (i > 2) {
          pdf.text(`Страница ${i - 2}`, pageWidth - margin - 20, pdf.internal.pageSize.getHeight() - 10);
        }
      }
    };
    pdf.setFontSize(16);
    pdf.setFont('NotoSerif', 'normal');
    yOffset = 30;
    pdf.text('«МОСКОВСКИЙ ПОЛИТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ»', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;
    pdf.setFontSize(18);
    pdf.setFont('NotoSerif', 'normal');
    pdf.text('ОТЧЕТ О ПРОЕКТЕ', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 50;
    pdf.setFontSize(16);
    pdf.text(`«${project.name || 'Путешествуй с нами'}»`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 50;
    pdf.setFontSize(12);
    pdf.text('Выполнил: Маслянко Екатерина', margin, yOffset);
    yOffset += 8;
    pdf.text(`Куратор проекта: ${project.curator?.username || 'Не указан'}`, margin, yOffset);
    yOffset += 20;
    pdf.text('Проверил:', margin, yOffset);
    yOffset += 8;
    pdf.text('Руководитель отдела: Не указан', margin, yOffset);
    yOffset += 80;
    pdf.text('Москва', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 8;
    pdf.text('2025', pageWidth / 2, yOffset, { align: 'center' });
    pdf.addPage();
    yOffset = margin;
    pdf.setFontSize(14);
    pdf.setFont('NotoSerif', 'normal');
    pdf.text('СОДЕРЖАНИЕ', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.setFont('NotoSerif', 'normal');
    const toc = [
      { title: 'Введение', section: 1 },
      { title: 'Характеристики проекта', section: 2 },
      { title: 'Участники проекта', section: 3 },
      { title: 'Цели проекта', section: 4 },
      { title: 'Задачи и подзадачи', section: 5 },
      { title: 'Заметки', section: 6 },
      { title: 'Стратегические связи', section: 7 },
      { title: 'Уведомления', section: 8 },
    ];
    toc.forEach((item) => {
      checkPageOverflow(6);
      pdf.text(`${item.section}. ${item.title}`, margin, yOffset);
      yOffset += 6;
    });
    pdf.addPage();
    yOffset = margin;
    addHeaderFooter();
    addSectionTitle('Введение');
    const descriptiText = values.description.replace(/<[^>]+>/g, '') || 'Онлайн-сервис для планирования путешествий';
    addText(`«Настоящий отчет посвящен проекту ${project.name || 'Путешествуй с нами'}, который ${descriptiText || 'Описание проекта'}»`);

    addSectionTitle('Характеристики проекта');
    addSubSectionTitle('Основные данные', 1);
    addText(`Название проекта: ${project.name || 'Путешествуй с нами'}`);
    const descriptionText = values.description.replace(/<[^>]+>/g, '') || 'Онлайн-сервис для планирования путешествий';
    addText(`Описание: ${descriptionText}`);
    addText(`Дата начала: ${formatDate(values.startDate)}`);
    addText(`Дата завершения: ${formatDate(values.endDate)}`);
    addText(`Куратор: ${project.curator?.username || 'Не указан'}`);
    addSubSectionTitle('Метрики задач', 2);
    addText(`Всего задач: ${project.total_tasks || 0}`);
    addText(`Всего подзадач: ${project.total_subtasks || 0}`);
    addText(`Новые задачи: ${project.tasks_new || 0}`);
    addText(`Задачи в процессе: ${project.tasks_in_progress || 0}`);
    addText(`Завершенные задачи: ${project.tasks_done || 0}`);

    addSectionTitle('Участники проекта');
    addSubSectionTitle('Состав участников', 1);
    const members = project.members_info || [];
    if (members.length > 0) {
      checkPageOverflow(20);
      autoTable(pdf, {
        startY: yOffset,
        head: [['Имя', 'Email', 'Роль', 'Задачи', 'Подзадачи', 'Рекомендация']],
        body: members.map((member) => [
          member.username || '—',
          member.email || '—',
          member.role_display || '—',
          member.analytics?.total_tasks || 0,
          member.analytics?.total_subtasks || 0,
          member.analytics?.recommendation || '—',
        ]),
        styles: { font: 'NotoSerif', fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [105, 105, 105], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });
      yOffset = (pdf as any).lastAutoTable.finalY + 5;
    } else {
      addText('Участники не найдены');
    }
    addSubSectionTitle('Команды', 2);
    const teams = project.teams || [];
    if (teams.length > 0) {
      teams.forEach((team) => {
        addText(`Команда: ${team.name || 'Без названия'}`, 12, pageWidth - 2 * margin, true);
        addText(`Описание: ${team.description || 'Нет описания'}`);
        const teamMembers = team.members_info || [];
        if (teamMembers.length > 0) {
          checkPageOverflow(20);
          autoTable(pdf, {
            startY: yOffset,
            head: [['Имя', 'Email', 'Роль', 'Задачи', 'Подзадачи', 'Рекомендация']],
            body: teamMembers.map((member) => [
              member.username || '—',
              member.email || '—',
              member.role_display || '—',
              member.analytics?.total_tasks || 0,
              member.analytics?.total_subtasks || 0,
              member.analytics?.recommendation || '—',
            ]),
            styles: { font: 'NotoSerif', fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [105, 105, 105], textColor: [255, 255, 255] },
            margin: { left: margin, right: margin },
          });
          yOffset = (pdf as any).lastAutoTable.finalY + 5;
        } else {
          addText('Участники команды не найдены');
        }
      });
    } else {
      addText('Команды не найдены');
    }
    addSectionTitle('Цели проекта');
    if (goals.length > 0) {
      goals.forEach((goal) => {
        addText(`${goal.title || 'Без названия'}`, 12);
        addText(`  Описание: ${goal.description || 'Нет описания'}`, 10);
        addText(`  Статус: ${goal.status || '—'}`, 10);
        addText(`  Прогресс: ${goal.progress || 0}%`, 10);
        addText(`  Создано: ${formatDate(goal.created_at)}`, 10);
      });
    } else {
      addText('Цели не найдены');
    }

    addSectionTitle('Задачи и подзадачи');
    addSubSectionTitle('Задачи', 1);
    if (tasks.length > 0) {
      checkPageOverflow(20);
      autoTable(pdf, {
        startY: yOffset,
        head: [['Название', 'Описание', 'Статус', 'Приоритет', 'Исполнители', 'Срок', 'Сложность']],
        body: tasks.map((task) => [
          task.title || '—',
          task.description || '—',
          task.status || '—',
          task.priority || '—',
          task.assignees?.map((a: any) => a.username).join(', ') || '—',
          formatDate(task.due_date),
          task.stars || 0,
        ]),
        styles: { font: 'NotoSerif', fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [105, 105, 105], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
        columnStyles: { 1: { cellWidth: 50 } },
      });
      yOffset = (pdf as any).lastAutoTable.finalY + 5;
    } else {
      addText('Задачи не найдены');
    }
    addSubSectionTitle('Подзадачи', 2);
    const subtasks = tasks.flatMap((task: any) => task.subtasks || []);
    if (subtasks.length > 0) {
      checkPageOverflow(20);
      autoTable(pdf, {
        startY: yOffset,
        head: [['Название', 'Описание', 'Статус', 'Приоритет', 'Исполнители', 'Срок', 'Сложность']],
        body: subtasks.map((subtask: any) => [
          subtask.title || '—',
          subtask.description || '—',
          subtask.status || '—',
          subtask.priority || '—',
          subtask.assigned_to?.map((a: any) => a.username).join(', ') || '—',
          formatDate(subtask.due_date),
          subtask.stars || 0,
        ]),
        styles: { font: 'NotoSerif', fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [105, 105, 105], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
        columnStyles: { 1: { cellWidth: 50 } },
      });
      yOffset = (pdf as any).lastAutoTable.finalY + 5;
    } else {
      addText('Подзадачи не найдены');
    }
    addSectionTitle('Заметки');
    if (stickyNotes.length > 0) {
      stickyNotes.forEach((note: any) => {
        addText(`${note.text || 'Без текста'}`, 12);
        addText(`  Автор: ${note.author?.username || '—'}`, 10);
        addText(`  Создано: ${formatDate(note.created_at)}`, 10);
      });
    } else {
      addText('Заметки не найдены');
    }
    addSectionTitle('Стратегические связи');
    if (connections.length > 0) {
      connections.forEach((conn: any) => {
        addText(`Тип: ${conn.connection_type || '—'}, Метка: ${conn.label || '—'}`, 12);
      });
    } else {
      addText('Стратегические связи не найдены');
    }
    addSectionTitle('Уведомления');
    if (notifications.length > 0) {
      notifications.forEach((notif: any) => {
        addText(`${notif.message || '—'}`, 12);
        addText(`  Создано: ${formatDate(notif.created_at)}`, 10);
        addText(`  Прочитано: ${notif.is_read ? 'Да' : 'Нет'}`, 10);
      });
    } else {
      addText('Уведомления не найдены');
    }
    addHeaderFooter();
    pdf.save(`project_${projectId}_report.pdf`);
  };

  if (
    projLoading ||
    tasksLoading ||
    goalsLoading ||
    notesLoading ||
    connectionsLoading ||
    notificationsLoading ||
    !project
  ) {
    return <div className="p-4">Загрузка...</div>;
  }

  const isCurator = project.curator?.id === user?.id;

  return (
    <div className="p-6 bg-gray-50 dark:bg-dark-bg">
      <div className="flex gap-4 mb-8">
        <div className="flex-1 flex gap-4">
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
            <div className="flex items-center justify-center w-11 h-11 bg-blue-100 rounded-lg">
              <Clock size={20} className="text-blue-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.total_tasks || 2}</div>
              <div className="text-xs text-gray-500">Всего задач</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
            <div className="flex items-center justify-center w-11 h-11 bg-rose-100 rounded-lg">
              <Calendar size={20} className="text-rose-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.total_subtasks || 1}</div>
              <div className="text-xs text-gray-500">Всего подзадач</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
            <div className="flex items-center justify-center w-11 h-11 bg-yellow-100 rounded-lg">
              <CircleCheck size={20} className="text-yellow-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.tasks_new || 0}</div>
              <div className="text-xs text-gray-500">Новые</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
            <div className="flex items-center justify-center w-11 h-11 bg-purple-100 rounded-lg">
              <LoaderCircle size={20} className="text-purple-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.tasks_in_progress || 1}</div>
              <div className="text-xs text-gray-500">В процессе</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full p-4 rounded-lg shadow-sm bg-white dark:bg-dark-bg dark:text-dark-text dark:border dark:border-gray-800">
            <div className="flex items-center justify-center w-11 h-11 bg-green-100 rounded-lg">
              <BookCheck size={20} className="text-green-700" />
            </div>
            <div className="ml-3 text-right">
              <div className="font-bold text-2xl">{project.tasks_done || 1}</div>
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
                    {values.name || 'Путешествуй с нами'}
                  </h3>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAsPDF}
                    className="flex items-center px-2.5 py-2.5 text-base bg-indigo-100 rounded-lg text-indigo-700 hover:text-white hover:bg-indigo-600 transition-colors"
                  >
                    <FileDown className="h-5 w-5" />
                  </button>
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
          <div className="bg-white rounded-md shadow-md p-4 border dark:bg-dark-bg dark:text-white dark:border-gray-800">
            <ProjectTeamMember members={project.members_info || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewPage;