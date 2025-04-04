from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import UserProfile, Team, Project, ProjectGoal, Subgoal, Task, Subtask, Tag, Comment, Notification, File, Setting, ActivityLog, UserTeamRelation, ProjectMember

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('profile_image', 'role')

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='userprofile.profile_image', required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile_image')

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Проверка существования пользователя
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Неверные учетные данные.")

        # Проверка пароля
        if not user.check_password(password):
            raise serializers.ValidationError("Неверные учетные данные.")

        attrs['user'] = user
        return attrs

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    re_password = serializers.CharField(write_only=True)
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 're_password', 'first_name', 'last_name', 'profile_image')

    def create(self, validated_data):
        profile_image = validated_data.pop('profile_image', None)
        password = validated_data.pop('password')
        re_password = validated_data.pop('re_password')
        if password != re_password:
            raise serializers.ValidationError({"password": "Пароли не совпадают."})
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, profile_image=profile_image)
        return user

class CurrentUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='userprofile.profile_image', required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile_image')

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

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

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'points', 'assignees', 'assignee_ids', 'tag', 'tag_id', 'start_date', 'due_date', 'created_at', 'updated_at', 'project']

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
    
class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'task', 'content', 'created_at']

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