from contextvars import Token
from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    User,
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
from .serializers import (
    UserSerializer,
    RegisterSerializer,
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
    ProjectMemberSerializer,
    CustomAuthTokenSerializer,
)

class LogoutView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_200_OK)
        except (ObjectDoesNotExist, TokenError):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)
    

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Возвращаем конкретные ошибки
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()  # Получаем всех пользователей
    serializer_class = UserSerializer  # Указываем сериализатор
    permission_classes = [permissions.IsAuthenticated]  # Только аутентифицированные пользователи могут получить доступ
    authentication_classes = [JWTAuthentication]  # Используем JWT для аутентификации

    def get(self, request, *args, **kwargs):
        # request.user будет автоматически установлен на текущего аутентифицированного пользователя
        user = request.user  
        
        # Если пользователь не аутентифицирован, request.user будет равен AnonymousUser 
        if user.is_anonymous:
            return Response({'detail': 'Учетные данные не были предоставлены.'}, status=401)

        # Сериализуем данные пользователя
        serializer = self.get_serializer(user)  
        return Response(serializer.data)  # Возвращаем данные в ответе

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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

    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('taskId', None)  # Убедитесь, что используете taskId
        if task_id is not None:
            queryset = queryset.filter(task_id=task_id)  # Фильтруем по task_id
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user) 

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