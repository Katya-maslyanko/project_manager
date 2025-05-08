from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/strategic_map/(?P<project_id>\d+)/$', consumers.StrategicMapConsumer.as_asgi()),
]