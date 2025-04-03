import React from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-5 z-50">
      <div className="w-[400px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить эту задачу?</p>
        <div className="flex justify-end mt-4">
          <button type="button" className="mr-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 py-2 px-4" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="mr-2 bg-red-100 rounded-lg text-red-700 hover:bg-red-600 hover:text-white py-2 px-4" onClick={onDelete}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;