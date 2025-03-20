import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL, // Убедитесь, что переменная окружения настроена правильно
  }),
  reducerPath: "api",
  tagTypes: ["Projects"],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "projects/", // Эндпоинт вашего Django API
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
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
} = api;