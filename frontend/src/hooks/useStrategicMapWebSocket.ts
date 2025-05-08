import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

interface CursorUpdateData {
  type: 'cursor_update';
  user_id: number;
  username: string;
  x: number;
  y: number;
}

interface StickyUpdateData {
  type: 'sticky_update';
  sticky_id: number;
  text: string;
  position_x: number;
  position_y: number;
}

interface GoalUpdateData {
  type: 'goal_update';
  goal_id: number;
  title: string;
  description: string;
  status: string;
  position_x: number;
  position_y: number;
}

interface SubgoalUpdateData {
  type: 'subgoal_update';
  subgoal_id: number;
  title: string;
  description: string;
  status: string;
  position_x: number;
  position_y: number;
}

interface TaskUpdateData {
  type: 'task_update';
  task_id: number;
  title: string;
  status: string;
}

interface ConnectionUpdateData {
  type: 'connection_update';
  connection_id: number;
  source: string;
  target: string;
  label: string;
}

interface DeleteGoalData {
  type: 'delete_goal';
  goal_id: number;
}

interface DeleteConnectionData {
  type: 'connection_delete';
  connection_id: number;
}

const useStrategicMapWebSocket = (
  projectId: number | null,
  onCursorUpdate: (data: CursorUpdateData) => void,
  onStickyUpdate: (data: StickyUpdateData) => void,
  onGoalUpdate: (data: GoalUpdateData) => void,
  onSubgoalUpdate: (data: SubgoalUpdateData) => void,
  onTaskUpdate: (data: TaskUpdateData) => void,
  onConnectionUpdate: (data: ConnectionUpdateData) => void,
  onDeleteGoal: (data: DeleteGoalData) => void,
  onDeleteConnection: (data: DeleteConnectionData) => void
) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId) return;
    const token = Cookies.get('accessToken');
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/strategic_map/${projectId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log('Соединение WebSocket открыто');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('рес:', data);
      switch (data.type) {
        case 'cursor_update':
          onCursorUpdate(data);
          break;
        case 'sticky_update':
          onStickyUpdate(data);
          break;
        case 'goal_update':
          onGoalUpdate(data);
          break;
        case 'subgoal_update':
          onSubgoalUpdate(data);
          break;
        case 'task_update':
          onTaskUpdate(data);
          break;
        case 'connection_update':
          onConnectionUpdate(data);
          break;
        case 'delete_goal':
          onDeleteGoal(data);
          break;
        case 'connection_delete':
          onDeleteConnection(data);
          break;
        default:
          console.warn(`Неизвестный тип сообщения: ${data.type}`);
      }
    };
    ws.onclose = () => console.log('закрыто');

    return () => {
      ws.close();
    };
  }, [projectId, onCursorUpdate, onStickyUpdate, onGoalUpdate, onSubgoalUpdate, onTaskUpdate, onConnectionUpdate, onDeleteGoal, onDeleteConnection]);

  const sendCursorUpdate = (userId: number, username: string, x: number, y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'cursor_update',
          user_id: userId,
          username,
          x,
          y,
        })
      );
    }
  };

  const sendStickyUpdate = (stickyId: number, text: string, position_x: number, position_y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'sticky_update', sticky_id: stickyId, text, position_x, position_y }));
    }
  };

  const sendGoalUpdate = (goalId: number, title: string, description: string, status: string, position_x: number, position_y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'goal_update', goal_id: goalId, title, description, status, position_x, position_y }));
    }
  };

  const sendSubgoalUpdate = (subgoalId: number, title: string, description: string, status: string, position_x: number, position_y: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subgoal_update', subgoal_id: subgoalId, title, description, status, position_x, position_y }));
    }
  };

  const sendTaskUpdate = (taskId: number, title: string, status: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'task_update', task_id: taskId, title, status }));
    }
  };

  const sendConnectionUpdate = (connectionId: number, source: string, target: string, label: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'connection_update', connection_id: connectionId, source, target, label }));
    }
  };

  const sendDeleteGoal = (goalId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'delete_goal', goal_id: goalId }));
    }
  };

  const sendConnectionDelete = (connectionId: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'connection_delete', connection_id: connectionId }));
    }
  };

  return {
    sendCursorUpdate,
    sendStickyUpdate,
    sendGoalUpdate,
    sendSubgoalUpdate,
    sendTaskUpdate,
    sendConnectionUpdate,
    sendDeleteGoal,
    sendConnectionDelete,
  };
};

export default useStrategicMapWebSocket;