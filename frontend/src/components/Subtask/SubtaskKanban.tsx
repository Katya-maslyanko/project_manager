"use client";
import React, { useEffect, useState } from "react";
import SubtaskCard from "@/components/Subtask/SubtaskCard"; 
import {
  useUpdateSubTaskStatusMutation,
  useDeleteSubtaskMutation,
  useUpdateSubtaskMutation,
  useGetUsersQuery,
} from "@/state/api";
import { Subtask } from "@/state/api";
import { LoaderCircle, CircleCheck, BookCheck, Plus } from "lucide-react";
import SubtaskSidebar from "@/components/Subtask/SubtaskSidebar";
import DeleteConfirmationModal from "@/components/Task/modal/DeleteConfirmationModal";
import AddSubtaskModal from "./AddSubtask";

interface Props {
  subtasks: Subtask[];
}

const SubtaskKanbanPage: React.FC<Props> = ({ subtasks }) => {
  const [columns, setColumns] = useState<Record<string, Subtask[]>>({});
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [updateStatus] = useUpdateSubTaskStatusMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [isSubtaskSidebarOpen, setIsSubtaskSidebarOpen] = useState(false);
  const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] = useState(false);
  const [updateSubtask] = useUpdateSubtaskMutation();
  const { data: users = [] } = useGetUsersQuery();
  const [draggedSubtask, setDraggedSubtask] = useState<Subtask | null>(null);

  const statuses = ['Новая', 'В процессе', 'Завершено'];

  useEffect(() => {
    const cols: Record<string, Subtask[]> = {};
    statuses.forEach(s => cols[s] = subtasks.filter(t => t.status === s));
    setColumns(cols);
  }, [subtasks]);

  const handleStatusChange = async (subtaskId: number, newStatus: string) => {
    await updateStatus({ id: subtaskId, status: newStatus });
  };

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* К исполнению */}
      <div
        className="p-4 border border-gray-200 rounded-md dark:border-gray-800 dark:bg-dark-bg"
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
              {subtasks.filter((subtask) => subtask.status === "Новая").length}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {subtasks
            .filter((subtask) => subtask.status === "Новая")
            .map((subtask) => (
              <SubtaskCard
                key={subtask.id}
                subtask={subtask}
                onStatusChange={(status) => {
                  handleStatusChange(subtask.id, status);
                }}
                onOpen={() => openSubtaskSidebar(subtask)}
                onDragStart={() => setDraggedSubtask(subtask)}
              />
            ))}
          <button className="text-gray-600 font-semibold mt-2 p-3 w-full rounded-md bg-gray-100 flex items-center justify-center dark:bg-gray-700 dark:text-white"
            onClick={openAddSubtaskModal}
          >
            <Plus className="text-gray-600 w-5 h-5 mr-2 dark:text-white" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* В процессе */}
      <div
        className="p-4 border border-gray-200 rounded-md dark:border-gray-800 dark:bg-dark-bg"
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
              {subtasks.filter((subtask) => subtask.status === "В процессе").length}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {subtasks
            .filter((subtask) => subtask.status === "В процессе")
            .map((subtask) => (
              <SubtaskCard
                key={subtask.id}
                subtask={subtask}
                onStatusChange={(status) => handleStatusChange(subtask.id, status)}
                onOpen={() => openSubtaskSidebar(subtask)}
                onDragStart={() => setDraggedSubtask(subtask)}
              />
            ))}
          <button
            className="text-gray-600 font-semibold mt-2 p-3 w-full rounded-md bg-gray-100 flex items-center justify-center dark:bg-gray-700 dark:text-white"
            onClick={openAddSubtaskModal}
          >
            <Plus className="text-gray-600 w-5 h-5 mr-2 dark:text-white" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* Завершено */}
      <div
        className="p-4 border border-gray-200 rounded-md dark:border-gray-800 dark:bg-dark-bg"
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
              {subtasks.filter((subtask) => subtask.status === "Завершено").length}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {subtasks
            .filter((subtask) => subtask.status === "Завершено")
            .map((subtask) => (
              <SubtaskCard
                key={subtask.id}
                subtask={subtask}
                onStatusChange={handleStatusChange}
                onOpen={() => openSubtaskSidebar(subtask)}
                onDragStart={() => setDraggedSubtask(subtask)}
              />
            ))}
          <button
            className="text-gray-600 font-semibold mt-2 p-3 w-full rounded-md bg-gray-100 flex items-center justify-center dark:bg-gray-700 dark:text-white"
            onClick={openAddSubtaskModal}
          >
            <Plus className="text-gray-600 w-5 h-5 mr-2 dark:text-white" /> Добавить задачу
          </button>
        </div>
      </div>

      {/* Боковая панель подзадач */}
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
      {isDelete && selectedSubtask && (
        <DeleteConfirmationModal
          isOpen={isDelete}
          onClose={() => setIsDelete(false)}
          onDelete={async () => {
            await deleteSubtask(selectedSubtask.id);
            setIsDelete(false);
            setSelectedSubtask(null);
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

export default SubtaskKanbanPage;