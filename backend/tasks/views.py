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
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.filters import OrderingFilter
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count, Q
from .models import (
    ProjectTeam,
    User,
    UserTeamRelation,
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
    

class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            return Response({
                "access": access_token,
                "refresh": refresh_token,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserDetailUpdateView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.all()

        try:
            role = getattr(user.userprofile, 'role', 'team_member')
        except AttributeError:
            role = 'team_member'

        if role == 'admin':
            return User.objects.all()
        return User.objects.all()

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Team.objects.none()

        role = getattr(user.userprofile, 'role', 'team_member')

        if role == 'admin':
            return Team.objects.all()
        elif role == 'project_manager':
            return Team.objects.filter(project_manager=user)
        else:
            team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
            return Team.objects.filter(id__in=team_ids)

    @action(detail=False, methods=['get'], url_path='my-teams')
    def my_teams(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            print("Пользователь не авторизован")
            return Response([], status=200)
        try:
            role = getattr(user.userprofile, 'role', 'team_member')
            print(f"User: {user}, Role: {role}")
            if role == 'project_manager':
                qs = Team.objects.filter(project_manager=user)
                print(f"Teams for project_manager: {qs.count()}")
            else:
                # Используем связь через UserTeamRelation для получения команд пользователя
                team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
                qs = Team.objects.filter(id__in=team_ids)
                print(f"Teams for member: {qs.count()}")

            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Ошибка в my_teams: {str(e)}")
            return Response({'error': str(e)}, status=500)
        
    def perform_create(self, serializer):
        if 'project_manager' not in serializer.validated_data or serializer.validated_data['project_manager'] is None:
            serializer.validated_data['project_manager'] = self.request.user
        serializer.save()

    @action(detail=True, methods=['post'], url_path='invite')
    def invite_member(self, request, pk=None):
        team = self.get_object()
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            invite_link = f"{frontend_url}/join-team/{team.id}/"
            subject = f"Приглашение в команду {team.name}"
            message = f"Вы были приглашены в команду {team.name}. Перейдите по ссылке для присоединения: {invite_link}"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]

            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            return Response({'message': f'Приглашение отправлено на {email}'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Ошибка при отправке приглашения: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            role = user.userprofile.role
        except AttributeError:
            role = 'team_member'

        queryset = Project.objects.annotate(
            total_tasks=Count('tasks', distinct=True),
            total_subtasks=Count('tasks__subtasks', distinct=True),
            tasks_new=Count('tasks', filter=Q(tasks__status='Новая')),
            tasks_in_progress=Count('tasks', filter=Q(tasks__status='В процессе')),
            tasks_done=Count('tasks', filter=Q(tasks__status='Завершено')),
        )

        if role == 'admin':
            return queryset
        elif role == 'project_manager':
            print(f"Фильтр по куратору проекта: {user.username}")
            curated_projects = queryset.filter(curator=user)
            print(f"Куратор проекта: {curated_projects.count()}")
            user_team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
            if user_team_ids:
                team_projects = queryset.filter(teams__id__in=user_team_ids)
                print(f"Проекты куратора проекта: {team_projects.count()}")
                combined_projects = curated_projects | team_projects
                return combined_projects.distinct()
            return curated_projects
        else:
            user_team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
            print(f"Исполнители команд {user.username}: {list(user_team_ids)}")
            if user_team_ids:
                filtered_queryset = queryset.filter(teams__id__in=user_team_ids)
                print(f"Проекты команды: {filtered_queryset.count()}")
                return filtered_queryset
            # print(f"Нет в команде {user.username}, вопрос")
            return queryset.none()
    # def get_queryset(self):
    #     print("Returning all projects without filtering by user")
    #     queryset = Project.objects.annotate(
    #         total_tasks=Count('tasks', distinct=True),
    #         total_subtasks=Count('tasks__subtasks', distinct=True),
    #         tasks_new=Count('tasks', filter=Q(tasks__status='Новая')),
    #         tasks_in_progress=Count('tasks', filter=Q(tasks__status='В процессе')),
    #         tasks_done=Count('tasks', filter=Q(tasks__status='Завершено')),
    #     )
    #     return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Необходимо авторизоваться для создания проекта'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if user.userprofile.role != 'project_manager':
            return Response({'error': 'Только кураторы проектов могут создавать проекты'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(curator=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            role = request.user.userprofile.role
        except AttributeError:
            role = 'team_member'
        if role != 'project_manager':
            return Response({'error': 'Только кураторы проектов могут редактировать проекты'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        try:
            role = request.user.userprofile.role
        except AttributeError:
            role = 'team_member'
        if role != 'project_manager':
            return Response({'error': 'Только кураторы проектов могут редактировать проекты'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        try:
            role = request.user.userprofile.role
        except AttributeError:
            role = 'team_member'
        if role != 'project_manager':
            return Response({'error': 'Только кураторы проектов могут удалять проекты'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        if 'curator' not in serializer.validated_data or serializer.validated_data['curator'] is None:
            serializer.validated_data['curator'] = self.request.user
        serializer.save()

    @action(detail=False, methods=['get'], url_path='my-projects')
    def my_projects(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ProjectGoalViewSet(viewsets.ModelViewSet):
    queryset = ProjectGoal.objects.all()
    serializer_class = ProjectGoalSerializer

class SubgoalViewSet(viewsets.ModelViewSet):
    queryset = Subgoal.objects.all()
    serializer_class = SubgoalSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = (OrderingFilter,)

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('projectId')
        status = self.request.query_params.get('status')
        assignee_id = self.request.query_params.get('assigneeId')
        tag_id = self.request.query_params.getlist('tagId')
        priority = self.request.query_params.get('priority')

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if status:
            queryset = queryset.filter(status=status)
        if assignee_id:
            queryset = queryset.filter(assignees__id=assignee_id)
        if tag_id:
            queryset = queryset.filter(tag_id=tag_id)
        if priority:
            queryset = queryset.filter(priority=priority)

        order_by = self.request.query_params.get('ordering')
        if order_by:
            order_fields = order_by.split(',')
            queryset = queryset.order_by(*order_fields)

        return queryset

    def update(self, request, *args, **kwargs):
        print("PATCH request for task:", kwargs.get('pk'))
        print("Request data:", request.data)
        return super().update(request, *args, **kwargs)

class SubtaskViewSet(viewsets.ModelViewSet):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('taskId')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        assignee_id = self.request.query_params.get('assigned_to')
        if assignee_id:
            queryset = queryset.filter(assigned_to__id=assignee_id)
        return queryset
    
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('taskId', None)
        subtask_id = self.request.query_params.get('subtaskId', None)
        if subtask_id is not None:
            queryset = queryset.filter(subtask_id=subtask_id)
        if task_id is not None:
            queryset = queryset.filter(task_id=task_id)
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
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

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            role = user.userprofile.role
        except AttributeError:
            role = 'team_member'

        queryset = ActivityLog.objects.all()
        if role == 'project_manager':
            queryset = queryset.filter(project__curator=user)
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset.annotate(
            day=models.functions.TruncDay('created_at')
        ).values('day', 'project__name').annotate(
            activity_count=Count('id')
        ).order_by('day')

    @action(detail=False, methods=['get'], url_path='by-project')
    def by_project(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserTeamRelationViewSet(viewsets.ModelViewSet):
    queryset = UserTeamRelation.objects.all()
    serializer_class = UserTeamRelationSerializer

class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    serializer_class = ProjectMemberSerializer