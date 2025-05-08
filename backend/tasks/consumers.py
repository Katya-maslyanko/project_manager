import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import UserCursorPosition, Notification
from .serializers import NotificationSerializer

class StrategicMapConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.group_name = f'strategic_map_{self.project_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        user = self.scope['user']

        if not user.is_authenticated:
            return

        if message_type == 'cursor_update':
            await database_sync_to_async(UserCursorPosition.objects.update_or_create)(
                    user=user,
                    project_id=self.project_id,
                    defaults={
                        'position_x': data.get('x'),
                        'position_y': data.get('y'),
                    }
                )
            await self.channel_layer.group_send(
                self.group_name,
                    {
                        'type': 'cursor_update',
                        'user_id': data.get('user_id'),
                        'username': data.get('username'),
                        'x': data.get('x'),
                        'y': data.get('y'),
                    }
                )
        elif message_type == 'sticky_update':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'sticky_update',
                    'sticky_id': data.get('sticky_id'),
                    'text': data.get('text'),
                    'position_x': data.get('position_x'),
                    'position_y': data.get('position_y'),
                }
            )
        elif message_type == 'goal_update':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'goal_update',
                    'goal_id': data.get('goal_id'),
                    'title': data.get('title'),
                    'description': data.get('description'),
                    'status': data.get('status'),
                    'position_x': data.get('position_x'),
                    'position_y': data.get('position_y'),
                }
            )
        elif message_type == 'subgoal_update':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'subgoal_update',
                    'subgoal_id': data.get('subgoal_id'),
                    'title': data.get('title'),
                    'description': data.get('description'),
                    'status': data.get('status'),
                    'position_x': data.get('position_x'),
                    'position_y': data.get('position_y'),
                }
            )
        elif message_type == 'task_update':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'task_update',
                    'task_id': data.get('task_id'),
                    'title': data.get('title'),
                    'status': data.get('status'),
                }
            )
        elif message_type == 'connection_update':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'connection_update',
                    'connection_id': data.get('connection_id'),
                    'source': data.get('source'),
                    'target': data.get('target'),
                    'label': data.get('label'),
                }
            )
        elif message_type == 'delete_goal':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'delete_goal',
                    'goal_id': data.get('goal_id'),
                }
            )
        elif message_type == 'connection_delete':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'connection_delete',
                    'connection_id': data.get('connection_id'),
                }
            )

    async def cursor_update(self, event):
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'cursor_update',
                'user_id': event['user_id'],
                'username': event['username'],
                'x': event['x'],
                'y': event['y'],
            }))

    async def sticky_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'sticky_update',
            'sticky_id': event['sticky_id'],
            'text': event['text'],
            'position_x': event['position_x'],
            'position_y': event['position_y'],
        }))

    async def goal_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'goal_update',
            'goal_id': event['goal_id'],
            'title': event['title'],
            'description': event['description'],
            'status': event['status'],
            'position_x': event['position_x'],
            'position_y': event['position_y'],
        }))

    async def subgoal_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'subgoal_update',
            'subgoal_id': event['subgoal_id'],
            'title': event['title'],
            'description': event['description'],
            'status': event['status'],
            'position_x': event['position_x'],
            'position_y': event['position_y'],
        }))

    async def task_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'task_id': event['task_id'],
            'title': event['title'],
            'status': event['status'],
        }))

    async def connection_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connection_update',
            'connection_id': event['connection_id'],
            'source': event['source'],
            'target': event['target'],
            'label': event['label'],
        }))

    async def delete_goal(self, event):
        await self.send(text_data=json.dumps({
            'type': 'delete_goal',
            'goal_id': event['goal_id'],
        }))

    async def connection_delete(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connection_delete',
            'connection_id': event['connection_id'],
        }))