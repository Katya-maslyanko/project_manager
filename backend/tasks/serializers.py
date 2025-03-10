from rest_framework import serializers
from .models import User, Team, Project, Task, Subtask, Comment, Notification, ActivityLog, ProjectGoal, Subgoal

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

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

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'

class ProjectGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectGoal
        fields = '__all__'

class SubgoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subgoal
        fields = '__all__'