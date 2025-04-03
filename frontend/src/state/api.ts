import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface Assignee {
  id: number;
  username: string;
  profile_image: string | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: number;
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  tag: Tag | null;
  points: number;
  assignees: Assignee[];
}

export interface Comment {
  id: number;
  taskId: number;
  user: Assignee;
  content: string;
  created_at: string;
}

export interface RegisterUser {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginUser {
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
  profile_image?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Tags", "Comments"],
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
    updateTask: build.mutation<Task, Partial<Task>>({
      query: ({ id, ...rest }) => ({
        url: `tasks/${id}/`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `tasks/${id}/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: build.mutation<void, number>({
      query: (id) => ({
        url: `tasks/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    // Эндпоинт для получения тегов
    getTags: build.query<Tag[], void>({
      query: () => `tags/`,
        providesTags: ["Tags"],
    }),
    // Эндпоинт для получения пользователей
    getUsers: build.query<User[], void>({
      query: () => `users/`,
        providesTags: ["Users"],
    }),
    // Эндпоинт для получения комментариев по ID задачи
    getCommentsByTaskId: build.query<Comment[], { taskId: number }>({
      query: ({ taskId }) => `comments/?taskId=${taskId}`, // Изменено на taskId
      providesTags: ["Comments"],
    }),
    // Эндпоинт для создания комментария
    createComment: build.mutation<Comment, { taskId: number; content: string }>({
      query: ({ taskId, content }) => ({
        url: "comments/",
        method: "POST",
        body: { taskId, content }, // Изменено на taskId
      }),
      invalidatesTags: ["Comments"],
    }),
    updateComment: build.mutation<Comment, { id: number; content: string }>({
      query: ({ id, content }) => ({
        url: `comments/${id}/`, // Предполагается, что у вас есть такой эндпоинт
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["Comments"],
    }),

    // Эндпоинт для удаления комментария
    deleteComment: build.mutation<void, number>({
      query: (id) => ({
        url: `comments/${id}/`, // Предполагается, что у вас есть такой эндпоинт
        method: "DELETE",
      }),
      invalidatesTags: ["Comments"],
    }),
    register: build.mutation<AuthResponse, RegisterUser>({
      query: (userData) => ({
        url: "users/register/",
        method: "POST",
        body: userData,
      }),
    }),
    login: build.mutation<AuthResponse, LoginUser>({
      query: (credentials) => ({
        url: "users/login/",
        method: "POST",
        body: credentials,
      }),
    }),
    getCurrentUser: build.query<User, void>({
      query: () => "users/profile/",
      providesTags: ["Users"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTaskByIdQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useGetCommentsByTaskIdQuery,
  useCreateCommentMutation,
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useGetTagsQuery,
  useGetUsersQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = api;