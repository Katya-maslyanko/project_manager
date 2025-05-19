import React, { useState, useRef, useEffect } from "react";
import { Ellipsis, CornerUpLeft } from "lucide-react";
import {
  useGetCommentsByTaskIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  Comment,
} from "@/state/api";
import { useAuth } from "@/context/AuthContext";

interface CommentsSectionProps {
  taskId: number;
  subtaskId?: number | null;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId }) => {
  const { user } = useAuth();
  const {
    data: comments = [],
    isLoading,
    isError,
  } = useGetCommentsByTaskIdQuery({ taskId });

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let content = editingCommentId ? editingContent : newComment;
    const payload = { taskId, content };
    if (replyTo && !editingCommentId) {
      // prepend mention
      payload.content = `@${replyTo.user.username} ` + content;
    }
    if (editingCommentId) {
      await updateComment({ id: editingCommentId, content }).unwrap();
      setEditingCommentId(null);
      setEditingContent("");
    } else {
      await createComment(payload).unwrap();
      setNewComment("");
      setReplyTo(null);
    }
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyTo(comment);
    setEditingCommentId(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setDropdownOpen(null);
  };

  const handleDeleteClick = async (commentId: number) => {
    await deleteComment(commentId).unwrap();
    setDropdownOpen(null);
  };

  const toggleDropdown = (commentId: number) => {
    setDropdownOpen(dropdownOpen === commentId ? null : commentId);
  };

  if (isLoading) return <p className="text-gray-500">Загрузка комментариев...</p>;
  if (isError) return <p className="text-red-500">Ошибка загрузки комментариев.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold">Комментарии</h3>

      {user ? (
        <form onSubmit={handleCommentSubmit} className="mt-4">
          {replyTo && (
            <div className="mb-2 text-sm text-gray-600">
              Ответ пользователю <span className="font-semibold">{replyTo.user.username}</span>
              <button
                type="button"
                className="ml-2 text-red-500"
                onClick={() => setReplyTo(null)}
              >×</button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="w-full border border-gray-200 rounded-md shadow-sm p-2 dark:border-gray-800 dark:bg-gray-700 dark:text-white"
            rows={3}
            value={editingCommentId ? editingContent : newComment}
            onChange={(e) =>
              editingCommentId
                ? setEditingContent(e.target.value)
                : setNewComment(e.target.value)
            }
            placeholder="Добавьте комментарий..."
            required
          />
          <button
            type="submit"
            className="mt-2 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white py-2 px-4"
          >
            {editingCommentId ? "Сохранить" : "Отправить"}
          </button>
        </form>
      ) : (
        <p className="text-gray-500">Пожалуйста, войдите в систему, чтобы оставить комментарий.</p>
      )}

      <div className="mt-4 space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="pt-2">
            <footer className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold">
                  {comment.user.username.charAt(0).toUpperCase()}
                </span>
                <p className="ml-2 flex items-center">
                  <span className="font-semibold">{comment.user.username}</span>
                  <time
                    className="block text-gray-500 text-sm pl-2"
                    dateTime={comment.created_at}
                  >
                    {new Date(comment.created_at).toLocaleString()}
                  </time>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-1 rounded hover:bg-gray-200"
                  onClick={() => handleReplyClick(comment)}
                >
                  <CornerUpLeft className="h-5 w-5 text-gray-500" />
                </button>
                {comment.user.id === user?.id && (
                  <div className="relative dropdown">
                    <button
                      className="p-1 rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => toggleDropdown(comment.id)}
                    >
                      <Ellipsis className="h-5 w-5 text-gray-500" />
                    </button>
                    {dropdownOpen === comment.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => handleEditClick(comment)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteClick(comment.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </footer>
            <p className="mt-1 ml-12 text-gray-700">{comment.content}</p>
          </article>
        ))}

        {comments.length === 0 && <p className="text-gray-500">Нет комментариев</p>}
      </div>
    </div>
  );
};

export default CommentsSection;