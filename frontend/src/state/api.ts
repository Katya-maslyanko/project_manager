import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks"],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "projects/",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects/",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    getTaskById: build.query<Task, number>({
      query: (id) => `tasks/${id}/`, // Эндпоинт для получения задачи по ID
      providesTags: ["Tasks"],
    }),
    // Новый эндпоинт для получения всех задач по ID проекта
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`, // Эндпоинт для получения задач по проекту
      providesTags: (result) =>
        result ? result.map(({ id }) => ({ type: "Tasks", id })) : [{ type: "Tasks", id: "LIST" }],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTaskByIdQuery, // Экспортируем хук для получения задачи по ID
  useGetTasksQuery, // Экспортируем хук для получения всех задач по ID проекта
} = api;