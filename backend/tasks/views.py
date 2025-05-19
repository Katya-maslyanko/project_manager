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
from rest_framework.exceptions import NotFound, ValidationError
from uuid import UUID
import os
import subprocess
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
import tempfile
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count, Q
from .models import (
    ProjectInvitation,
    ProjectTeam,
    StickyNote,
    StrategicConnection,
    User,
    UserCursorPosition,
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
    StickyNoteSerializer,
    StrategicConnectionSerializer,
    UserCursorPositionSerializer,
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
            else:
                team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
                qs = Team.objects.filter(id__in=team_ids)

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
logger = logging.getLogger(__name__)
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
            curated_projects = queryset.filter(curator=user)
            user_team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
            if user_team_ids:
                team_projects = queryset.filter(teams__id__in=user_team_ids)
                combined_projects = curated_projects | team_projects
                return combined_projects.distinct()
            return curated_projects
        else:
            user_team_ids = UserTeamRelation.objects.filter(user=user).values_list('team_id', flat=True)
            if user_team_ids:
                filtered_queryset = queryset.filter(teams__id__in=user_team_ids)
                return filtered_queryset
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
        # print(f"Returning projects data: {serializer.data}")
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='invite')
    def invite_member(self, request, pk=None):
        project = self.get_object()
        email = request.data.get('email')

        if not email:
            return Response({'error': 'Email обязателен'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invitation = ProjectInvitation.objects.create(
                project=project,
                email=email,
                invited_by=request.user
            )
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            invite_link = f"{frontend_url}/projects/{project.id}?invitation_token={invitation.token}"
            subject = f"Приглашение в проект {project.name}"
            message = f"Вы были приглашены в проект {project.name}. Перейдите по ссылке для присоединения: {invite_link}"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]

            logger.info(f"Отправка email на {email} для проекта {project.name}")
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            logger.info(f"Email успешно отправлен на {email}")

            return Response({'message': f'Приглашение отправлено на {email}'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Ошибка при отправке email на {email}: {str(e)}")
            return Response({'error': f'Ошибка при отправке приглашения: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='accept-invitation')
    def accept_invitation(self, request, pk=None):
        project = self.get_object()
        user = request.user
        token = request.query_params.get('invitation_token')

        if not token:
            return Response({'error': 'Токен приглашения обязателен'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            UUID(token)
            invitation = ProjectInvitation.objects.filter(
                project=project,
                token=token,
                email=user.email,
                is_used=False
            ).first()

            if not invitation:
                return Response({'error': 'Приглашение не найдено, уже использовано или недействительно'}, status=status.HTTP_400_BAD_REQUEST)
            project.members.add(user)
            invitation.is_used = True
            invitation.save()

            logger.info(f"Пользователь {user.email} принял приглашение в проект {project.name}")
            return Response({'message': f'Вы успешно присоединились к проекту {project.name}'}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({'error': 'Недействительный токен приглашения'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Ошибка при принятии приглашения для {user.email}: {str(e)}")
            return Response({'error': f'Ошибка при принятии приглашения: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectGoalViewSet(viewsets.ModelViewSet):
    queryset = ProjectGoal.objects.all()
    serializer_class = ProjectGoalSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return ProjectGoal.objects.filter(project_id=project_id)
        return ProjectGoal.objects.all()

    @action(detail=True, methods=['post'], url_path='update-progress')
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        tasks = Task.objects.filter(connected_goals__source_goal=goal)
        if tasks:
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='Завершено').count()
            progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
            goal.progress = progress
            goal.save()
            return Response({'progress': progress}, status=status.HTTP_200_OK)
        return Response({'error': 'Нет задач'}, status=status.HTTP_400_BAD_REQUEST)

class SubgoalViewSet(viewsets.ModelViewSet):
    queryset = Subgoal.objects.all()
    serializer_class = SubgoalSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        goal_id = self.request.query_params.get('goal_id')
        if goal_id:
            return Subgoal.objects.filter(goal_id=goal_id)
        return Subgoal.objects.all()
    
    @action(detail=True, methods=['post'], url_path='update-progress')
    def update_progress(self, request, pk=None):
        subgoal = self.get_object()
        tasks = Task.objects.filter(connected_goals__source_goal=subgoal)
        if tasks:
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='Завершено').count()
            progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
            subgoal.progress = progress
            subgoal.save()
            return Response({'progress': progress}, status=status.HTTP_200_OK)
        return Response({'error': 'Нет задач'}, status=status.HTTP_400_BAD_REQUEST)

class StickyNoteViewSet(viewsets.ModelViewSet):
    queryset = StickyNote.objects.all()
    serializer_class = StickyNoteSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return StickyNote.objects.filter(project_id=project_id)
        return StickyNote.objects.all()
    def perform_create(self, serializer):
        goal = serializer.validated_data.get('goal')
        subgoal = serializer.validated_data.get('subgoal')
        if goal and goal.sticky_notes.count() >= 10:
            raise serializer.ValidationError({"goal": "Достигнуто максимальное количество стикеров для этой цели (10)."})
        if subgoal and subgoal.sticky_notes.count() >= 10:
            raise serializer.ValidationError({"subgoal": "Достигнуто максимальное количество стикеров для этой подцели (10)."})
        serializer.save(author=self.request.user)

    # def update(self, request, *args, **kwargs):
    #     sticky_note = self.get_object()
    #     if sticky_note.author != request.user:
    #         return Response({'detail': 'У вас нет прав для редактирования этого стикера.'}, status=status.HTTP_403_FORBIDDEN)
    #     return super().update(request, *args, **kwargs)
    
    # def partial_update(self, request, *args, **kwargs):
    #     sticky_note = self.get_object()
    #     if sticky_note.author != request.user:
    #         return Response({'detail': 'У вас нет прав для редактирования этого стикера.'}, status=status.HTTP_403_FORBIDDEN)
    #     return super().partial_update(request, *args, **kwargs)

class StrategicConnectionViewSet(viewsets.ModelViewSet):
    queryset = StrategicConnection.objects.all()
    serializer_class = StrategicConnectionSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except StrategicConnection.DoesNotExist:
            raise NotFound(detail=f"Соединение с ID {kwargs.get('pk')} не найдено.")
        except Exception as e:
            raise ValidationError(detail=f"Не удалось удалить соединение: {str(e)}")

class UserCursorPositionViewSet(viewsets.ModelViewSet):
    queryset = UserCursorPosition.objects.all()
    serializer_class = UserCursorPositionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return UserCursorPosition.objects.filter(project_id=project_id)
        return UserCursorPosition.objects.all()

class SubgoalViewSet(viewsets.ModelViewSet):
    queryset = Subgoal.objects.all()
    serializer_class = SubgoalSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = (OrderingFilter,)

    def get_queryset(self):
        # print(self.request.query_params)
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('projectId')
        status = self.request.query_params.get('status')
        assignee_id = self.request.query_params.get('assigneeId')
        tag_id = self.request.query_params.getlist('tagId')
        priority = self.request.query_params.get('priority')
        goal_id = self.request.query_params.get('goalId')
        assigned_to = self.request.query_params.get('assignedTo')

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if status:
            queryset = queryset.filter(status__in=status.split(','))
        if assignee_id:
            queryset = queryset.filter(assignees__id=assignee_id)
        if tag_id:
            queryset = queryset.filter(tag__id__in=tag_id)
        if priority:
            queryset = queryset.filter(priority__in=priority.split(','))
        if goal_id:
            queryset = queryset.filter(connected_goals__source_goal_id=goal_id)
        if assigned_to == 'me' and self.request.user.is_authenticated:
            queryset = queryset.filter(assignees=self.request.user)

        order_by = self.request.query_params.get('ordering')
        valid_order_fields = [
            'priority', '-priority',
            'created_at', '-created_at',
            'due_date', '-due_date',
            'points', '-points'
        ]
        if order_by and order_by in valid_order_fields:
            queryset = queryset.order_by(*order_by.split(','))

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True)
        return Response({'message': 'Все прочитал'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Уведомления'}, status=status.HTTP_200_OK)

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