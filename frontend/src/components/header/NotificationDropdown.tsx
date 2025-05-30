"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGetNotificationsQuery, useMarkAllNotificationsAsReadMutation, useMarkNotificationAsReadMutation } from "@/state/api";
import { Bell } from "lucide-react";

interface Notification {
    id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    project?: { id: number; name: string };
    task?: { id: number; title: string };
    subtask?: { id: number; title: string };
    comment?: {
        id: number;
        content: string;
        user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        profile_image?: string;
        role?: string;
        role_display?: string;
        };
    };
    team?: { id: number; name: string };
    goal?: { id: number; title: string };
    subgoal?: { id: number; title: string };
    sticky_note?: { id: number; text: string };
}

const NotificationDropdown: React.FC<{ projectId: number | null }> = ({ projectId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: notifications = [], isLoading, error, refetch } = useGetNotificationsQuery(undefined, {
        pollingInterval: 5000,
    });
    const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();
    const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
    const hasUnread = notifications.some((n) => !n.is_read);

    useEffect(() => {
        if (isOpen && hasUnread) {
        const markAllAsRead = async () => {
            try {
            await markAllNotificationsAsRead().unwrap();
            refetch();
            } catch (err) {
            //   console.error("Рид:", err);
            }
        };
        markAllAsRead();
        }
    }, [isOpen, hasUnread, markAllNotificationsAsRead, refetch]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
        try {
            await markNotificationAsRead(notification.id).unwrap();
            refetch();
        } catch (err) {
            // console.error("Ошибка", err);
        }
        }
        setIsOpen(false);
    };

    const getNotificationLink = (notification: Notification) => {
        if (notification.comment) {
        return notification.task
            ? `/tasks/${notification.task.id}`
            : notification.subtask
            ? `/tasks/${notification.subtask.id}`
            : "#";
        }
        if (notification.task) return `/tasks/${notification.task.id}`;
        if (notification.subtask) return `/tasks/${notification.subtask.id}`;
        if (notification.project) return `/projects/${notification.project.id}`;
        if (notification.team) return `/teams/${notification.team.id}`;
        if (notification.goal) return `/projects/${notification.project?.id}/goals`;
        if (notification.subgoal) return `/projects/${notification.project?.id}/goals`;
        if (notification.sticky_note) return `/projects/${notification.project?.id}/sticky-notes`;
        return "#";
    };

    const getNotificationContent = (notification: Notification) => {
        if (notification.comment) {
        const username = notification.comment.user?.username || "Unknown User";
        if (!notification.comment.user?.username) {
            console.warn(
            `Митт ${notification.id}. Ком:`,
            notification.comment.user
            );
        }
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">{username}</span>{" "}
            прокомментировал: "{notification.comment.content.substring(0, 50)}
            {notification.comment.content.length > 50 ? "..." : ""}"
            </>
        );
        }
        if (notification.task) {
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">Задача: {notification.task.title}</span>{" "}
            {notification.message}
            </>
        );
        }
        if (notification.subtask) {
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">Подзадача: {notification.subtask.title}</span>{" "}
            {notification.message}
            </>
        );
        }
        if (notification.goal) {
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">Цель: {notification.goal.title}</span>{" "}
            {notification.message}
            </>
        );
        }
        if (notification.subgoal) {
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">Подцель: {notification.subgoal.title}</span>{" "}
            {notification.message}
            </>
        );
        }
        if (notification.sticky_note) {
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">Стикер</span> {notification.message}
            </>
        );
        }
        if (notification.team) {
        return (
            <>
            <span className="font-medium text-gray-900 dark:text-gray-100">Команда: {notification.team.name}</span>{" "}
            {notification.message}
            </>
        );
        }
        return notification.message;
    };
    const getAvatarInitial = (notification: Notification) => {
        const user = notification.comment?.user;
        console.log('User data:', user);
        if (!user) {
        console.warn('М');
        return 'U';
        }
        const username = user.username;
        if (!username || username.trim().length === 0) {
        console.warn('М шв', notification.id);
        return 'U';
        }
        return username.charAt(0).toUpperCase();
        };
    return (
        <div className="relative">
        <button
            onClick={toggleDropdown}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
            {hasUnread && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            )}
            <Bell className="w-6 h-6 text-gray-500 hover:text-gray-800 dark:text-gray-300" />
        </button>
        {isOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Уведомления</h5>
                <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    />
                </svg>
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                <li className="p-4 text-gray-500 dark:text-gray-400 text-center">Загрузка...</li>
                ) : error ? (
                <li className="p-4 text-red-500 dark:text-red-400 text-center">Ошибка загрузки уведомлений: {JSON.stringify(error, null, 2)}</li>
                ) : notifications.length === 0 ? (
                <li className="p-4 text-gray-500 dark:text-gray-400 text-center">Нет уведомлений</li>
                ) : (
                notifications.map((notification) => (
                    <li key={notification.id}>
                    <Link
                        href={getNotificationLink(notification)}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                        notification.is_read ? "opacity-75" : "bg-blue-50 dark:bg-blue-900/30"
                        }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center overflow-hidden shrink-0">
                        {notification.comment?.user?.profile_image ? (
                            <img
                            className="w-full h-full object-cover"
                            src={notification.comment.user.profile_image}
                            alt={notification.comment.user.username || "User"}
                            />
                        ) : (
                            <span className="text-sm font-medium text-white">{getAvatarInitial(notification)}</span>
                        )}
                        </div>
                        <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {getNotificationContent(notification)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{notification.project?.name || "Проект"}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>
                            {new Date(notification.created_at).toLocaleString("ru-RU", {
                                dateStyle: "short",
                                timeStyle: "short",
                            })}
                            </span>
                        </div>
                        </div>
                    </Link>
                    </li>
                ))
                )}
            </ul>
            </div>
        )}
        </div>
    );
};

export default NotificationDropdown;