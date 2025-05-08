"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MessageSquare, Plus, Filter } from 'lucide-react';
import {
  useGetTasksQuery,
  useGetProjectGoalsQuery,
  useGetStickyNotesQuery,
  useGetStrategicConnectionsQuery,
  useGetSubGoalsQuery,
  useCreateStickyNoteMutation,
  useUpdateProjectGoalMutation,
  useCreateStrategicConnectionMutation,
  useCreateProjectGoalMutation,
  useDeleteProjectGoalMutation,
  useDeleteStickyNoteMutation,
  useDeleteStrategicConnectionMutation,
  useUpdateStickyNoteMutation,
  useUpdateGoalProgressMutation,
  useCreateSubGoalMutation,
  useUpdateSubGoalMutation,
  useDeleteSubGoalMutation,
} from '@/state/api';
import { Task, ProjectGoal, StickyNote, StrategicConnection, SubGoal } from '@/state/api';
import CustomEdge from '@/components/Map/CustomEdge';
import GoalNode from '@/components/Map/GoalNode';
import SubgoalNode from '@/components/Map/SubgoalNode';
import StickyNoteComponent from '@/components/Map/StickyNote';
import TaskNode from '@/components/Map/TaskNode';
import useStrategicMapWebSocket from '@/hooks/useStrategicMapWebSocket';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { debounce, throttle } from 'lodash';

const nodeTypes = {
  goal: GoalNode,
  subgoal: SubgoalNode,
  task: TaskNode,
};

const edgeTypes = {
  custom: CustomEdge,
};
interface StrategicMapProps {
  projectId: number;
}

const StrategicMapInner: React.FC<StrategicMapProps> = ({ projectId }) => {
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery({ projectId }, { pollingInterval: 30000 });
  const { data: goals = [], isLoading: goalsLoading } = useGetProjectGoalsQuery({ projectId }, { pollingInterval: 30000 });
  const { data: initialStickies = [], isLoading: stickiesLoading } = useGetStickyNotesQuery({ projectId }, { pollingInterval: 30000 });
  const { data: connections = [], isLoading: connectionsLoading, refetch: refetchConnections } = useGetStrategicConnectionsQuery({ projectId }, { pollingInterval: 30000 });
  const { data: subgoals = [], isLoading: subgoalsLoading } = useGetSubGoalsQuery({ goalId: goals.length > 0 ? goals[0].id : 0 }, { pollingInterval: 30000 });
  const [createStickyNote] = useCreateStickyNoteMutation();
  const [updateGoal] = useUpdateProjectGoalMutation();
  const [createConnection] = useCreateStrategicConnectionMutation();
  const [createGoalMutation] = useCreateProjectGoalMutation();
  const [deleteGoal] = useDeleteProjectGoalMutation();
  const [deleteStickyNote] = useDeleteStickyNoteMutation();
  const [deleteConnection] = useDeleteStrategicConnectionMutation();
  const [updateStickyNote] = useUpdateStickyNoteMutation();
  const [updateGoalProgress] = useUpdateGoalProgressMutation();
  const [createSubGoal] = useCreateSubGoalMutation();
  const [updateSubGoal] = useUpdateSubGoalMutation();
  const [deleteSubGoal] = useDeleteSubGoalMutation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [stickies, setStickies] = useState<StickyNote[]>(initialStickies);
  const [userCursors, setUserCursors] = useState<{ id: number; x: number; y: number; username: string; color: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTasksAsNodes, setShowTasksAsNodes] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const pendingConnectionsRef = useRef<StrategicConnection[]>([]);
  // const containerRef = useRef<HTMLDivElement>(null);
  const [currentUserCursor, setCurrentUserCursor] = useState<{ x: number; y: number } | null>(null);
  const { user } = useAuth();
  const lastCursorPosition = useRef<{ x: number; y: number } | null>(null);

  const debouncedRefetchConnections = useMemo(
    () => debounce(() => refetchConnections(), 0),
    [refetchConnections]
  );
  const getRandomColor = (userId: number) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[userId % colors.length];
  };

  const { 
    sendCursorUpdate, 
    sendGoalUpdate, 
    sendStickyUpdate, 
    sendSubgoalUpdate, 
    sendTaskUpdate,
    sendConnectionUpdate,
    sendDeleteGoal,
    sendConnectionDelete,
  } = useStrategicMapWebSocket(
    projectId,
    (data) => {
      // console.log('Курсор:', data);
      if (data.user_id === user?.id) return;
      const flowPosition = screenToFlowPosition({ x: data.x, y: data.y });
      setUserCursors((cursors) => {
        const existing = cursors.find((c) => c.id === data.user_id);
        if (existing) {
          return cursors.map((c) => (c.id === data.user_id ? { ...c, x: data.x, y: data.y, username: data.username } : c));
        }
        return [...cursors, { id: data.user_id, username: data.username, x: data.x, y: data.y, color: getRandomColor(data.user_id) }];
      });
    },
    (data) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === `sticky-${data.sticky_id}`
            ? { ...node, position: { x: data.position_x, y: data.position_y }, data: { ...node.data, text: data.text } }
            : node
        )
      );
      setStickies((prev) =>
        prev.map((sticky) =>
          sticky.id === data.sticky_id ? { ...sticky, text: data.text, position_x: data.position_x, position_y: data.position_y } : sticky
        )
      );
    },
    (data) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === `goal-${data.goal_id}`
            ? { ...node, position: { x: data.position_x, y: data.position_y }, data: { ...node.data, label: data.title, description: data.description, status: data.status } }
            : node
        )
      );
    },
    (data) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === `subgoal-${data.subgoal_id}`
            ? { ...node, position: { x: data.position_x, y: data.position_y }, data: { ...node.data, label: data.title, description: data.description, status: data.status } }
            : node
        )
      );
    },
    (data) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === `task-${data.task_id}`
            ? { ...node, data: { ...node.data, task: { ...node.data.task, title: data.title, status: data.status } } }
            : node
        )
      );
    },
    (data) => {
      setEdges((eds) => {
        const edgeId = `edge-${data.connection_id}`;
        const existingEdge = eds.find((edge) => edge.id === edgeId);
        if (existingEdge) {
          return eds.map((edge) =>
            edge.id === edgeId
              ? { ...edge, source: data.source, target: data.target, data: { ...edge.data, label: data.label } }
              : edge
          );
        }
        return [
          ...eds,
          {
            id: edgeId,
            source: data.source,
            target: data.target,
            type: 'custom',
            animated: true,
            style: { stroke: '#6b7280', strokeWidth: 2 },
            data: { label: data.label, onDelete: () => handleDeleteConnection(data.connection_id) },
          },
        ];
      });
    },
    (data) => {
      setNodes((nds) => nds.filter((node) => node.id !== `goal-${data.goal_id}`));
      setEdges((eds) => eds.filter((edge) => edge.source !== `goal-${data.goal_id}` && edge.target !== `goal-${data.goal_id}`));
    },
    (data) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== `edge-${data.connection_id}`));
    }
  );

  // const debouncedSendCursorUpdate = useMemo(
  //   () => debounce((userId: number, username: string, x: number, y: number) => {
  //     sendCursorUpdate(userId, username, x, y);
  //   }, 0),
  //   [sendCursorUpdate]
  // );
  const debouncedSendGoalUpdate = useMemo(
    () => debounce((id: number, title: string, description: string, status: string, x: number, y: number) => {
      sendGoalUpdate(id, title, description, status, x, y);
    }, 0),
    [sendGoalUpdate]
  );
  const debouncedSendSubgoalUpdate = useMemo(
    () => debounce((id: number, title: string, description: string, status: string, x: number, y: number) => {
      sendSubgoalUpdate(id, title, description, status, x, y);
    }, 0),
    [sendSubgoalUpdate]
  );
  const debouncedSendStickyUpdate = useMemo(
    () => debounce((id: number, text: string, x: number, y: number) => {
      sendStickyUpdate(id, text, x, y);
    }, 0),
    [sendStickyUpdate]
  );

  const debouncedSendConnectionUpdate = useMemo(
    () => debounce((id: number, source: string, target: string, label: string) => {
      sendConnectionUpdate(id, source, target, label);
    }, 0),
    [sendConnectionUpdate]
  );

  const computedNodes = useMemo(() => {
    const newNodes: Node[] = [];
    goals.forEach((goal: ProjectGoal) => {
      const goalTasks = tasks.filter((task) =>
        connections.some((conn) => conn.source_goal === goal.id && conn.target_task === task.id)
      );
      const progress = goalTasks.length
        ? Math.round((goalTasks.filter((t) => t.status === 'Завершено').length / goalTasks.length) * 100)
        : 0;
      newNodes.push({
        id: `goal-${goal.id}`,
        type: 'goal',
        position: { x: goal.position_x, y: goal.position_y },
        data: {
          label: goal.title,
          description: goal.description,
          status: goal.status,
          tasks: goalTasks,
          progress,
          onDelete: () => handleDeleteGoal(goal.id),
          onUpdate: (updatedData: { title: string; description: string; status: string }) =>
            handleUpdateGoal(goal.id, updatedData),
          onAssignTask: (taskIds: number[]) => handleAssignTask(goal.id, taskIds, false),
          onAddSubgoal: () => handleAddSubgoal(goal.id),
          availableTasks: tasks,
        },
      });
    });

    subgoals.forEach((subgoal: SubGoal) => {
      const subgoalTasks = tasks.filter((task) =>
        [...connections, ...pendingConnectionsRef.current].some(
          (conn) => conn.source_subgoal === subgoal.id && conn.target_task === task.id
        )
      );
      const progress = subgoalTasks.length
        ? Math.round((subgoalTasks.filter((t) => t.status === 'Завершено').length / subgoalTasks.length) * 100)
        : 0;
      newNodes.push({
        id: `subgoal-${subgoal.id}`,
        type: 'subgoal',
        position: { x: subgoal.position_x, y: subgoal.position_y },
        data: {
          label: subgoal.title,
          description: subgoal.description,
          status: subgoal.status,
          tasks: subgoalTasks,
          progress,
          onDelete: () => handleDeleteSubgoal(subgoal.id),
          onUpdate: (updatedData: { title: string; description: string; status: string }) =>
            handleUpdateSubgoal(subgoal.id, updatedData),
          onAssignTask: (taskIds: number[]) => handleAssignTask(subgoal.id, taskIds, true),
          availableTasks: tasks,
        },
      });
    });
    if (showTasksAsNodes) {
      tasks.forEach((task: Task, index: number) => {
        newNodes.push({
          id: `task-${task.id}`,
          type: 'task',
          position: { x: 100 + index * 300, y: 400 },
          data: { task },
        });
      });
    }

    return newNodes;
  }, [goals, tasks, connections, subgoals, showTasksAsNodes]);

  const computedEdges = useMemo(() => {
    const edgeMap = new Map<string, Edge>();
    const pendingConnectionIds = new Set(pendingConnectionsRef.current.map((conn) => conn.id));
    [...connections, ...pendingConnectionsRef.current].forEach((conn: StrategicConnection) => {
      let sourceId = '';
      let targetId = '';
      if (conn.source_goal) sourceId = `goal-${conn.source_goal}`;
      else if (conn.source_subgoal) sourceId = `subgoal-${conn.source_subgoal}`;
      if (conn.target_goal) targetId = `goal-${conn.target_goal}`;
      else if (conn.target_subgoal) targetId = `subgoal-${conn.target_subgoal}`;
      else if (conn.target_task) targetId = `task-${conn.target_task}`;

      if (sourceId && targetId) {
        const edgeId = `edge-${conn.id}`;
        if (!edgeMap.has(edgeId) || pendingConnectionIds.has(conn.id)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: sourceId,
            target: targetId,
            type: 'custom',
            animated: true,
            style: { stroke: '#6b7280', strokeWidth: 2 },
            data: {
              label: conn.label || '',
              onDelete: () => handleDeleteConnection(conn.id),
            },
          });
        }
      }
    });
    return Array.from(edgeMap.values());
  }, [connections]);

  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
    setStickies(initialStickies);
}, [computedNodes, computedEdges, initialStickies]);
  // useEffect(() => {
  //   setStickies(initialStickies);
  // }, [initialStickies]);

  const throttledSendCursorUpdate = useMemo(
    () =>
      throttle(
        (userId: number, username: string, x: number, y: number) => {
          sendCursorUpdate(userId, username, x, y);
        },
        50
      ),
    [sendCursorUpdate]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const screenPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      setCurrentUserCursor(screenPosition);

      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (user && user.id) {
        throttledSendCursorUpdate(user.id, user.username, flowPosition.x, flowPosition.y);
      }
      lastCursorPosition.current = flowPosition;
    },
    [screenToFlowPosition, user, throttledSendCursorUpdate]
  );

  const handleMouseLeave = useCallback(() => {
    setCurrentUserCursor(null);
  }, []);
  const addGoal = async () => {
    const newGoal = {
      project: projectId,
      title: 'Новая цель',
      description: 'Описание новой цели',
      status: 'Новая',
      position_x: 200,
      position_y: 200,
    };
    try {
      await createGoalMutation(newGoal).unwrap();
    } catch (error) {
      console.error('Не удалось создать цель:', error);
    }
  };

  const addStickyNote = async () => {
    const newSticky = {
      project: projectId,
      text: 'Новый комментарий...',
      position_x: 100,
      position_y: 100,
    };
    try {
      await createStickyNote(newSticky).unwrap();
    } catch (error) {
      console.error('Не удалось создать заметку:', error);
    }
  };

  const onNodeDrag = useCallback(
    async (event: any, node: Node) => {
      const nodeId = node.id.split('-')[0];
      const id = parseInt(node.id.split('-')[1]);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: { x: node.position.x, y: node.position.y } } : n
        )
      );
      try {
        if (nodeId === 'goal') {
          await updateGoal({
            id,
            position_x: node.position.x,
            position_y: node.position.y,
          }).unwrap();
          debouncedSendGoalUpdate(id, node.data.label, node.data.description, node.data.status, node.position.x, node.position.y);
        } else if (nodeId === 'subgoal') {
          await updateSubGoal({
            id,
            position_x: node.position.x,
            position_y: node.position.y,
          }).unwrap();
          debouncedSendSubgoalUpdate(id, node.data.label, node.data.description, node.data.status, node.position.x, node.position.y);
        }
      } catch (error) {
        console.error(`Не удалось обновить позицию ${nodeId}:`, error);
        setNodes((nds) => nds);
      }
    },
    [updateGoal, updateSubGoal, debouncedSendGoalUpdate, debouncedSendSubgoalUpdate, setNodes]
  );

  const onConnect = useCallback(
    async (params: Connection) => {
      const sourceType = params.source?.split('-')[0];
      const targetType = params.target?.split('-')[0];
      const sourceId = params.source ? parseInt(params.source.split('-')[1]) : null;
      const targetId = params.target ? parseInt(params.target.split('-')[1]) : null;

      let connectionType = '';
      let connectionData: any = { label: 'Связь', project: projectId };

      if (sourceType === 'goal' && targetType === 'goal') {
        connectionType = 'goal_to_goal';
        connectionData.source_goal = sourceId;
        connectionData.target_goal = targetId;
      } else if (sourceType === 'goal' && targetType === 'subgoal') {
        connectionType = 'goal_to_subgoal';
        connectionData.source_goal = sourceId;
        connectionData.target_subgoal = targetId;
      } else if (sourceType === 'subgoal' && targetType === 'goal') {
        connectionType = 'subgoal_to_goal';
        connectionData.source_subgoal = sourceId;
        connectionData.target_goal = targetId;
      } else if (sourceType === 'subgoal' && targetType === 'subgoal') {
        connectionType = 'subgoal_to_subgoal';
        connectionData.source_subgoal = sourceId;
        connectionData.target_subgoal = targetId;
      } else if (sourceType === 'goal' && targetType === 'task') {
        connectionType = 'goal_to_task';
        connectionData.source_goal = sourceId;
        connectionData.target_task = targetId;
      } else if (sourceType === 'subgoal' && targetType === 'task') {
        connectionType = 'subgoal_to_task';
        connectionData.source_subgoal = sourceId;
        connectionData.target_task = targetId;
      }

      if (connectionType) {
        connectionData.connection_type = connectionType;
        try {
          const result = await createConnection(connectionData).unwrap();
          const newEdge = {
            id: `edge-${result.id}`,
            source: params.source!,
            target: params.target!,
            type: 'custom',
            animated: true,
            style: { stroke: '#6b7280', strokeWidth: 2 },
            data: { label: connectionData.label, onDelete: () => handleDeleteConnection(result.id) },
          };
          setEdges((eds) => addEdge(newEdge, eds));
          debouncedSendConnectionUpdate(result.id, params.source!, params.target!, connectionData.label);
          pendingConnectionsRef.current.push(result);
          debouncedRefetchConnections();
          pendingConnectionsRef.current = pendingConnectionsRef.current.filter(
            (conn) => conn.id !== result.id
          );
        } catch (error) {
          // console.error('св:', error);
        }
      }
    },
    [createConnection, setEdges, debouncedRefetchConnections, debouncedSendConnectionUpdate, projectId]
  );

  const filteredNodes = useMemo(() => {
    if (filterStatus === 'all') return nodes;
    return nodes.filter((node) => node.data.status === filterStatus);
  }, [nodes, filterStatus]);

  const handleStickyPositionChange = async (id: number, x: number, y: number) => {
    setStickies((prev) =>
      prev.map((sticky) =>
        sticky.id === id ? { ...sticky, position_x: x, position_y: y } : sticky
      )
    );
    try {
      await updateStickyNote({ id, position_x: x, position_y: y }).unwrap();
      debouncedSendStickyUpdate(id, stickies.find((s) => s.id === id)?.text || '', x, y);
    } catch (error) {
      // console.error('З:', error);
      setStickies((prev) => prev);
    }
  };

  const handleStickyTextChange = async (id: number, text: string) => {
    setStickies((prev) =>
      prev.map((sticky) =>
        sticky.id === id ? { ...sticky, text } : sticky
      )
    );
    try {
      await updateStickyNote({ id, text }).unwrap();
      debouncedSendStickyUpdate(id, text, stickies.find((s) => s.id === id)?.position_x || 0, stickies.find((s) => s.id === id)?.position_y || 0);
    } catch (error) {
      // console.error('З:', error);
      setStickies((prev) => prev);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await deleteGoal(id).unwrap();
      sendDeleteGoal(id);
    } catch (error) {
      // console.error('Ц:', error);
    }
  };

  const handleDeleteSubgoal = async (id: number) => {
    try {
      await deleteSubGoal(id).unwrap();
      setEdges((eds) => eds.filter((edge) => edge.source !== `subgoal-${id}` && edge.target !== `subgoal-${id}`));
    } catch (error) {
      // console.error('ПЦ:', error);
    }
  };

  const handleDeleteSticky = async (id: number) => {
    try {
      await deleteStickyNote(id).unwrap();
      setStickies((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      // console.error('Уд_з:', error);
    }
  };

  const handleDeleteConnection = async (id: number) => {
    try {
      await deleteConnection(id).unwrap();
      setEdges((eds) => eds.filter((edge) => edge.id !== `edge-${id}`));
      sendConnectionDelete(id);
    } catch (error) {
      // console.error('Уд_с:', error);
    }
  };

  const handleUpdateGoal = async (goalId: number, updatedData: { title: string; description: string; status: string }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === `goal-${goalId}`
          ? { ...node, data: { ...node.data, ...updatedData } }
          : node
      )
    );
    try {
      await updateGoal({
        id: goalId,
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status,
      }).unwrap();
      const goal = goals.find((g) => g.id === goalId);
      debouncedSendGoalUpdate(goalId, updatedData.title, updatedData.description, updatedData.status, goal?.position_x || 0, goal?.position_y || 0);
    } catch (error) {
      // console.error('О_ц:', error);
      setNodes((nds) => nds);
    }
  };

  const handleUpdateSubgoal = async (subgoalId: number, updatedData: { title: string; description: string; status: string }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === `subgoal-${subgoalId}`
          ? { ...node, data: { ...node.data, ...updatedData } }
          : node
      )
    );
    try {
      await updateSubGoal({
        id: subgoalId,
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status,
      }).unwrap();
      const subgoal = subgoals.find((s) => s.id === subgoalId);
      debouncedSendSubgoalUpdate(subgoalId, updatedData.title, updatedData.description, updatedData.status, subgoal?.position_x || 0, subgoal?.position_y || 0);
    } catch (error) {
      // console.error('Оь:', error);
      setNodes((nds) => nds);
    }
  };

  const handleAssignTask = async (id: number, taskIds: number[], isSubgoal: boolean = false) => {
    try {
      const newEdges: Edge[] = [];
      const newPendingConnections: StrategicConnection[] = [];
      for (const taskId of taskIds) {
        const newConnection = {
          connection_type: isSubgoal ? 'subgoal_to_task' : 'goal_to_task',
          [isSubgoal ? 'source_subgoal' : 'source_goal']: id,
          target_task: taskId,
          label: 'Связь с задачей',
          project: projectId,
        };
        const result = await createConnection(newConnection).unwrap();
        newPendingConnections.push(result);
        const newEdge = {
          id: `edge-${result.id}`,
          source: `${isSubgoal ? 'subgoal' : 'goal'}-${id}`,
          target: `task-${taskId}`,
          type: 'custom',
          animated: true,
          style: { stroke: '#6b7280', strokeWidth: 2 },
          data: { label: newConnection.label, onDelete: () => handleDeleteConnection(result.id) },
        };
        newEdges.push(newEdge);
        debouncedSendConnectionUpdate(result.id, newEdge.source, newEdge.target, newConnection.label);
      }
      pendingConnectionsRef.current = [...pendingConnectionsRef.current, ...newPendingConnections];
      setEdges((eds) => [...eds.filter((edge) => !newEdges.some((newEdge) => newEdge.id === edge.id)), ...newEdges]);
    } catch (error) {
      // console.error(`Не удалось назначить задачу ${isSubgoal ? 'подцели' : 'цели'}:`, error);
    }
  };

  const debouncedHandleAddSubgoal = useMemo(
    () =>
      debounce(async (goalId: number) => {
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return;
        const newSubgoal = {
          goal: goalId,
          title: 'Новая подцель',
          description: 'Описание подцели',
          status: 'Новая',
          position_x: goal.position_x + 50,
          position_y: goal.position_y + 150,
        };
        try {
          const subgoalResult = await createSubGoal(newSubgoal).unwrap();
          const connectionData = {
            connection_type: 'goal_to_subgoal',
            source_goal: goalId,
            target_subgoal: subgoalResult.id,
            label: 'Связь с подцелью',
            project: projectId,
          };
          const existingConnection = connections.find(
            (conn) =>
              conn.connection_type === 'goal_to_subgoal' &&
              conn.source_goal === goalId &&
              conn.target_subgoal === subgoalResult.id
          );
          if (existingConnection) {
            return;
          }
          const connectionResult = await createConnection(connectionData).unwrap();
          pendingConnectionsRef.current.push(connectionResult);
          setEdges((eds) => {
            const edgeId = `edge-${connectionResult.id}`;
            if (eds.some((edge) => edge.id === edgeId)) {
              return eds;
            }
            const newEdges = addEdge(
              {
                id: edgeId,
                source: `goal-${goalId}`,
                target: `subgoal-${subgoalResult.id}`,
                type: 'custom',
                animated: true,
                style: { stroke: '#6b7280', strokeWidth: 2 },
                data: { label: connectionData.label, onDelete: () => handleDeleteConnection(connectionResult.id) },
              },
              eds
            );
            return newEdges;
          });
          debouncedRefetchConnections();
          pendingConnectionsRef.current = pendingConnectionsRef.current.filter(
            (conn) => conn.id !== connectionResult.id
          );
        } catch (error) {
          // console.error('Тр', error);
        }
      }, 0),
    [createSubGoal, createConnection, goals, connections, setEdges, debouncedRefetchConnections, projectId]
  );

  const handleAddSubgoal = (goalId: number) => {
    debouncedHandleAddSubgoal(goalId);
  };
//  const handleDeleteConnection = async (id: number) => {
  //   try {
  //     await deleteConnection(id).unwrap();
  //     setEdges((eds) => eds.filter((edge) => edge.id !== `edge-${id}`));
  //     sendConnectionDelete(id);
  //   } catch (error) {
  //     // console.error('Уд_с:', error);
  //   }
  const stickyComponents = useMemo(
    () =>
      stickies.map((sticky: StickyNote) => (
        <StickyNoteComponent
          key={sticky.id}
          sticky={sticky}
          onPositionChange={handleStickyPositionChange}
          onTextChange={handleStickyTextChange}
          onDelete={handleDeleteSticky}
        />
      )),
    [stickies, handleStickyPositionChange, handleStickyTextChange, handleDeleteSticky]
  );

  return (
    <div
      className="w-full h-[calc(100vh-230px)] relative bg-gray-50 cursor-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {tasksLoading || goalsLoading || stickiesLoading || connectionsLoading || subgoalsLoading ? (
        <div className="flex items-center justify-center h-full">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 text-lg"
          >
            Загрузка данных карты...
          </motion.p>
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={addGoal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Добавить цель
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={addStickyNote}
              className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg shadow-md hover:bg-yellow-200 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Добавить заметку
            </motion.button>
            <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
              <Filter className="w-4 h-4 mr-2 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border-none focus:outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="Новая">Новая</option>
                <option value="В процессе">В процессе</option>
                <option value="Завершено">Завершено</option>
              </select>
            </div>
            <label className="flex items-center bg-white p-2 rounded-lg shadow-md cursor-pointer">
              <input
                type="checkbox"
                checked={showTasksAsNodes}
                onChange={() => setShowTasksAsNodes(!showTasksAsNodes)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Показать задачи как узлы</span>
            </label>
          </div>

          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeDrag={onNodeDrag}
            fitView
            className="bg-gray-50"
          >
            <Background color="#3b82f6" gap={16} />
            <Controls />
            <MiniMap
              nodeStrokeColor="#6b7280"
              nodeColor="#ffffff"
              className="bg-gray-100 rounded-lg shadow-md"
            />
          </ReactFlow>

          {stickyComponents}

          {currentUserCursor && user && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: currentUserCursor.x - 290,
                top: currentUserCursor.y - 240,
                zIndex: 10,
              }}
            >
              <div
                className="w-3 h-3 rounded-full opacity-70 border border-white"
                style={{ backgroundColor: getRandomColor(user.id) }}
              />
              <div className="text-xs mt-1 text-gray-800 bg-white px-2 py-1 rounded shadow-md">
                Вы
              </div>
            </div>
          )}

          {userCursors
              .filter((cursor) => cursor.id !== user?.id)
              .map((cursor) => (
                  <div
                      key={cursor.id}
                      className="absolute pointer-events-none transition-transform duration-100"
                      style={{
                          left: cursor.x + 374,
                          top: cursor.y + 450,
                          zIndex: 10,
                      }}
                  >
                      <div
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: cursor.color }}
                      />
                      <div className="text-xs mt-1 text-gray-800 bg-white px-2 py-1 rounded shadow-md">
                          {cursor.username}
                      </div>
                  </div>
              ))}

        </>
      )}
    </div>
  );
};

const StrategicMap: React.FC<StrategicMapProps> = (props) => (
  <ReactFlowProvider>
    <StrategicMapInner {...props} />
  </ReactFlowProvider>
);

export default StrategicMap;