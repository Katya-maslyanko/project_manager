import React, { useState, useEffect, useRef } from "react";
import { Comment, User } from "@/state/api";
import { Ellipsis } from "lucide-react";
import { useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } from "@/state/api";

interface CommentsSectionProps {
  comments: Comment[];
  users: User[];
  taskId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, users, taskId }) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null); // Для отслеживания открытого дропдауна

  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCommentId) {
      await updateComment({ id: editingCommentId, content: editingContent });
      setEditingCommentId(null);
      setEditingContent("");
    } else {
      const result = await createComment({ taskId, content: newComment });
      if ('data' in result) {
        setNewComment(""); // Очистка поля ввода после успешного добавления
      }
    }
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleDeleteClick = async (commentId: number) => {
    await deleteComment(commentId);
  };

  const toggleDropdown = (commentId: number) => {
    setDropdownOpen(dropdownOpen === commentId ? null : commentId);
  };

  // Закрытие дропдауна при клике вне его
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      setDropdownOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold">Комментарии</h3>
      <form onSubmit={handleCommentSubmit} className="mt-4">
        <textarea
          className="w-full border border-gray-200 rounded-md shadow-sm p-2"
          rows={3}
          value={editingCommentId ? editingContent : newComment}
          onChange={(e) => editingCommentId ? setEditingContent(e.target.value) : setNewComment(e.target.value)}
          placeholder="Добавьте комментарий..."
          required
        />
        <button type="submit" className="mt-2 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white py-2 px-4">
          {editingCommentId ? "Сохранить" : "Отправить"}
        </button>
      </form>
      <div className="mt-1 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const user = users.find((user) => user.id === comment.user.id);
            return (
              <article key={comment.id} className="pt-2">
                <footer className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold">
                      {user?.username?.charAt(0) || "?"}
                    </span>
                    <p className="ml-2 flex items-center">
                      <span className="font-semibold">{user?.username}</span>
                      <time className="block text-gray-500 text-sm pl-2" dateTime={comment.created_at}>
                        {new Date(comment.created_at).toLocaleString()}
                      </time>
                    </p>
                  </div>
                  <div className="relative dropdown">
                    <button className="p-1 rounded cursor-pointer hover:bg-gray-200" onClick={() => toggleDropdown(comment.id)}>
                      <Ellipsis className="h-5 w-5 text-gray-500" />
                    </button>
                    {dropdownOpen === comment.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button onClick={() => handleEditClick(comment)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Редактировать</button>
                        <button onClick={() => handleDeleteClick(comment.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100">Удалить</button>
                      </div>
                    )}
                  </div>
                </footer>
                <p className="mt-1 ml-12 text-gray-500 text-base">{comment.content}</p>
              </article>
            );
          })
        ) : (
          <p className="text-gray-500">Нет комментариев</p>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;