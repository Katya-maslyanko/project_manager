from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
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

User  = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'profile_image')

    def create(self, validated_data):
        profile_image = validated_data.pop('profile_image', None)
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Хеширование пароля
        user.save()

        # Создание экземпляра UserProfile
        UserProfile.objects.create(user=user, profile_image=profile_image)
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