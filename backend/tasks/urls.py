from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StickyNoteViewSet,
    StrategicConnectionViewSet,
    UserCursorPositionViewSet,
    UserViewSet,
    TeamViewSet,
    ProjectViewSet,
    ProjectGoalViewSet,
    SubgoalViewSet,
    TaskViewSet,
    SubtaskViewSet,
    TagViewSet,
    CommentViewSet,
    NotificationViewSet,
    FileViewSet,
    SettingViewSet,
    ActivityLogViewSet,
    UserTeamRelationViewSet,
    ProjectMemberViewSet,
    LogoutView,
    CustomTokenObtainPairView,
    UserDetailUpdateView,
    RegisterView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'project_goals', ProjectGoalViewSet)
router.register(r'subgoals', SubgoalViewSet)
router.register(r'sticky_notes', StickyNoteViewSet)
router.register(r'strategic_connections', StrategicConnectionViewSet)
router.register(r'cursor_positions', UserCursorPositionViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'subtasks', SubtaskViewSet)
router.register(r'tags', TagViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'files', FileViewSet)
router.register(r'settings', SettingViewSet)
router.register(r'activity_logs', ActivityLogViewSet)
router.register(r'user_team_relations', UserTeamRelationViewSet)
router.register(r'project_members', ProjectMemberViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/jwt/create/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/users/me/', UserDetailUpdateView.as_view(), name='user-detail'),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]