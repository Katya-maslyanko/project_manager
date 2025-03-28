import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Определяем интерфейсы для проекта, задачи и пользователя
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
  first_name: string;
  last_name: string;
}

export interface LoginUser  {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
}

// Создаем API с помощью Redux Toolkit
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL, // Убедитесь, что эта переменная окружения настроена
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users"],
  endpoints: (build) => ({
    // Эндпоинты для работы с проектами
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

    // Эндпоинты для работы с задачами
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

    // Эндпоинты для работы с пользователями
    register: build.mutation<AuthResponse, RegisterUser >({
      query: (userData) => ({
        url: "users/register/",
        method: "POST",
        body: userData,
      }),
    }),
    login: build.mutation<AuthResponse, LoginUser >({
      query: (credentials) => ({
        url: "users/login/",
        method: "POST",
        body: credentials,
      }),
    }),
    getCurrentUser:  build.query<User, void>({
      query: () => "users/profile/",
      providesTags: ["Users"],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTaskByIdQuery,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
  useRegisterMutation, // Хук для регистрации
  useLoginMutation, // Хук для входа
  useGetCurrentUserQuery, // Хук для получения текущего пользователя
} = api;