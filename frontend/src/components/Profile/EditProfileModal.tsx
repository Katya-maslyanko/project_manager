"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateProfileMutation, useGetCurrentUserQuery } from "@/state/api";
import { useAuth } from "@/context/AuthContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { data: currentUser } = useGetCurrentUserQuery();
  const initialData = currentUser || user;

  const [firstName, setFirstName] = useState(initialData?.first_name || "");
  const [lastName, setLastName] = useState(initialData?.last_name || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [email, setEmail] = useState(initialData?.email || "");

  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name);
      setLastName(initialData.last_name);
      setUsername(initialData.username);
      setEmail(initialData.email);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Ошибка обновления профиля:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="w-[800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Редактировать профиль</h2>
          <button onClick={onClose} className="p-1 rounded cursor-pointer hover:bg-gray-200">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Имя
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-4">
              {typeof error === "string" ? error : "Ошибка обновления профиля"}
            </p>
          )}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 py-2 px-4"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white py-2 px-4"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
