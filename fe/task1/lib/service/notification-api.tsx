import api from "@/lib/axios";

export const notificationService = {
    getMyNotifications: async () => {
        const res = await api.get("/notifications");
        return res.data;
    },
    getUnreadCount: async () => {
        const res = await api.get("/notifications/unread-count");
        return res.data;
    },
    markAsRead: async (id: number) => {
        const res = await api.put(`/notifications/${id}/read`);
        return res.data;
    },
    markAllAsRead: async () => {
        const res = await api.put("/notifications/read-all");
        return res.data;
    },
};
