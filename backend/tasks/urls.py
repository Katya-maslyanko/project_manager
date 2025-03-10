from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TeamViewSet, ProjectViewSet, TaskViewSet, SubtaskViewSet, CommentViewSet, NotificationViewSet, ActivityLogViewSet, ProjectGoalViewSet, SubgoalViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'subtasks', SubtaskViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'activity_logs', ActivityLogViewSet)
router.register(r'project_goals', ProjectGoalViewSet)
router.register(r'subgoals', SubgoalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]