"use client";

import React, { useState } from "react";
import InboxWrapper from "@/app/inboxWrapper";
import ProjectHeader from "@/app/projects/ProjectHeader";
import TaskList from "../TaskList";
import Overview from "../Overview";
import KanbanBoard from "../KanbanBoard";
import TimeLine from "../TimeLineList";
import StrategicMap from "../StrategicMap";
import { useGetProjectsQuery } from "@/state/api";
import { useParams } from "next/navigation";
import { FilterOptions } from "@/components/ui/dropdown/FilterDropdownAdvanced";

const Projects = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("Список");
  const [filters, setFilters] = useState<FilterOptions>({
    tags: new Set(),
    priorities: new Set(),
    assignedTo: "all",
  });
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: projects = [], error, isLoading, refetch } = useGetProjectsQuery();

  const project = projects.find((project) => project.id.toString() === id);
  const projectId = project ? project.id : null;

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
  };

  const handleApplyFilter = (newFilters: FilterOptions) => {
    console.log("Applying filters:", newFilters);
    setFilters(newFilters);
  };

  const handleSelectSort = (value: string) => {
    console.log("Сорт:", value);
    setSort(value);
  };

  if (!project) {
    return <p className="text-red-500 dark:text-red-400">Проект не найден</p>;
  }

  return (
    <InboxWrapper onSearch={handleSearch}>
      <div>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Загрузка проектов...</p>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400">Ошибка при загрузке проектов: {JSON.stringify(error)}</p>
        ) : (
          <>
            <ProjectHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              projectName={project.name}
              projectId={projectId}
              members={project.members_info}
              onApplyFilter={handleApplyFilter}
              onSelectSort={handleSelectSort}
              onSearch={handleSearch}
              refetch={refetch}
            />
            {activeTab === "Обзор" && projectId && <Overview projectId={projectId} refetch={refetch} />}
            {activeTab === "Список" && projectId && (
              <TaskList projectId={projectId} filters={filters} sort={sort} searchQuery={searchQuery} />
            )}
            {activeTab === "Доска" && projectId && <KanbanBoard projectId={projectId} />}
            {activeTab === "Хронология" && projectId && <TimeLine projectId={projectId} />}
            {activeTab === "Карта" && projectId && <StrategicMap projectId={projectId} />}
          </>
        )}
      </div>
    </InboxWrapper>
  );
};

export default Projects;