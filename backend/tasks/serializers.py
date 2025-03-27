from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import (
    UserProfile,
    Team,
    Project,
    ProjectGoal,
    Subgoal,
    Task,
    Subtask,
    Tag,
    Comment,
    Notification,
    File,
    Setting,
    ActivityLog,
    UserTeamRelation,
    ProjectMember,
)

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='userprofile.profile_image', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])  # Хешируем пароль
        user.save()
        UserProfile.objects.create(user=user, role='team_member')  # Устанавливаем роль по умолчанию
        return user

class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username_or_email = attrs['username_or_email']
        password = attrs['password']

        # Проверяем, является ли введенное значение email
        if '@' in username_or_email:
            user = User.objects.filter(email=username_or_email).first()
        else:
            user = User.objects.filter(username=username_or_email).first()

        if user is None or not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")
        
        return user

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
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    assignee = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    tag = serializers.SerializerMethodField()
    class Meta:
        model = Task
        fields = '__all__'

    def get_assignee(self, obj):
        if obj.assignee and hasattr(obj.assignee, 'userprofile'):
            return {
                'profile_image': obj.assignee.userprofile.profile_image.url if obj.assignee.userprofile.profile_image else None
            }
        return {'profile_image': None}

    def get_project(self, obj):
        return {
            'title': obj.project.name
        }

    def get_tag(self, obj):
        return {
            'name': obj.tag.name
        }

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

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