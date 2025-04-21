import React, { useState, useEffect, ChangeEvent } from "react";
import { X, Ellipsis, Flag, Calendar, Users, Tag, TrendingUp } from "lucide-react";
import {
  Subtask,
  useGetTagsQuery,
  useGetUsersQuery,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} from "@/state/api";
import { Plus } from "lucide-react";
import SubtaskAssigneeModal from "./modal/SubtaskAssigneeModal";
import DeleteConfirmationModal from "./modal/DeleteConfirmationModal";

interface SubtaskSidebarProps {
  subtask: Subtask | null;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: (fields: Partial<Subtask>) => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};

const SubtaskSidebar: React.FC<SubtaskSidebarProps> = ({ subtask, onClose, onDelete, onEdit }) => {
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState<string | null>(null);
  const [due, setDue] = useState<string | null>(null);
  const [priority, setPriority] = useState("");
  const [tagId, setTagId] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [assigned, setAssigned] = useState<number[]>([]);

  const [editingField, setEditingField] = useState<
    "title" | "desc" | "dates" | "priority" | "tag" | "points" | null
  >(null);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (subtask) {
      setTitle(subtask.title);
      setDesc(subtask.description);
      setStart(subtask.start_date);
      setDue(subtask.due_date);
      setPriority(subtask.priority);
      setTagId(subtask.tag ? subtask.tag.id : null);
      setPoints(subtask.points);
      setAssigned(subtask.assigned_to.map(u => u.id));
    }
  }, [subtask]);

  const commonInput = "w-full px-1 py-1 border rounded-md focus:outline-none focus:border-gray-200";
  const commonSelect = "px-1 py-1 border rounded-md focus:outline-none focus:border-gray-200";

  const save = async (fields: Partial<Subtask>) => {
    if (!subtask) return;
    try {
      await updateSubtask({ id: subtask.id, ...fields }).unwrap();
      onEdit && onEdit(fields);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAssignee = (userId: number) => {
    const list = assigned.includes(userId)
      ? assigned.filter(id => id !== userId)
      : [...assigned, userId];
    setAssigned(list);
    save({ assigned_to_ids: list });
  };

  const handleDelete = async () => {
    if (!subtask) return;
    await deleteSubtask(subtask.id).unwrap();
    onDelete();
  };

  if (!subtask) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-lg z-40 flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Подзадача</h2>
        <div className="flex items-center">
          <button className="p-1 rounded hover:bg-gray-100" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <Ellipsis className="h-5 w-5 text-gray-500" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-4 top-12 bg-white border rounded shadow">
              <button onClick={() => setDeleteModalOpen(true)} className="px-4 py-2 text-red-600 hover:bg-gray-50">Удалить</button>
            </div>
          )}
          <button className="ml-2 p-1 rounded hover:bg-gray-100" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          {editingField === "title" ? (
            <input
              type="text"
              className={commonInput}
              value={title}
              autoFocus
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              onBlur={() => { setEditingField(null); save({ title }); }}
            />
          ) : (
            <h3 onClick={() => setEditingField("title")} className="text-lg font-semibold cursor-pointer">
              {title}
            </h3>
          )}
        </div>
        <div>
          {editingField === "desc" ? (
            <textarea
              className={commonInput + " resize-none"}
              value={desc}
              rows={3}
              autoFocus
              onChange={e => setDesc(e.target.value)}
              onBlur={() => { setEditingField(null); save({ description: desc }); }}
            />
          ) : (
            <p onClick={() => setEditingField("desc")} className="text-sm text-gray-600 cursor-pointer">
              {desc || "Нажмите, чтобы добавить описание"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Calendar className="h-5 w-5" />
            <span>Срок:</span>
          </div>
          {editingField === "dates" ? (
            <div className="flex space-x-2">
              <input type="date" className={commonInput} value={start || ""} onChange={e => setStart(e.target.value)} onBlur={() => { setEditingField(null); save({ start_date: start, due_date: due }); }} />
              <input type="date" className={commonInput} value={due || ""} onChange={e => setDue(e.target.value)} onBlur={() => { setEditingField(null); save({ start_date: start, due_date: due }); }} />
            </div>
          ) : (
            <span onClick={() => setEditingField("dates")} className="cursor-pointer text-sm text-gray-600">
              {formatDate(start)} — {formatDate(due)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm"><Flag className="h-5 w-5" /><span>Приоритет:</span></div>
          {editingField === "priority" ? (
            <select className={commonSelect} value={priority} autoFocus onChange={e => setPriority(e.target.value)} onBlur={() => { setEditingField(null); save({ priority }); }}>
              <option>Высокий</option>
              <option>Средний</option>
              <option>Низкий</option>
            </select>
          ) : (
            <div onClick={() => setEditingField("priority")} className="cursor-pointer text-sm">
              {priority}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm"><Tag className="h-5 w-5" /><span>Тэг:</span></div>
          {editingField === "tag" ? (
            <select className={commonSelect} value={tagId ?? ""} autoFocus onChange={e => setTagId(Number(e.target.value))} onBlur={() => { setEditingField(null); save({ tag_id: tagId }); }}>
              <option value="">Нет</option>
              {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <div onClick={() => setEditingField("tag")} className="cursor-pointer text-sm">
              {subtask.tag?.name || "Нет тега"}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm"><TrendingUp className="h-5 w-5" /><span>Прогресс:</span></div>
          {editingField === "points" ? (
            <input type="number" className={commonInput + " w-16"} value={points} autoFocus onChange={e => setPoints(Number(e.target.value))} onBlur={() => { setEditingField(null); save({ points }); }} />
          ) : (
            <span onClick={() => setEditingField("points")} className="cursor-pointer text-sm">
              {points}%
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 text-sm"><Users className="h-5 w-5" /><span>Исполнители:</span></div>
          <div className="flex -space-x-2 cursor-pointer" onClick={() => setAssigneeModalOpen(true)}>
            {assigned.map((id, idx) => {
              const u = users.find(u => u.id === id);
              return u ? (
                <div key={id} className="w-8 h-8 rounded-full border bg-gray-100 flex items-center justify-center">
                  {u.username.charAt(0).toUpperCase()}
                </div>
              ) : null;
            })}
            <div className="pl-2">
              <Plus className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubtaskAssigneeModal
        isOpen={assigneeModalOpen}
        onClose={() => setAssigneeModalOpen(false)}
        users={users}
        selectedAssignees={assigned}
        onAssigneeToggle={toggleAssignee}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SubtaskSidebar;