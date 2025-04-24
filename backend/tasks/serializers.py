from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model, authenticate
from .models import UserProfile, Team, Project, ProjectGoal, Subgoal, Task, Subtask, Tag, Comment, Notification, File, Setting, ActivityLog, UserTeamRelation, ProjectMember

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ('profile_image', 'role', 'role_display')
    
    def get_role_display(self, obj):
        return obj.get_role_display()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='userprofile.role', required=False)
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display')

    def get_role_display(self, obj):
        try:
            return obj.userprofile.get_role_display()
        except UserProfile.DoesNotExist:
            return None

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        
        UserProfile.objects.create(user=user, role='team_member')
        
        user.refresh_from_db()
        return user

class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)  # Получаем пользователя по email
        except User.DoesNotExist:
            raise serializers.ValidationError('Неверные учетные данные.')

        user = authenticate(username=user.username, password=password)  # Аутентификация по username

        if user is None:
            raise serializers.ValidationError('Неверные учетные данные.')

        attrs['user'] = user
        return attrs

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), write_only=True, source='team')

    total_tasks = serializers.IntegerField(read_only=True)
    total_subtasks = serializers.IntegerField(read_only=True)
    tasks_new = serializers.IntegerField(read_only=True)
    tasks_in_progress = serializers.IntegerField(read_only=True)
    tasks_done = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'team', 'team_id', 'startDate', 'endDate', 'created_at', 'updated_at', 
        'total_tasks', 'total_subtasks', 'tasks_new', 'tasks_in_progress', 'tasks_done',]

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.startDate = validated_data.get('startDate', instance.startDate)
        instance.endDate = validated_data.get('endDate', instance.endDate)

        team = validated_data.pop('team', None)
        if team is not None:
            instance.team = team

        instance.save()
        return instance
    
    def to_representation(self, instance):
        return super().to_representation(instance)

class ProjectGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectGoal
        fields = '__all__'

class SubgoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subgoal
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    assignees = UserSerializer(many=True, read_only=True)
    assignee_ids = serializers.PrimaryKeyRelatedField(queryset=User .objects.all(), many=True, write_only=True, source='assignees')
    tag = TagSerializer(read_only=True)
    tag_id = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), write_only=True, source='tag')
    stars = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'points', 'assignees', 'assignee_ids', 'tag', 'tag_id', 'start_date', 'due_date', 'created_at', 'updated_at', 'project', 'stars']

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.status = validated_data.get('status', instance.status)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.points = validated_data.get('points', instance.points)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.due_date = validated_data.get('due_date', instance.due_date)

        # Обновление исполнителей
        assignees = validated_data.pop('assignees', None)
        if assignees is not None:
            instance.assignees.set(assignees)

        # Обновление тега
        tag = validated_data.pop('tag', None)
        if tag is not None:
            instance.tag = tag

        instance.save()
        return instance
    
    def get_stars(self, obj):
        complexity = min(self.calculate_task_complexity(obj), 5)
        return max(0, complexity)

    def calculate_task_complexity(self, task):
        complexity = 0

        # Приоритет
        if task.priority == 'Высокий':
            complexity += 3
        elif task.priority == 'Средний':
            complexity += 2
        elif task.priority == 'Низкий':
            complexity += 1
        else:
            complexity += 0

        # Подзадачи (максимум +3)
        complexity += min(task.subtasks.count(), 3)

        # Исполнители (максимум +3)
        complexity += min(task.assignees.count(), 3)

        # Сроки
        if task.start_date and task.due_date:
            duration = (task.due_date - task.start_date).days
            if duration < 3:
                complexity += 2
            elif duration < 7:
                complexity += 1
            else:
                complexity += 0

        return max(0, min(complexity, 5))
    
class SubtaskSerializer(serializers.ModelSerializer):
    assignees = serializers.SerializerMethodField()
    assigned_to = UserSerializer(many=True, read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=User .objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    tag = TagSerializer(read_only=True)
    tag_id = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source='tag',
        write_only=True,
        required=False
    )
    stars = serializers.SerializerMethodField()

    class Meta:
        model = Subtask
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'tag', 'tag_id', 'points', 'start_date', 'due_date',
            'assignees', 'assigned_to', 'assigned_to_ids', 'task', 'stars' 
        ]

    def get_assignees(self, obj):
        if obj.task:
            return UserSerializer(obj.task.assignees.all(), many=True).data
        return []

    def validate_assigned_to_ids(self, value):
        task = self.get_task()
        allowed_ids = set(task.assignees.values_list('id', flat=True))
        incoming_ids = {user.id for user in value}
        
        if not incoming_ids.issubset(allowed_ids):
            raise serializers.ValidationError(
                "Нельзя назначить пользователей, не входящих в основную задачу"
            )
        return value

    def validate(self, attrs):
        task = self.get_task()
        start_date = attrs.get('start_date')
        due_date = attrs.get('due_date')

        if start_date and (start_date < task.start_date):
            raise serializers.ValidationError("Дата начала подзадачи не может быть раньше даты начала основной задачи.")

        if due_date and (due_date > task.due_date):
            raise serializers.ValidationError("Дата завершения подзадачи не может быть позже даты завершения основной задачи.")

        return attrs

    def get_task(self):
        task = getattr(self.instance, 'task', None)
        if not task:
            task_id = self.initial_data.get('task') or self.context['request'].data.get('task_id')
            try:
                task = Task.objects.get(id=task_id)
            except (Task.DoesNotExist, ValueError):
                raise serializers.ValidationError("Основная задача не найдена")
        return task

    def create(self, validated_data):
        users = validated_data.pop('assigned_to_ids', [])
        subtask = Subtask.objects.create(**validated_data)
        if users:
            subtask.assigned_to.set(users)
        return subtask

    def update(self, instance, validated_data):
        for attr, val in validated_data.items():
            if attr == 'assigned_to_ids':
                continue
            setattr(instance, attr, val)
        instance.save()
        if 'assigned_to_ids' in validated_data:
            instance.assigned_to.set(validated_data['assigned_to_ids'])
        if 'tag_id' in validated_data:
            tag = validated_data.pop('tag_id', None)
            if tag:
                instance.tag = tag
        return instance
    
    def get_stars(self, obj):
        complexity = min(self.calculate_subtask_complexity(obj), 5)
        return max(0, complexity)

    def calculate_subtask_complexity(self, subtask):
        complexity = 0

        # Приоритет
        if subtask.priority == 'Высокий':
            complexity += 3
        elif subtask.priority == 'Средний':
            complexity += 2
        elif subtask.priority == 'Низкий':
            complexity += 1
        else:
            complexity += 0

        # Исполнители (максимум +3)
        complexity += min(subtask.assigned_to.count(), 3)

        # Сроки
        if subtask.start_date and subtask.due_date:
            duration = (subtask.due_date - subtask.start_date).days
            if duration < 3:
                complexity += 2
            elif duration < 7:
                complexity += 1
            else:
                complexity += 0

        return max(0, min(complexity, 5))

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'task', 'content', 'created_at', 'updated_at', 'subtask']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'

class UserTeamRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTeamRelation
        fields = '__all__'

class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMember
        fields = '__all__'