from django.contrib import admin
from .models import (
    User,
    Team,
    Project,
    ProjectGoal,
    Subgoal,
    Task,
    Subtask,
    Tag,
    TaskTag,
    Comment,
    Notification,
    File,
    Setting,
    ActivityLog,
    UserTeamRelation,
    ProjectMember
)

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'team', 'created_at', 'updated_at')

@admin.register(ProjectGoal)
class ProjectGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'created_at', 'updated_at')

@admin.register(Subgoal)
class SubgoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'goal', 'status', 'created_at', 'updated_at')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assignee', 'status', 'created_at', 'updated_at')

@admin.register(Subtask)
class SubtaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'task', 'assignee', 'status', 'created_at', 'updated_at')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')

@admin.register(TaskTag)
class TaskTagAdmin(admin.ModelAdmin):
    list_display = ('task', 'tag')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'created_at', 'updated_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('task', 'uploaded_by', 'uploaded_at')

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'value', 'created_at')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'task', 'action', 'created_at')

@admin.register(UserTeamRelation)
class UserTeamRelationAdmin(admin.ModelAdmin):
    list_display = ('user', 'team', 'role', 'joined_at')

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'role', 'added_at')