"use client";
import React, { createContext, useState, useCallback } from "react";
import { notificationService } from "@/lib/service/notification-api";
import { toast } from "sonner";

export type NotificationType = "NEW_REQUEST" | "REQUEST_APPROVED" | "REQUEST_REJECTED";

export interface Notification {
    id: number;
    content: string;
    type: NotificationType;
    read: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (noti: Notification) => void;
    markOneRead: (id: number) => void;
    markAllRead: () => void;
    loadNotifications: () => Promise<void>;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const loadNotifications = useCallback(async () => {
        try {
            const res = await notificationService.getMyNotifications();
            const all: Notification[] = res.result || [];
            setNotifications(all);
            const unread = all.filter((n: Notification) => !n.read).length;
            if (unread > 0) {
                toast.info(`Bạn có ${unread} thông báo mới chưa đọc`);
            }
        } catch (e) {
            console.error("Failed to load notifications:", e);
        }
    }, []);

    const addNotification = (noti: Notification) => {
        setNotifications(prev => [noti, ...prev]);
    };

    const markOneRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (e) {
            console.error("Failed to mark notification as read:", e);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) {
            console.error("Failed to mark all as read:", e);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markOneRead, markAllRead, loadNotifications, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
};
