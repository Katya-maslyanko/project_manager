from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save, m2m_changed
import uuid

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
    curator = models.ForeignKey(User, related_name='curated_projects', on_delete=models.SET_NULL, null=True, blank=True)
    teams = models.ManyToManyField(Team, related_name='projects', through='ProjectTeam')  
    startDate = models.DateTimeField(null=True, blank=True)  # Дата начала проекта
    endDate = models.DateTimeField(null=True, blank=True)  # Дата окончания проекта
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProjectGoal(models.Model):
    project = models.ForeignKey(Project, related_name='goals', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=[
        ('Новая', 'Новая'),
        ('В процессе', 'В процессе'),
        ('Завершено', 'Завершено'),
    ], default='Новая')
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    color = models.CharField(max_length=7, default='#FFFFFF', help_text="Цвет узла в формате HEX")
    progress = models.FloatField(default=0.0, help_text="Прогресс выполнения цели в процентах")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Subgoal(models.Model):
    goal = models.ForeignKey(ProjectGoal, related_name='subgoals', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=[
        ('Новая', 'Новая'),
        ('В процессе', 'В процессе'),
        ('Завершено', 'Завершено'),
    ], default='Новая')
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    color = models.CharField(max_length=7, default='#E0F7FA', help_text="Цвет узла в формате HEX")
    progress = models.FloatField(default=0.0, help_text="Прогресс выполнения подцели в процентах")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class StickyNote(models.Model):
    project = models.ForeignKey(Project, related_name='sticky_notes', on_delete=models.CASCADE)
    goal = models.ForeignKey(ProjectGoal, related_name='sticky_notes', on_delete=models.CASCADE, null=True, blank=True)
    subgoal = models.ForeignKey(Subgoal, related_name='sticky_notes', on_delete=models.CASCADE, null=True, blank=True)
    text = models.TextField()
    author = models.ForeignKey(User, related_name='sticky_notes', on_delete=models.SET_NULL, null=True)
    position_x = models.FloatField(default=0.0, help_text="X coordinate on strategic map")
    position_y = models.FloatField(default=0.0, help_text="Y coordinate on strategic map")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Стикер для {self.author.username if self.author else 'Unknown'} в {self.created_at.strftime('%Y-%m-%d')}"

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

class StrategicConnection(models.Model):
    CONNECTION_TYPES = [
        ('goal_to_subgoal', 'Цель к Подцели'),
        ('goal_to_task', 'Цель к Задаче'),
        ('subgoal_to_task', 'Подцель к Задаче'),
        ('goal_to_goal', 'Цель к Цели'),
        ('subgoal_to_subgoal', 'Подцель к Подцели'),
        ('subgoal_to_subtask', 'Подцель к Подзадаче'),
    ]

    connection_type = models.CharField(max_length=50, choices=CONNECTION_TYPES)
    source_goal = models.ForeignKey(ProjectGoal, related_name='outgoing_connections', on_delete=models.CASCADE, null=True, blank=True)
    source_subgoal = models.ForeignKey(Subgoal, related_name='outgoing_sub_connections', on_delete=models.CASCADE, null=True, blank=True)
    target_goal = models.ForeignKey(ProjectGoal, related_name='incoming_connections', on_delete=models.CASCADE, null=True, blank=True)
    target_subgoal = models.ForeignKey(Subgoal, related_name='incoming_sub_connections', on_delete=models.CASCADE, null=True, blank=True)
    target_task = models.ForeignKey(Task, related_name='connected_goals', on_delete=models.CASCADE, null=True, blank=True)
    target_subtask = models.ForeignKey(Subtask, related_name='connected_subgoals', on_delete=models.CASCADE, null=True, blank=True)  # Добавляем поле для подзадач
    label = models.CharField(max_length=100, blank=True, null=True, help_text="Связь между целями")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        source = self.source_goal.title if self.source_goal else (self.source_subgoal.title if self.source_subgoal else "Unknown Source")
        target = self.target_goal.title if self.target_goal else (self.target_subgoal.title if self.target_subgoal else (self.target_task.title if self.target_task else "Unknown Target"))
        return f"Связь ({self.connection_type}): {source} -> {target}"

class UserCursorPosition(models.Model):
    user = models.ForeignKey(User, related_name='cursor_positions', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name='user_cursors', on_delete=models.CASCADE)
    position_x = models.FloatField(default=0.0)
    position_y = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'project')

    def __str__(self):
        return f"Курсор для {self.user.username} на ({self.position_x}, {self.position_y})"

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

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True)
    subtask = models.ForeignKey('Subtask', on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE, null=True, blank=True)
    team = models.ForeignKey('Team', on_delete=models.CASCADE, null=True, blank=True)
    goal = models.ForeignKey('ProjectGoal', on_delete=models.CASCADE, null=True, blank=True)
    subgoal = models.ForeignKey('Subgoal', on_delete=models.CASCADE, null=True, blank=True)
    sticky_note = models.ForeignKey('StickyNote', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"

    @receiver(post_save, sender=Task)
    def create_task_notification(sender, instance, created, **kwargs):
        request = getattr(settings, 'CURRENT_REQUEST', None)
        current_user = request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None
        
        if created:
            for assignee in instance.assignees.all():
                if current_user and assignee == current_user:
                    continue
                Notification.objects.create(
                    user=assignee,
                    message=f"Вы назначены на задачу '{instance.title}' в проекте '{instance.project.name}'",
                    project=instance.project,
                    task=instance
                )
        else:
            if instance.status != instance.__original_status:
                for assignee in instance.assignees.all():
                    if current_user and assignee == current_user:
                        continue
                    Notification.objects.create(
                        user=assignee,
                        message=f"Статус задачи '{instance.title}' изменён на '{instance.status}'",
                        project=instance.project,
                        task=instance
                    )

    @receiver(post_save, sender=Subtask)
    def create_subtask_notification(sender, instance, created, **kwargs):
        request = getattr(settings, 'CURRENT_REQUEST', None)
        current_user = request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None
        
        if created:
            for assignee in instance.assigned_to.all():
                if current_user and assignee == current_user:
                    continue
                Notification.objects.create(
                    user=assignee,
                    message=f"Вы назначены на подзадачу '{instance.title}' в задаче '{instance.task.title}'",
                    project=instance.task.project,
                    subtask=instance,
                    task=instance.task
                )
        else:
            if instance.status != instance.__original_status:
                for assignee in instance.assigned_to.all():
                    if current_user and assignee == current_user:
                        continue
                    Notification.objects.create(
                        user=assignee,
                        message=f"Статус подзадачи '{instance.title}' изменён на '{instance.status}'",
                        project=instance.task.project,
                        subtask=instance,
                        task=instance.task
                    )

    @receiver(post_save, sender=Comment)
    def create_comment_notification(sender, instance, created, **kwargs):
        if created:
            users_to_notify = set()
            if instance.task:
                users_to_notify.update(instance.task.assignees.all())
            if instance.subtask:
                users_to_notify.update(instance.subtask.assigned_to.all())
            users_to_notify.discard(instance.user)
            for user in users_to_notify:
                Notification.objects.create(
                    user=user,
                    message=f"Новый комментарий от {instance.user.username} в {instance.task.title if instance.task else instance.subtask.title}",
                    project=instance.task.project if instance.task else instance.subtask.task.project,
                    task=instance.task,
                    subtask=instance.subtask,
                    comment=instance
                )

    @receiver(post_save, sender=UserTeamRelation)
    def create_team_invitation_notification(sender, instance, created, **kwargs):
        request = getattr(settings, 'CURRENT_REQUEST', None)
        current_user = request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None
        
        if created:
            if current_user and instance.user == current_user:
                return
            Notification.objects.create(
                user=instance.user,
                message=f"Вы добавлены в команду '{instance.team.name}'",
                team=instance.team
            )

    @receiver(post_save, sender=ProjectGoal)
    def create_goal_notification(sender, instance, created, **kwargs):
        request = getattr(settings, 'CURRENT_REQUEST', None)
        current_user = request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None
        
        if not created and instance.status != instance.__original_status:
            project = instance.project
            users = set(project.teams.values_list('userteamrelation__user', flat=True))
            for user_id in users:
                user = User.objects.get(id=user_id)
                if current_user and user == current_user:
                    continue
                Notification.objects.create(
                    user=user,
                    message=f"Статус цели '{instance.title}' в проекте '{project.name}' изменён на '{instance.status}'",
                    project=project,
                    goal=instance
                )

    @receiver(post_save, sender=Subgoal)
    def create_subgoal_notification(sender, instance, created, **kwargs):
        request = getattr(settings, 'CURRENT_REQUEST', None)
        current_user = request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None
        
        if not created and instance.status != instance.__original_status:
            project = instance.goal.project
            users = set(project.teams.values_list('userteamrelation__user', flat=True))
            for user_id in users:
                user = User.objects.get(id=user_id)
                if current_user and user == current_user:
                    continue
                Notification.objects.create(
                    user=user,
                    message=f"Статус подцели '{instance.title}' в проекте '{project.name}' изменён на '{instance.status}'",
                    project=project,
                    subgoal=instance
                )

    @receiver(post_save, sender=StickyNote)
    def create_sticky_note_notification(sender, instance, created, **kwargs):
        if created:
            project = instance.project
            users = set(project.teams.values_list('userteamrelation__user', flat=True))
            users.discard(instance.author)
            for user_id in users:
                user = User.objects.get(id=user_id)
                Notification.objects.create(
                    user=user,
                    message=f"Новый стикер от {instance.author.username} в проекте '{project.name}'",
                    project=project,
                    sticky_note=instance
                )

    def track_original_status(sender, instance, **kwargs):
        if instance.pk:
            original = sender.objects.get(pk=instance.pk)
            instance.__original_status = original.status
        else:
            instance.__original_status = None

    models.signals.pre_save.connect(track_original_status, sender=Task)
    models.signals.pre_save.connect(track_original_status, sender=Subtask)
    models.signals.pre_save.connect(track_original_status, sender=ProjectGoal)
    models.signals.pre_save.connect(track_original_status, sender=Subgoal)

class ProjectInvitation(models.Model):
    project = models.ForeignKey(Project, related_name='invitations', on_delete=models.CASCADE)
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    invited_by = models.ForeignKey(User, related_name='sent_invitations', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Приглашение для {self.email} в проект {self.project.name}"