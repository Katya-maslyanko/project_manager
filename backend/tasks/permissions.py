from rest_framework import permissions
from .models import Team

class IsTeamManager(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.project_manager == request.user