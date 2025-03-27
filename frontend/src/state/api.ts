import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Определяем интерфейсы для проекта и задачи
export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface Assignee {
  id: number;
  name: string;
  avatarURL: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  tags?: string;
  points?: number;
  assignees: Assignee[];
}

export interface RegisterUser  {
  username: string;
  email: string;
  password: string;
}

export interface LoginUser  {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string; // или другие поля, которые вы хотите вернуть
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users"],
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
      query: (id) => `tasks/${id}/`,
      providesTags: ["Tasks"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks/?projectId=${projectId}`,
      providesTags: (result) =>
        result ? result.map(({ id }) => ({ type: "Tasks", id })) : [{ type: "Tasks", id: "LIST" }],
    }),
    updateTaskStatus: build.mutation<Task, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `tasks/${id}/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Tasks"],
    }),
    // Эндпоинт для регистрации пользователя
    register: build.mutation<void, RegisterUser >({
      query: (user) => ({
        url: "users/register/",
        method: "POST",
        body: user,
      }),
    }),
    // Эндпоинт для входа пользователя
    login: build.mutation<AuthResponse, LoginUser >({
      query: (user) => ({
        url: "users/login/",
        method: "POST",
        body: user,
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTaskByIdQuery,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useRegisterMutation, // Хук для регистрации
  useLoginMutation, // Хук для входа
} = api;