'use client';

import React, { useState, useEffect } from 'react';
import { useGetMyTeamsQuery, useInviteMemberMutation, useCreateTeamMutation, useUpdateTeamMutation } from '@/state/api';
import { Loader, SquareArrowOutUpRight } from 'lucide-react';
import InboxWrapper from '@/app/inboxWrapper';
import Breadcrumbs from "@/components/ui/breadcrumbs/Breadcrumbs";
import AddTeamModal from '@/components/Team/AddTeamModal';
import InviteMemberModal from '@/components/Team/InviteMemberForm';
import ManageTeamMembersModal from '@/components/Team/modal/ManageTeamMembersModal';
import TeamTable from '@/components/Team/TeamTable';

type BreadcrumbItem = {
  label: string;
  href: string;
};

const breadcrumbsItems: BreadcrumbItem[] = [
  { label: "Главная", href: "/" },
  { label: "Команда", href: "/team" },
];

const ProjectManagerTeamsPage: React.FC = () => {
  const { data: teams = [], isLoading, error, refetch } = useGetMyTeamsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [search, setSearch] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [inviteMember] = useInviteMemberMutation();
  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [values, setValues] = useState<{
    name: string;
    description: string;
  }>({
    name: '',
    description: '',
  });

  console.log("Teams from API:", teams);

  const currentTeam = teams.find(t => t.id === selectedTeamId) ?? (teams.length > 0 ? teams[0] : null);
  useEffect(() => {
    if (currentTeam) {
      setValues({
        name: currentTeam.name,
        description: currentTeam.description || '',
      });
    }
  }, [currentTeam]);

  const handleBlur = async (field: keyof typeof values) => {
    setEditingField(null);
    if (!currentTeam) return;
    if (values[field] !== (currentTeam as any)[field]) {
      try {
        await updateTeam({ id: currentTeam.id, [field]: values[field] }).unwrap();
        refetch();
      } catch (err) {
        console.error(`Ошибка при обновлении ${field}:`, err);
      }
    }
  };

  const handleSelectMembers = async (selectedMemberIds: number[]) => {
    if (!currentTeam) return;
    try {
      await updateTeam({ id: currentTeam.id, members: selectedMemberIds }).unwrap();
      refetch();
    } catch (err) {
      console.error('Ошибка при добавлении участников:', err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader className="animate-spin" /></div>;
  }
  if (error) {
    console.error("Ошибка при загрузке команд:", error);
    return (
      <InboxWrapper>
        <div className="px-4 dark:bg-white/[0.03] xl:px-6">
          <Breadcrumbs items={breadcrumbsItems} />
          <p className="p-4 text-red-500">Не удалось загрузить команды: {JSON.stringify(error)}</p>
          <button onClick={refetch} className="bg-blue-500 text-white rounded px-4 py-2">
            Попробовать снова
          </button>
        </div>
      </InboxWrapper>
    );
  }
  if (!teams.length) {
    return (
      <InboxWrapper>
        <div className="px-4 dark:bg-white/[0.03] xl:px-6">
          <Breadcrumbs items={breadcrumbsItems} />
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-semibold">Ваши команды</h1>
            <div className="flex gap-2">
              <button
                className="flex items-center px-4 py-2 text-base bg-blue-100 rounded-lg text-blue-700 hover:text-white hover:bg-blue-600 transition-colors dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setIsAddTeamModalOpen(true)}
              >
                <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
                Создать команду
              </button>
              <button
                className="flex items-center px-4 py-2 text-base bg-green-100 rounded-lg text-green-700 hover:text-white hover:bg-green-600 transition-colors dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
                Пригласить по Email
              </button>
              <button
                className="flex items-center px-4 py-2 text-base bg-purple-100 rounded-lg text-purple-700 hover:text-white hover:bg-purple-600 transition-colors dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setIsManageMembersModalOpen(true)}
              >
                <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
                Добавить участника
              </button>
            </div>
          </div>
          <p className="p-4 text-gray-500">У вас нет команд, где вы являетесь проджект-менеджером</p>
        </div>
      </InboxWrapper>
    );
  }

  const filteredMembers = currentTeam?.members_info?.filter(m =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const currentMemberIds = currentTeam?.members_info?.map(member => member.id) || [];

  const handleInviteMember = async (email: string) => {
    if (email.trim()) {
      if (currentTeam) {
        await inviteMember({ teamId: currentTeam.id, email });
      }
    }
  };

  const handleCreateTeam = async (teamData: { name: string; description: string }) => {
    await createTeam(teamData);
    setIsAddTeamModalOpen(false);
    refetch();
  };

  return (
    <InboxWrapper>
      <div className="px-4 dark:bg-white/[0.03] xl:px-6">
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-semibold">Ваши команды</h1>
          <div className="flex gap-2">
            <button
              className="flex items-center px-4 py-2 text-base bg-blue-100 rounded-lg text-blue-700 hover:text-white hover:bg-blue-600 transition-colors dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setIsAddTeamModalOpen(true)}
            >
              <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
              Создать команду
            </button>
            <button
              className="flex items-center px-4 py-2 text-base bg-green-100 rounded-lg text-green-700 hover:text-white hover:bg-green-600 transition-colors dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
              Пригласить по Email
            </button>
            <button
              className="flex items-center px-4 py-2 text-base bg-purple-100 rounded-lg text-purple-700 hover:text-white hover:bg-purple-600 transition-colors dark:bg-dark-bg dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setIsManageMembersModalOpen(true)}
            >
              <SquareArrowOutUpRight className="h-5 w-5 mr-2" />
              Добавить участника
            </button>
          </div>
        </div>

        <div className="mt-4">
          <select
            value={currentTeam?.id || ''}
            onChange={e => setSelectedTeamId(Number(e.target.value))}
            className="mt-1 block w-full max-w-sm rounded px-4 py-2 focus:outline-none transition border dark:border-gray-700 dark:bg-gray-700 dark:text-white"
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-start justify-between mt-6 gap-4">
          <div className="flex-1">
            {editingField === 'name' ? (
              <input
                type="text"
                className="w-full px-2 py-1 border dark:border-gray-700 rounded focus:outline-none text-2xl font-semibold dark:bg-gray-700 dark:text-white"
                value={values.name}
                autoFocus
                onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
                onBlur={() => handleBlur('name')}
                onKeyDown={e => e.key === 'Enter' && handleBlur('name')}
              />
            ) : (
              <h2
                className="text-2xl font-semibold text-gray-800 dark:text-white cursor-pointer"
                onClick={() => setEditingField('name')}
              >
                Участники «{values.name || 'Без названия'}»
              </h2>
            )}
            {editingField === 'description' ? (
              <textarea
                className="w-full px-2 py-1 border dark:border-gray-700 rounded focus:outline-none text-sm mt-2 dark:bg-gray-700 dark:text-white"
                rows={3}
                value={values.description}
                autoFocus
                onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
                onBlur={() => handleBlur('description')}
              />
            ) : (
              <p
                className="text-gray-600 dark:text-gray-400 mt-2 cursor-pointer"
                onClick={() => setEditingField('description')}
              >
                {values.description || 'Нажмите для добавления описания'}
              </p>
            )}
          </div>
          <input
            type="text"
            placeholder="Поиск участников"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm rounded px-4 py-2 border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mt-6 sm:rounded-lg max-h-[60vh] overflow-y-auto">
          <TeamTable members={filteredMembers} showAnalytics={true} />
          {filteredMembers.length === 0 && (
            <p className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">Ничего не найдено</p>
          )}
        </div>
      </div>

      <AddTeamModal
        isOpen={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        onCreate={handleCreateTeam}
      />

      {/* Модальное окно для приглашения участника по email */}
      {currentTeam?.id && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          teamId={currentTeam?.id!}
        />
      )}

    {currentTeam?.id && (
      <ManageTeamMembersModal
          isOpen={isManageMembersModalOpen}
          onClose={() => setIsManageMembersModalOpen(false)}
          teamId={currentTeam.id}
          currentMembers={currentMemberIds}
          currentMembersInfo={currentTeam?.members_info}
          onSuccess={refetch}
      />
    )}
    </InboxWrapper>
  );
};

export default ProjectManagerTeamsPage;