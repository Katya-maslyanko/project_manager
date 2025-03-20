"use client";

import React, { useState } from 'react';
import ProjectHeader from '@/app/projects/ProjectHeader';
import { useGetProjectsQuery } from '@/state/api';
import { useParams } from 'next/navigation';

const Projects = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("Board");
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

    // Получаем проекты
    const { data: projects = [], error, isLoading } = useGetProjectsQuery();

    // Находим проект по ID
    const project = projects.find(project => project.id.toString() === id);

    return (
        <div>
            {/* Модальное окно задач */}
            {isLoading ? (
                <p>Загрузка проектов...</p>
            ) : error ? (
                <p>Ошибка при загрузке проектов</p>
            ) : (
                project && (
                    <ProjectHeader
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        projectName={project.name} // Передаем название проекта
                    />
                )
            )}
        </div>
    );
};

export default Projects;