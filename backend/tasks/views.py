from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
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
    ProjectMember
)
from .forms import UserRegistrationForm
from .serializers import (
    UserSerializer,
    LoginSerializer,
    TeamSerializer,
    ProjectSerializer,
    ProjectGoalSerializer,
    SubgoalSerializer,
    TaskSerializer,
    SubtaskSerializer,
    TagSerializer,
    CommentSerializer,
    NotificationSerializer,
    FileSerializer,
    SettingSerializer,
    ActivityLogSerializer,
    UserTeamRelationSerializer,
    ProjectMemberSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User  registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login_view(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            login(request, user)
            return Response({"message": "Login successful."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ProjectGoalViewSet(viewsets.ModelViewSet):
    queryset = ProjectGoal.objects.all()
    serializer_class = ProjectGoalSerializer

class SubgoalViewSet(viewsets.ModelViewSet):
    queryset = Subgoal.objects.all()
    serializer_class = SubgoalSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('projectId', None)
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        return queryset

class SubtaskViewSet(viewsets.ModelViewSet):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer

class UserTeamRelationViewSet(viewsets.ModelViewSet):
    queryset = UserTeamRelation.objects.all()
    serializer_class = UserTeamRelationSerializer

class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    serializer_class = ProjectMemberSerializer