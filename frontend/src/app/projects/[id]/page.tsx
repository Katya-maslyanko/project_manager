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

const Projects = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("Список");
  const { data: projects = [], error, isLoading, refetch } = useGetProjectsQuery();

  const project = projects.find((project) => project.id.toString() === id);
  const projectId = project ? project.id : null;

  return (
    <InboxWrapper>
    <div>
      {isLoading ? (
        <p>Загрузка проектов...</p>
      ) : error ? (
        <p>Ошибка при загрузке проектов: {JSON.stringify(error)}</p>
      ) : (
        project && (
          <>
            <ProjectHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              projectName={project.name}
              projectId={projectId}
              members={project.members_info}
            />
            {activeTab === "Обзор" && projectId && <Overview projectId={projectId} refetch={refetch} />}
            {activeTab === "Список" && projectId && <TaskList projectId={projectId} />}
            {activeTab === "Доска" && projectId && <KanbanBoard projectId={projectId} />}
            {activeTab === "Хронология" && projectId && <TimeLine projectId={projectId} />}
            {activeTab === "Карта" && projectId && <StrategicMap projectId={projectId} />}          </>
        )
      )}
    </div>
    </InboxWrapper>
  );
};

export default Projects;