import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Определяем интерфейсы для проекта и задачи
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
    // Эндпоинт для создания нового проекта
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects/",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    // Эндпоинт для получения задачи по ID
    getTaskById: build.query<Task, number>({
      query: (id) => `tasks/${id}/`,
      providesTags: ["Tasks"],
    }),
    // Эндпоинт для получения задач по projectId
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks/?projectId=${projectId}`, // Убедитесь, что этот путь соответствует вашему API
      providesTags: (result) =>
        result ? result.map(({ id }) => ({ type: "Tasks", id })) : [{ type: "Tasks", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTaskByIdQuery,
  useGetTasksQuery,
} = api;