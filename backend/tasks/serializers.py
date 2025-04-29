from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Sum, Count
from .models import ProjectTeam, UserProfile, Team, Project, ProjectGoal, Subgoal, Task, Subtask, Tag, Comment, Notification, File, Setting, ActivityLog, UserTeamRelation, ProjectMember

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ('profile_image', 'role', 'role_display', 'position')
    
    def get_role_display(self, obj):
        return obj.get_role_display()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='userprofile.role', required=False)
    position = serializers.CharField(source='userprofile.position', required=False)
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'position')

    def get_role_display(self, obj):
        try:
            return obj.userprofile.get_role_display()
        except UserProfile.DoesNotExist:
            return None

    def update(self, instance, validated_data):
        userprofile_data = validated_data.pop('userprofile', {})

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        userprofile, created = UserProfile.objects.get_or_create(user=instance)
        userprofile.role = userprofile_data.get('role', userprofile.role)
        userprofile.position = userprofile_data.get('position', userprofile.position)
        userprofile.save()

        return instance

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=[
        ('admin', 'Администратор'),
        ('project_manager', 'Куратор проекта'),
        ('team_leader', 'Лидер подгруппы'),
        ('team_member', 'Участник команды'),
    ], default='team_member')

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 'role']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'team_member')
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        
        UserProfile.objects.create(user=user, role=role)
        
        return user

class CustomAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Неверные учетные данные.')

        user = authenticate(username=user.username, password=password)

        if user is None:
            raise serializers.ValidationError('Неверные учетные данные.')

        attrs['user'] = user
        return attrs
    
class SimpleUserSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()
    project_position = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role_display', 'project_position']

    def get_role_display(self, obj):
        try:
            return obj.userprofile.get_role_display()
        except (UserProfile.DoesNotExist, AttributeError):
            return None

    def get_project_position(self, obj):
        try:
            return obj.userprofile.position
        except (UserProfile.DoesNotExist, AttributeError):
            return None


class TeamSerializer(serializers.ModelSerializer):
    project_manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )
    members = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True
    )
    members_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'members', 'members_info', 'created_at', 'updated_at', 'project_manager']

    def get_members_info(self, obj):
        relations = obj.userteamrelation_set.select_related('user')
        result = []
        for rel in relations:
            u = rel.user
            # Исправляем фильтр: используем teams вместо team
            tasks = Task.objects.filter(project__teams=obj, assignees=u)
            subtasks = Subtask.objects.filter(task__project__teams=obj, assigned_to=u)

            # Подсчет задач по статусам
            tasks_new = tasks.filter(status='Новая').count()
            tasks_in_progress = tasks.filter(status='В процессе').count()
            tasks_done = tasks.filter(status='Завершено').count()

            # Подсчет подзадач по статусам
            subtasks_new = subtasks.filter(status='Новая').count()
            subtasks_in_progress = subtasks.filter(status='В процессе').count()
            subtasks_done = subtasks.filter(status='Завершено').count()

            # Вычисление средней сложности задач (на основе get_stars)
            total_tasks = tasks.count()
            total_subtasks = subtasks.count()
            task_stars = [TaskSerializer().get_stars(task) for task in tasks]
            subtask_stars = [SubtaskSerializer().get_stars(subtask) for subtask in subtasks]
            task_complexity = sum(task_stars) / len(task_stars) if task_stars else 0
            subtask_complexity = sum(subtask_stars) / len(subtask_stars) if subtask_stars else 0
            high_complexity_tasks = sum(1 for stars in task_stars if stars >= 4)

            # Рекомендация по распределению задач
            recommendation = ""
            if total_tasks == 0 and total_subtasks == 0:
                recommendation = "Нет задач. Рекомендуется назначить задачу."
            elif high_complexity_tasks > 0 or total_tasks > 3:
                recommendation = "Высокая нагрузка или сложные задачи. Не рекомендуется добавлять новые задачи."
            else:
                recommendation = "Можно назначить новые задачи."

            result.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'role_display': u.userprofile.get_role_display(),
                'project_position': u.userprofile.position,
                'analytics': {
                    'total_tasks': total_tasks,
                    'tasks_new': tasks_new,
                    'tasks_in_progress': tasks_in_progress,
                    'tasks_done': tasks_done,
                    'total_subtasks': total_subtasks,
                    'subtasks_new': subtasks_new,
                    'subtasks_in_progress': subtasks_in_progress,
                    'subtasks_done': subtasks_done,
                    'points_sum': tasks.aggregate(total=Sum('points'))['total'] or 0,
                    'avg_task_complexity': round(task_complexity, 1),
                    'avg_subtask_complexity': round(subtask_complexity, 1),
                    'high_complexity_tasks': high_complexity_tasks,
                    'recommendation': recommendation,
                }
            })
        return result

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        project_manager = validated_data.pop('project_manager', None)
        team = Team.objects.create(**validated_data, project_manager=project_manager)
        for user in members:
            UserTeamRelation.objects.create(user=user, team=team, role='team_member')
        return team

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        project_manager = validated_data.pop('project_manager', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        if project_manager is not None:
            instance.project_manager = project_manager
        instance.save()

        if members is not None:
            UserTeamRelation.objects.filter(team=instance).delete()
            for user in members:
                UserTeamRelation.objects.create(user=user, team=instance, role='team_member')

        return instance

class ProjectSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)
    teams_ids = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), many=True, write_only=True, source='teams')
    curator = UserSerializer(read_only=True)
    curator_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, source='curator', required=False)
    total_tasks = serializers.IntegerField(read_only=True)
    total_subtasks = serializers.IntegerField(read_only=True)
    tasks_new = serializers.IntegerField(read_only=True)
    tasks_in_progress = serializers.IntegerField(read_only=True)
    tasks_done = serializers.IntegerField(read_only=True)
    members_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'teams', 'teams_ids', 'curator', 'curator_id', 
                  'startDate', 'endDate', 'created_at', 'updated_at', 
                  'total_tasks', 'total_subtasks', 'tasks_new', 'tasks_in_progress', 'tasks_done', 'members_info']

    def get_members_info(self, obj):
        result = []
        seen_user_ids = set()
        for team in obj.teams.all():
            relations = team.userteamrelation_set.select_related('user')
            for rel in relations:
                u = rel.user
                if u.id in seen_user_ids:
                    continue
                seen_user_ids.add(u.id)
                tasks = Task.objects.filter(project=obj, assignees=u)
                subtasks = Subtask.objects.filter(task__project=obj, assigned_to=u)

                tasks_new = tasks.filter(status='Новая').count()
                tasks_in_progress = tasks.filter(status='В процессе').count()
                tasks_done = tasks.filter(status='Завершено').count()

                subtasks_new = subtasks.filter(status='Новая').count()
                subtasks_in_progress = subtasks.filter(status='В процессе').count()
                subtasks_done = subtasks.filter(status='Завершено').count()

                total_tasks = tasks.count()
                total_subtasks = subtasks.count()
                task_stars = [TaskSerializer().get_stars(task) for task in tasks]
                subtask_stars = [SubtaskSerializer().get_stars(subtask) for subtask in subtasks]
                task_complexity = sum(task_stars) / len(task_stars) if task_stars else 0
                subtask_complexity = sum(subtask_stars) / len(subtask_stars) if subtask_stars else 0
                high_complexity_tasks = sum(1 for stars in task_stars if stars >= 4)

                recommendation = ""
                if total_tasks == 0 and total_subtasks == 0:
                    recommendation = "Нет задач. Рекомендуется назначить задачу."
                elif high_complexity_tasks > 0 or total_tasks > 3:
                    recommendation = "Высокая нагрузка или сложные задачи. Не рекомендуется добавлять новые задачи."
                else:
                    recommendation = "Можно назначить новые задачи."

                result.append({
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'first_name': u.first_name,
                    'last_name': u.last_name,
                    'role_display': u.userprofile.get_role_display() if hasattr(u, 'userprofile') else None,
                    'project_position': u.userprofile.position if hasattr(u, 'userprofile') else None,
                    'analytics': {
                        'total_tasks': total_tasks,
                        'tasks_new': tasks_new,
                        'tasks_in_progress': tasks_in_progress,
                        'tasks_done': tasks_done,
                        'total_subtasks': total_subtasks,
                        'subtasks_new': subtasks_new,
                        'subtasks_in_progress': subtasks_in_progress,
                        'subtasks_done': subtasks_done,
                        'points_sum': tasks.aggregate(total=Sum('points'))['total'] or 0,
                        'avg_task_complexity': round(task_complexity, 1),
                        'avg_subtask_complexity': round(subtask_complexity, 1),
                        'high_complexity_tasks': high_complexity_tasks,
                        'recommendation': recommendation,
                    }
                })
        return result

    def create(self, validated_data):
        teams = validated_data.pop('teams', [])
        project = Project.objects.create(**validated_data)
        project.teams.set(teams)
        return project

    def update(self, instance, validated_data):
        teams = validated_data.pop('teams', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.startDate = validated_data.get('startDate', instance.startDate)
        instance.endDate = validated_data.get('endDate', instance.endDate)
        instance.curator = validated_data.get('curator', instance.curator)
        instance.save()

        if teams is not None:
            instance.teams.set(teams)

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

    def validate(self, attrs):
        project = None

        if project:
            start_date = attrs.get('start_date')
            due_date = attrs.get('due_date')

            if start_date and project.startDate and (start_date < project.startDate):
                raise serializers.ValidationError({"start_date": "Дата начала задачи не может быть раньше даты начала проекта."})

            if due_date and project.endDate and (due_date > project.endDate):
                raise serializers.ValidationError({"due_date": "Дата завершения задачи не может быть позже даты завершения проекта."})

        start_date = attrs.get('start_date')
        due_date = attrs.get('due_date')
        if start_date and due_date and due_date < start_date:
            raise serializers.ValidationError({"due_date": "Дата завершения не может быть раньше даты начала."})

        return attrs

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
        priority_weight = {
            'Высокий': 0.4,
            'Средний': 0.2,
            'Низкий': 0.1,
        }
        
        complexity = 0
        complexity += priority_weight.get(task.priority, 0)
        subtasks_count = task.subtasks.count()
        complexity += min(subtasks_count * 0.1, 0.3)
        assignees_count = task.assignees.count()
        complexity += min(assignees_count * 0.05, 0.2)
        if task.start_date and task.due_date:
            duration = (task.due_date - task.start_date).days
            if duration < 3:
                complexity += 0.01
            elif duration < 7:
                complexity += 0.05
            else:
                complexity += 0.1

        normalized_complexity = max(1, int(complexity * 10))

        return min(normalized_complexity, 5)
    
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
        priority_weight = {
            'Высокий': 0.4,
            'Средний': 0.2,
            'Низкий': 0.1,
        }
        
        complexity = 0
        complexity += priority_weight.get(subtask.priority, 0)
        assignees_count = subtask.assigned_to.count()
        complexity += min(assignees_count * 0.05, 0.2)
        if subtask.start_date and subtask.due_date:
            duration = (subtask.due_date - subtask.start_date).days
            if duration < 3:
                complexity += 0.01
            elif duration < 7:
                complexity += 0.05
            else:
                complexity += 0.1

        normalized_complexity = max(1, int(complexity * 10))

        return min(normalized_complexity, 5)

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