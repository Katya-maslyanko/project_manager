"use client";

import React, { useState } from 'react';
import ProjectHeader from '@/app/projects/ProjectHeader';
import TaskList from '../TaskList';
import KanbanBoard from '../KanbanBoard';
import TimeLine from '../TimeLineList';
import { useGetProjectsQuery } from '@/state/api';
import { useParams } from 'next/navigation';

const Projects = () => {
    const { id } = useParams(); 
    const [activeTab, setActiveTab] = useState<string>("Список");
    const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState<boolean>(false);

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
                project ? ( // Проверяем, найден ли проект
                    <>
                        <ProjectHeader
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            projectName={project.name} // Передаем название проекта
                            projectId={project.id} // Передаем projectId
                        />
                        {/* Отображаем список задач для текущего проекта */}
                        {activeTab === "Список" && (
                            <TaskList projectId={project.id} /> // Передаем projectId в TaskList
                        )}
                        {activeTab === "Доска" && (
                            <KanbanBoard projectId={project.id} /> // Передаем projectId в KanbanBoard
                        )}
                        {activeTab === "Хронология" && (
                            <TimeLine projectId={project.id} /> // Передаем projectId в KanbanBoard
                        )}
                    </>
                ) : (
                    <p>Проект не найден</p> // Сообщение, если проект не найден
                )
            )}
        </div>
    );
};

export default Projects;