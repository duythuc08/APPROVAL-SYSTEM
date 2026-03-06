import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from "sonner"
import {notificationService} from "@/lib/service/notification-api";

const handleNotificationClick = async (id: number) => {
    try {
        await notificationService.markAsRead(id);
    } catch (e) {
        console.error("Failed to mark notification as read:", e);
    }
}

export const useWebSocket = (role: string, token: string) => {
    const {addNotification} = useNotifications();

    useEffect(() => {
        if (!token || !role) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/task1/ws-notification'),
            connectHeaders: {Authorization: `Bearer ${token}`},
            onConnect: () => {
                // Subscribe cho Admin (broadcast)
                if (role === 'ROLE_ADMIN') {
                    client.subscribe('/topic/admin-notifications', (msg) => {
                        const noti = JSON.parse(msg.body);
                        processNewNoti(noti);
                    });
                }
                // Subscribe ca nhan (Approver/User)
                client.subscribe('/user/queue/notifications', (msg) => {
                    const noti = JSON.parse(msg.body);
                    processNewNoti(noti);
                });
            },
            onStompError: (frame) => {
                console.error('WebSocket STOMP error:', frame.headers['message']);
            },
            reconnectDelay: 5000,
        });

        const processNewNoti = (noti: any) => {
            addNotification(noti);
            toast("Thông báo mới", {
                description: (
                    <div className="flex flex-col gap-1">
                        <p className="text-black">{noti.content}</p>
                    </div>
                ),
                action: {
                    label: "Đã đọc",
                    onClick: () => handleNotificationClick(noti.id)
                }
            });
        }

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [role, token]);
}