"use client";
import React, { useState } from "react";
import { Subtask } from "@/state/api";
import {
  useUpdateSubTaskStatusMutation,
  useDeleteSubtaskMutation,
  useUpdateSubtaskMutation,
  useGetUsersQuery,
} from "@/state/api";
import SubtaskSidebar from "@/components/Subtask/SubtaskSidebar";
import SubtaskCard from "@/components/Subtask/SubtaskCardList";
import { Plus, CircleCheck, LoaderCircle, BookCheck } from "lucide-react";
import AddSubtaskModal from "./AddSubtask";

interface Props {
  subtasks: Subtask[];
}

const SubtaskListPage: React.FC<Props> = ({ subtasks }) => {
  const { data: users = [] } = useGetUsersQuery();
  const [updateStatus] = useUpdateSubTaskStatusMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();

  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [isSubtaskSidebarOpen, setIsSubtaskSidebarOpen] = useState(false);
  const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] = useState(false);
  const [draggedSubtask, setDraggedSubtask] = useState<Subtask | null>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (draggedSubtask) {
      await updateStatus({ id: draggedSubtask.id, status });
      setDraggedSubtask(null);
    }
  };

  const openSubtaskSidebar = (subtask: Subtask) => {
    setSelectedSubtask(subtask);
    setIsSubtaskSidebarOpen(true);
  };

  const closeSubtaskSidebar = () => {
    setIsSubtaskSidebarOpen(false);
    setSelectedSubtask(null);
  };

  const openAddSubtaskModal = () => {
    setIsAddSubtaskModalOpen(true);
  };

  const closeAddSubtaskModal = () => {
    setIsAddSubtaskModalOpen(false);
  };

  return (
    <div style={{ borderLeft: 'none' }} className="border border-gray-200 rounded-md p-4 grid grid-cols-1">
      {/* К исполнению */}
      <div
        className="p-4 mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Новая')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-yellow-200 bg-yellow-100 rounded-lg text-yellow-700 duration-200 transition-colors">
              <CircleCheck className="h-4 w-4 mr-2" />
              К исполнению
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
              {subtasks.filter(subtask => subtask.status === 'Новая').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {subtasks.filter(subtask => subtask.status === 'Новая').map(subtask => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  users={users}
                  onDragStart={() => setDraggedSubtask(subtask)}
                  onOpen={() => openSubtaskSidebar(subtask)}
                  onStatusChange={async (newStatus: any) => await updateStatus({ id: subtask.id, status: newStatus })}
                />
              ))}
            </tbody>
          </table>
          <button className="text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center"
            onClick={openAddSubtaskModal}>
            <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* В процессе */}
      <div
        className="p-4 mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'В процессе')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-purple-200 bg-purple-100 rounded-lg text-purple-700 duration-200 transition-colors">
              <LoaderCircle className="h-4 w-4 mr-2" />
              В процессе
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
              {subtasks.filter(subtask => subtask.status === 'В процессе').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {subtasks.filter(subtask => subtask.status === 'В процессе').map(subtask => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  users={users}
                  onDragStart={() => setDraggedSubtask(subtask)}
                  onOpen={() => openSubtaskSidebar(subtask)}
                  onStatusChange={async (newStatus: any) => await updateStatus({ id: subtask.id, status: newStatus })}
                />
              ))}
            </tbody>
          </table>
          <button className="text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center"
            onClick={openAddSubtaskModal}>
            <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* Завершено */}
      <div
        className="p-4 mb-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Завершено')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="flex items-center px-2 py-1 text-sm border font-semibold border-green-200 bg-green-100 rounded-lg text-green-700 duration-200 transition-colors">
              <BookCheck className="h-4 w-4 mr-2" />
              Завершено
            </span>
            <span className="text-sm bg-gray-200 border text-gray-600 ml-2 px-2 py-1 rounded">
              {subtasks.filter(subtask => subtask.status === 'Завершено').length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto sm:rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm bg-gray-100 border rounded-md">
                <th className="py-3 px-4">Задача</th>
                <th className="py-3 px-4">Описание</th>
                <th className="py-3 px-4">Исполнители</th>
                <th className="py-3 px-4 min-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap">Срок выполнения</th>
                <th className="py-3 px-4">Приоритет</th>
                <th className="py-3 px-4">Тэг</th>
                <th className="py-3 px-4">Прогресс</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
 {subtasks.filter(subtask => subtask.status === 'Завершено').map(subtask => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  users={users}
                  onDragStart={() => setDraggedSubtask(subtask)}
                  onOpen={() => openSubtaskSidebar(subtask)}
                  onStatusChange={async (newStatus: any) => await updateStatus({ id: subtask.id, status: newStatus })}
                />
              ))}
            </tbody>
          </table>
          <button className="text-gray-600 font-semibold mt-2 mb-2 p-1 flex items-center justify-center"
            onClick={openAddSubtaskModal}>
            <Plus className="text-gray-600 w-5 h-5" /> Добавить задачу
          </button>
        </div>
      </div>

      {isSubtaskSidebarOpen && selectedSubtask && (
        <SubtaskSidebar
          subtask={selectedSubtask}
          taskAssignees={users.filter((user) => 
            selectedSubtask.assigned_to?.some(a => a.id === user.id)
          )}
          onClose={closeSubtaskSidebar}
          onDelete={async () => {
            await deleteSubtask(selectedSubtask.id);
            closeSubtaskSidebar();
          }}
          onEdit={async (updatedSubtask) => {
            await updateSubtask(updatedSubtask);
          }}
          onComplete={async () => {
            await updateStatus({ id: selectedSubtask.id, status: "Завершено" });
            closeSubtaskSidebar();
          }}
        />
      )}
      {isAddSubtaskModalOpen && (
        <AddSubtaskModal
          isOpen={isAddSubtaskModalOpen}
          onClose={closeAddSubtaskModal}
        />
      )}
    </div>
  );
};

export default SubtaskListPage;