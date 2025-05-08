import React from 'react';

interface CursorIndicatorProps {
  userId: number;
  username: string;
  x: number;
  y: number;
  color: string;
}

const CursorIndicator: React.FC<CursorIndicatorProps> = ({ username, x, y, color }) => {
  return (
    <div
      className="absolute pointer-events-none z-50 flex flex-col items-center"
      style={{ left: x, top: y }}
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-700 bg-white px-2 py-1 rounded shadow mt-1">{username}</span>
    </div>
  );
};

export default CursorIndicator;