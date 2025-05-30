import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export interface Member {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_display: string;
  project_position: string | null;
  analytics: {
    total_tasks: number;
    tasks_new: number;
    tasks_in_progress: number;
    tasks_done: number;
    total_subtasks: number;
    subtasks_new: number;
    subtasks_in_progress: number;
    subtasks_done: number;
    points_sum: number;
    avg_task_complexity: number;
    avg_subtask_complexity: number;
    high_complexity_tasks: number;
    recommendation: string;
  };
}

export interface Team {
  some(arg0: (t: any) => boolean): unknown;
  project_manager: any;
  id: number;
  name: string;
  description: string;
  members_info: Member[];
  created_at: string;
  updated_at: string;
  position_in_team: string | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  teams: Team[] | null;
  curator: User | null;
  total_tasks: number;
  tasks_new: number;
  tasks_in_progress: number;
  tasks_done: number;
  total_subtasks: number;
  members_info: Member[];
  is_cpd_project?: boolean;
}

export interface Assignee {
  last_name: string;
  first_name: string;
  id: number;
  username: string;
  profile_image: string | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Task {
  connected_goals: StrategicConnection[];
  comments: never[];
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
  stars: number;
}

export interface Comment {
  id: number;
  taskId: number;
  subtaskId: number | null;
  user: Assignee;
  content: string;
  created_at: string;
}

export interface Subtask {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  tag: Tag | null;
  points: number;
  start_date: string | null;
  due_date: string | null;
  assignees: Assignee[];
  assigned_to: Assignee[]; 
  taskId: number;
  assigned_to_ids?: number[];
  stars: number;
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
  role_display?: string;
}

export interface ProjectGoal {
  progress: number;
  id: number;
  project: number;
  title: string;
  description: string;
  status: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface SubGoal {
  id: number;
  goal: number;
  title: string;
  description: string;
  status: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface StickyNote {
  id: number;
  project: number;
  goal?: number;
  subgoal?: number;
  text: string;
  author: User;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface StrategicConnection {
  id: number;
  project: number;
  connection_type: string;
  source_goal?: number;
  source_subgoal?: number;
  target_goal?: number;
  target_subgoal?: number;
  target_task?: number;
  target_subtask?: number;
  label?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  project?: { id: number; name: string };
  task?: { id: number; title: string };
  subtask?: { id: number; title: string };
  comment?: {
      id: number;
      content: string;
      user: {
          id: number;
          username: string;
          email: string;
          first_name: string;
          last_name: string;
          profile_image?: string;
      };
  };
  team?: { id: number; name: string };
  goal?: { id: number; title: string };
  subgoal?: { id: number; title: string };
  sticky_note?: { id: number; text: string };
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
  tagTypes: ["Projects", "Tasks", "Users", "Tags", "Comments", "Teams", "Subtasks", "ActivityLogs", "ProjectGoals", "StickyNotes", "StrategicConnections", "SubGoals", "Notifications"],
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "projects/my-projects/",
      providesTags: ["Projects"],
    }),
    getProjectById: build.query<Project, number>({
      query: (id) => `projects/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects/",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    updateProject: build.mutation<Project, Partial<Project> & Pick<Project, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `projects/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Projects', id }],
    }),
    deleteProject: build.mutation<void, number>({
      query: (id) => ({
        url: `projects/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
    getTaskById: build.query<Task, number>({
      query: (id) => `tasks/${id}/`,
      providesTags: ["Tasks"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId, ...params }) => {
        const queryString = new URLSearchParams(params).toString();
        return `tasks/?projectId=${projectId}${queryString ? `&${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Tasks" as const, id })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),
    updateTask: build.mutation<Task, Partial<Task> & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `tasks/${id}/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
    updateSubTaskStatus: build.mutation<Subtask, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `subtasks/${id}/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subtasks", id },
        { type: "Subtasks", id: "LIST" },
      ],
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
    getTeams: build.query<Team[], void>({
      query: () => "teams/",
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Teams" as const, id }))
          : [{ type: "Teams", id: "LIST" }],
    }),
    getTeamsByUser: build.query<Team[], number>({
      query: (userId) => `teams/?members_info=${userId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Teams" as const, id }))
          : [{ type: "Teams", id: "LIST" }],
    }),
    getMyTeams: build.query<Team[], void>({
      query: () => `teams/my-teams/`,
      providesTags: (result) =>
        result
          ? result.map((t) => ({ type: "Teams" as const, id: t.id }))
          : [{ type: "Teams", id: "LIST" }],
    }),
    getSubtasksByTaskId: build.query<Subtask[], number>({
      query: (taskId) => `subtasks/?taskId=${taskId}`,
      providesTags: (result) =>
        result ? result.map(({ id }) => ({ type: "Subtasks", id })) : [{ type: "Subtasks", id: "LIST" }],
    }),
    createSubtask: build.mutation<Subtask, Partial<Subtask>>({
      query: (subtask) => ({
        url: `subtasks/`,
        method: "POST",
        body: subtask,
      }),
      invalidatesTags: [{ type: "Subtasks", id: "LIST" }],
    }),
    updateSubtask: build.mutation<Subtask, Partial<Subtask>>({
      query: ({ id, ...rest }) => ({
        url: `subtasks/${id}/`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Subtasks"],
    }),
    deleteSubtask: build.mutation<void, number>({
      query: (id) => ({
        url: `subtasks/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subtasks"],
    }),
    getCommentsByTaskId: build.query<Comment[], { taskId: number }>({
      query: ({ taskId }) => `comments/?taskId=${taskId}`,
      providesTags: ["Comments"],
    }),
    getCommentsBySubTaskId: build.query<Comment[], { subtaskId: number }>({
      query: ({ subtaskId }) => `comments/?subtaskId=${subtaskId}`,
      providesTags: ["Comments"],
    }),
    createComment: build.mutation<Comment, { taskId: number; content: string }>({
      query: ({ taskId, content }) => ({
        url: "comments/",
        method: "POST",
        body: { task: taskId, content },
      }),
      invalidatesTags: ["Comments"],
    }),
    createSubtaskComment: build.mutation<Comment, { subtaskId: number; content: string }>({
      query: ({ subtaskId, content }) => ({
          url: "comments/",
          method: "POST",
          body: { subtask: subtaskId, content },
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
    register: build.mutation<AuthResponse, RegisterUser>({
      query: (userData) => ({
        url: "auth/register/",
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
    updateProfile: build.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "auth/users/me/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: "auth/jwt/blacklist/",
        method: "POST",
        body: { refresh: Cookies.get('refreshToken') },
      }),
    }),
    getSubtasksByAssignee: build.query<Subtask[], number>({
      query: (userId) => `subtasks/?assigned_to=${userId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Subtasks" as const, id }))
          : [{ type: "Subtasks", id: "LIST" }],
    }),
    createTeam: build.mutation<Team, Partial<Team>>({
      query: (team) => ({
        url: 'teams/',
        method: 'POST',
        body: team,
      }),
      invalidatesTags: ['Teams'],
    }),
    updateTeam: build.mutation<Team, Partial<Team> & Pick<Team, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `teams/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teams', id }],
    }),
    deleteTeam: build.mutation<void, number>({
      query: (id) => ({
        url: `teams/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teams'],
    }),
    inviteMember: build.mutation<void, { teamId: number; email: string }>({
      query: ({ teamId, email }) => ({
        url: `teams/${teamId}/invite/`,
        method: 'POST',
        body: { email },
      }),
    }),
    getTasksByAssignee: build.query<Task[], number>({
      query: (userId) => `tasks/?assignee=${userId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks", id: "LIST" }],
    }),
    getActivityLogsByProject: build.query<{ day: string; project_name: string; activity_count: number }[], { projectId?: number }>({
      query: ({ projectId }) => `activity_logs/by-project/${projectId ? `?project_id=${projectId}` : ''}`,
      providesTags: (result) =>
        result ? result.map((_, index) => ({ type: "ActivityLogs" as const, id: index })) : [{ type: "ActivityLogs", id: "LIST" }],
    }),
    updateUserRole: build.mutation<void, { userId: number; role: string }>({
      query: ({ userId, role }) => ({
        url: `users/${userId}/`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    getProjectGoals: build.query<ProjectGoal[], { projectId: number }>({
      query: ({ projectId }) => `project_goals/?project_id=${projectId}`,
      providesTags: ["ProjectGoals"],
    }),
    createProjectGoal: build.mutation<ProjectGoal, Partial<ProjectGoal>>({
      query: (goal) => ({
        url: "project_goals/",
        method: "POST",
        body: goal,
      }),
      invalidatesTags: ["ProjectGoals"],
    }),
    updateProjectGoal: build.mutation<ProjectGoal, Partial<ProjectGoal> & Pick<ProjectGoal, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `project_goals/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["ProjectGoals"],
    }),
    deleteProjectGoal: build.mutation<void, number>({
      query: (id) => ({
        url: `project_goals/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectGoals"],
    }),
    updateGoalProgress: build.mutation<{ progress: number }, number>({
      query: (goalId) => ({
        url: `project_goals/${goalId}/update-progress/`,
        method: "POST",
      }),
      invalidatesTags: ["ProjectGoals"],
    }),
    getSubGoals: build.query<SubGoal[], { goalId: number }>({
      query: ({ goalId }) => `subgoals/?goal_id=${goalId}`,
      providesTags: ["SubGoals"],
    }),
    createSubGoal: build.mutation<SubGoal, Partial<SubGoal>>({
      query: (subgoal) => ({
        url: "subgoals/",
        method: "POST",
        body: subgoal,
      }),
      invalidatesTags: ["SubGoals"],
    }),
    updateSubGoal: build.mutation<SubGoal, Partial<SubGoal> & Pick<SubGoal, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `subgoals/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["SubGoals"],
    }),
    deleteSubGoal: build.mutation<void, number>({
      query: (id) => ({
        url: `subgoals/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubGoals"],
    }),
    getStickyNotes: build.query<StickyNote[], { projectId: number }>({
      query: ({ projectId }) => `sticky_notes/?project_id=${projectId}`,
      providesTags: ["StickyNotes"],
    }),
    createStickyNote: build.mutation<StickyNote, Partial<StickyNote>>({
      query: (sticky) => ({
        url: "sticky_notes/",
        method: "POST",
        body: sticky,
      }),
      invalidatesTags: ["StickyNotes"],
    }),
    updateStickyNote: build.mutation<StickyNote, Partial<StickyNote> & Pick<StickyNote, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `sticky_notes/${id}/`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["StickyNotes"],
    }),
    deleteStickyNote: build.mutation<void, number>({
      query: (id) => ({
        url: `sticky_notes/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["StickyNotes"],
    }),
    getStrategicConnections: build.query<StrategicConnection[], { projectId: number }>({
      query: ({ projectId }) => `strategic_connections/?project_id=${projectId}`,
      providesTags: ["StrategicConnections"],
    }),
    createStrategicConnection: build.mutation<StrategicConnection, Partial<StrategicConnection>>({
      query: (connection) => ({
        url: "strategic_connections/",
        method: "POST",
        body: connection,
      }),
      invalidatesTags: ["StrategicConnections"],
    }),
    deleteStrategicConnection: build.mutation<void, number>({
      query: (id) => ({
        url: `strategic_connections/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["StrategicConnections"],
    }),
    getNotifications: build.query<Notification[], void>({
      query: () => {
          console.log("Fetching notifications...");
          return "notifications/";
      },
      providesTags: (result) =>
          result
              ? result.map(({ id }) => ({ type: "Notifications", id }))
              : [{ type: "Notifications", id: "LIST" }],
  }),
      markNotificationAsRead: build.mutation<void, number>({
        query: (id) => ({
            url: `notifications/${id}/mark-read/`,
            method: "POST",
        }),
        invalidatesTags: (result, error, id) => [
            { type: "Notifications", id },
            { type: "Notifications", id: "LIST" },
        ],
    }),
    markAllNotificationsAsRead: build.mutation<void, void>({
        query: () => ({
            url: "notifications/mark-all-read/",
            method: "POST",
        }),
        invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
    inviteProjectMember: build.mutation<{ message: string }, { projectId: number; email: string }>({
      query: ({ projectId, email }) => ({
        url: `projects/${projectId}/invite/`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["Projects"],
    }),
    acceptProjectInvitation: build.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: `projects/accept-invitation/${token}/`,
        method: "POST",
      }),
      invalidatesTags: ["Projects"],
    }),
    setup2FA: build.mutation<{ qr_code: string; device_id: number }, void>({
      query: () => ({
        url: 'auth/2fa/setup/',
        method: 'POST',
      }),
    }),
    verify2FA: build.mutation<{ message: string }, { code: string; device_id: number }>({
      query: ({ code, device_id }) => ({
        url: 'auth/2fa/verify/',
        method: 'POST',
        body: { code, device_id },
      }),
    }),
    login2FA: build.mutation<AuthResponse, { email: string; password: string; code?: string }>({
      query: (credentials) => ({
        url: 'auth/login-2fa/',
        method: 'POST',
        body: credentials,
      }),
    }),
    requestPasswordReset: build.mutation<{ message: string }, { email: string }>({
      query: ({ email }) => ({
        url: 'auth/password/reset/',
        method: 'POST',
        body: { email },
      }),
    }),
    confirmPasswordReset: build.mutation<{ message: string }, { token: string; new_password: string }>({
      query: ({ token, new_password }) => ({
        url: 'auth/password/reset/confirm/',
        method: 'POST',
        body: { token, new_password },
      }),
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectByIdQuery,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useGetTaskByIdQuery,
  useUpdateProfileMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateSubTaskStatusMutation,
  useDeleteTaskMutation,
  useGetCommentsByTaskIdQuery,
  useGetCommentsBySubTaskIdQuery,
  useCreateCommentMutation,
  useCreateSubtaskCommentMutation,
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useGetTagsQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLogoutMutation,
  useGetSubtasksByTaskIdQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useGetSubtasksByAssigneeQuery,
  useGetTeamsByUserQuery,
  useGetMyTeamsQuery,
  useCreateTeamMutation,
  useInviteMemberMutation,
  useGetTasksByAssigneeQuery,
  useUpdateTeamMutation,
  useGetActivityLogsByProjectQuery,
  useUpdateUserRoleMutation,
  useGetProjectGoalsQuery,
  useCreateProjectGoalMutation,
  useUpdateProjectGoalMutation,
  useDeleteProjectGoalMutation,
  useUpdateGoalProgressMutation,
  useGetSubGoalsQuery,
  useCreateSubGoalMutation,
  useUpdateSubGoalMutation,
  useDeleteSubGoalMutation,
  useGetStickyNotesQuery,
  useCreateStickyNoteMutation,
  useUpdateStickyNoteMutation,
  useDeleteStickyNoteMutation,
  useGetStrategicConnectionsQuery,
  useCreateStrategicConnectionMutation,
  useDeleteStrategicConnectionMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useInviteProjectMemberMutation,
  useAcceptProjectInvitationMutation,
  useSetup2FAMutation,
  useVerify2FAMutation,
  useLogin2FAMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useDeleteTeamMutation
} = api;