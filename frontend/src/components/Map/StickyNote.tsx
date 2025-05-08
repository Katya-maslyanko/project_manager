import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StickyNoteProps {
  id: number;
  text: string;
  position_x: number;
  position_y: number;
  author: {
    id: number;
    username: string;
  };
}

interface StickyNoteComponentProps {
  sticky: StickyNoteProps;
  onPositionChange: (id: number, x: number, y: number) => void;
  onTextChange: (id: number, text: string) => void;
  onDelete: (id: number) => void;
}

const StickyNoteComponent: React.FC<StickyNoteComponentProps> = ({ sticky, onPositionChange, onTextChange, onDelete }) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [text, setText] = useState(sticky.text || 'Новый комментарий...');
  const [position, setPosition] = useState({ x: sticky.position_x, y: sticky.position_y });

  useEffect(() => {
    setPosition({ x: sticky.position_x, y: sticky.position_y });
    setText(sticky.text || 'Новый комментарий...');
  }, [sticky.position_x, sticky.position_y, sticky.text]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({ x: newX, y: newY });
      onPositionChange(sticky.id, newX, newY);
    }
  }, [isDragging, startPos, onPositionChange, sticky.id]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    const newText = text.trim() === '' ? 'Новый комментарий...' : text;
    setText(newText);
    if (user?.id === sticky.author.id) {
      onTextChange(sticky.id, newText);
    }
  };

  const handleFocus = () => {
    if (text === 'Новый комментарий...') {
      setText('');
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div
      className="absolute bg-yellow-100 p-2 rounded shadow-md w-48 z-10"
      style={{ left: position.x, top: position.y, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      {user?.id === sticky.author.id ? (
        <textarea
          className="w-full h-32 bg-transparent resize-none focus:outline-none text-sm"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        />
      ) : (
        <p className="text-sm" style={{ pointerEvents: 'none' }}>{text}</p>
      )}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">{sticky.author.username}</span>
        <button onClick={() => onDelete(sticky.id)} className="text-red-500">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(StickyNoteComponent);