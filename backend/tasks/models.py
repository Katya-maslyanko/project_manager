from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=50, choices=[
        ('admin', 'Администратор'),
        ('project_manager', 'Куратор проекта'),
        ('team_leader', 'Лидер подгруппы'),
        ('team_member', 'Участник команды'),
    ], default='team_member')

    def __str__(self):
        return self.user.username

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    project_manager = models.ForeignKey(User, related_name='managed_teams', on_delete=models.SET_NULL, null=True, blank=True)

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    team = models.ForeignKey(Team, related_name='primary_projects', on_delete=models.CASCADE, null=True, blank=True)
    project_manager = models.ForeignKey(User, related_name='managed_projects', on_delete=models.SET_NULL, null=True, blank=True)
    startDate = models.DateTimeField(null=True, blank=True)  # Дата начала проекта
    endDate = models.DateTimeField(null=True, blank=True)  # Дата окончания проекта
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProjectGoal(models.Model):
    project = models.ForeignKey(Project, related_name='goals', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50)  # Например, "в процессе", "завершено"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Subgoal(models.Model):
    goal = models.ForeignKey(ProjectGoal, related_name='subgoals', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50)  # Например, "в процессе", "завершено"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Task(models.Model):
    STATUS_CHOICES = [
        ('Новая', 'Новая'),
        ('В процессе', 'В процессе'),
        ('Завершено', 'Завершено'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Новая')
    priority = models.CharField(max_length=50)
    assignees = models.ManyToManyField(User, related_name='tasks', blank=True)
    project = models.ForeignKey(Project, related_name='tasks', on_delete=models.CASCADE)
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    tag = models.ForeignKey(Tag, related_name='task_tags', on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    points = models.IntegerField(null=True, blank=True)

class Subtask(models.Model):
    STATUS_CHOICES = [
        ('Новая', 'Новая'),
        ('В процессе', 'В процессе'),
        ('Завершено', 'Завершено'),
    ]

    task = models.ForeignKey(Task, related_name='subtasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Новая')
    priority = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    tag = models.ForeignKey(Tag, related_name='subtask_tags', on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    points = models.IntegerField(null=True, blank=True)

    assigned_to = models.ManyToManyField(User, related_name='subtasks', blank=True)

    def get_possible_assignees(self):
        return self.task.assignees.all()

class Comment(models.Model):
    task = models.ForeignKey(Task, related_name='comments', on_delete=models.CASCADE, null=True, blank=True)
    subtask = models.ForeignKey(Subtask, related_name='comments', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class File(models.Model):
    task = models.ForeignKey(Task, related_name='files', on_delete=models.CASCADE)
    file_path = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Setting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=100)
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class UserTeamRelation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)
    joined_at = models.DateTimeField(auto_now_add=True)

class ProjectMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)
    added_at = models.DateTimeField(auto_now_add=True)

class TaskAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProjectTeam(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)