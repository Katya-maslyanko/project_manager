import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

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
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  role?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
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
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks/",
        method: "POST",
        body: task,
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
    getTags: build.query<Tag[], void>({
      query: () => `tags/`,
      providesTags: ["Tags"],
    }),
    getUsers: build.query<User[], void>({
      query: () => `users/`,
      providesTags: ["Users"],
    }),
    getCommentsByTaskId: build.query<Comment[], { taskId: number }>({
      query: ({ taskId }) => `comments/?taskId=${taskId}`,
      providesTags: ["Comments"],
    }),
    createComment: build.mutation<Comment, { taskId: number; content: string }>({
      query: ({ taskId, content }) => ({
        url: "comments/",
        method: "POST",
        body: { taskId, content },
      }),
      invalidatesTags: ["Comments"],
    }),
    updateComment: build.mutation<Comment, { id: number; content: string }>({
      query: ({ id, content }) => ({
        url: `comments/${id}/`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["Comments"],
    }),
    deleteComment: build.mutation<void, number>({
      query: (id) => ({
        url: `comments/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments"],
    }),
    register: build.mutation<AuthResponse, RegisterUser >({
      query: (userData) => ({
        url: "auth/users/",
        method: "POST",
        body: userData,
      }),
    }),
    login: build.mutation<AuthResponse, LoginUser >({
      query: (credentials) => ({
        url: "auth/jwt/create/",
        method: "POST",
        body: credentials,
      }),
    }),
    getCurrentUser:  build.query<User, void>({
      query: () => "auth/users/me/",
      providesTags: ["Users"],
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: "auth/jwt/blacklist/",
        method: "POST",
        body: { refresh: Cookies.get('refreshToken') },
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTaskByIdQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useCreateTaskMutation,
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
  useLogoutMutation,
} = api;