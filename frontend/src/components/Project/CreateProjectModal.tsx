"use client";

import React, { useState } from "react";
import { useCreateProjectMutation, useGetTeamsQuery } from "@/state/api";
import { X } from "lucide-react";
import { useModal } from "@/context/ModalContext";

const CreateProjectModal: React.FC = () => {
  const { isOpen, closeModal } = useModal();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const { data: teams = [], isLoading: loadingTeams } = useGetTeamsQuery();
  
  // Состояние для выбранной команды (одна команда)
  const [team, setTeam] = useState<number | null>(null);
  const [createProject] = useCreateProjectMutation();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createProject({ 
        name, 
        description, 
        startDate, 
        endDate, 
        team_id: team // Передаём выбранную команду
      });
      closeModal();
    } catch (error) {
      setError("Ошибка при создании проекта. Пожалуйста, попробуйте еще раз.");
      console.error("Ошибка при создании проекта:", error);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectTeam = (teamId: number) => {
    setTeam(teamId);
    setIsTeamModalOpen(false);
  };

  // Находим выбранную команду для вывода её названия
  const selectedTeam = teams.find(t => t.id === team);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-[600px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Создать проект</h2>
          <button
            className="ml-2 p-1 rounded cursor-pointer hover:bg-gray-200"
            onClick={closeModal}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {loadingTeams ? (
          <div>Загрузка команд...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Название
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-md p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-200 rounded-md p-2"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата начала
                </label>
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-200 rounded-md p-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Команда
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="mt-1 block w-full border border-gray-200 rounded-md p-2 text-left"
                  onClick={() => setIsTeamModalOpen(true)}
                >
                  {selectedTeam ? selectedTeam.name : "Выберите команду"}
                </button>
                {isTeamModalOpen && (
                  <div className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-4 mt-2">
                    <input
                      type="text"
                      placeholder="Поиск команды..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2 block w-full border border-gray-200 rounded-md p-2"
                    />
                    <div className="max-h-40 overflow-y-auto">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                            onClick={() => selectTeam(team.id)}
                          >
                            <span>{team.name}</span>
                          </div>
                        ))
                      ) : (
                        <div>Нет доступных команд</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className=" border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 py-2 px-4"
                      onClick={() => setIsTeamModalOpen(false)}
                    >
                      Отменить
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="mr-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 py-2 px-4"
                onClick={closeModal}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-600 hover:text-white py-2 px-4"
              >
                Создать проект
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;