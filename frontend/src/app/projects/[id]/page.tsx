"use client";

import React, { useState } from "react";
import InboxWrapper from "@/app/inboxWrapper";
import ProjectHeader from "@/app/projects/ProjectHeader";
import TaskList from "../TaskList";
import Overview from "../Overview";
import KanbanBoard from "../KanbanBoard";
import TimeLine from "../TimeLineList";
import { useGetProjectsQuery } from "@/state/api";
import { useParams } from "next/navigation";

const Projects = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("Список");
  const { data: projects = [], error, isLoading } = useGetProjectsQuery();

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
            />
            {activeTab === "Обзор" && projectId && <Overview projectId={projectId} />}
            {activeTab === "Список" && projectId && <TaskList projectId={projectId} />}
            {activeTab === "Доска" && projectId && <KanbanBoard projectId={projectId} />}
            {activeTab === "Хронология" && projectId && <TimeLine projectId={projectId} />}
          </>
        )
      )}
    </div>
    </InboxWrapper>
  );
};

export default Projects;