import { apiClient } from '../services/api';

export interface NotificationData {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    priority: string;
    isStarred: boolean;
    isArchived: boolean;
    metaData?: string;
    link?: string;
    senderId?: number;
    actionData?: string;
}

export interface NotificationStats {
    total: number;
    unread: number;
    starred: number;
    archived: number;
    urgent: number;
    typeCounts: Record<string, number>;
}

export const notificationApi = {
    getUserNotifications: async (userId: number, filter: string = 'all') => {
        const response = await apiClient.get<NotificationData[]>(`/notifications/user/${userId}`, {
            params: { filter }
        });
        return response.data;
    },

    getByType: async (userId: number, type: string) => {
        const response = await apiClient.get<NotificationData[]>(`/notifications/user/${userId}/by-type`, {
            params: { type }
        });
        return response.data;
    },

    getByPriority: async (userId: number, priority: string) => {
        const response = await apiClient.get<NotificationData[]>(`/notifications/user/${userId}/by-priority`, {
            params: { priority }
        });
        return response.data;
    },

    getUnreadCount: async (userId: number) => {
        const response = await apiClient.get<{ count: number }>(`/notifications/user/${userId}/unread-count`);
        return response.data.count;
    },

    getStats: async (userId: number) => {
        const response = await apiClient.get<NotificationStats>(`/notifications/user/${userId}/stats`);
        return response.data;
    },

    markAsRead: async (notificationId: number) => {
        const response = await apiClient.put<NotificationData>(`/notifications/${notificationId}/read`);
        return response.data;
    },

    toggleStar: async (notificationId: number) => {
        const response = await apiClient.put<NotificationData>(`/notifications/${notificationId}/star`);
        return response.data;
    },

    archive: async (notificationId: number) => {
        const response = await apiClient.put<NotificationData>(`/notifications/${notificationId}/archive`);
        return response.data;
    },

    unarchive: async (notificationId: number) => {
        const response = await apiClient.put<NotificationData>(`/notifications/${notificationId}/unarchive`);
        return response.data;
    },

    delete: async (notificationId: number) => {
        await apiClient.delete(`/notifications/${notificationId}`);
    },

    bulkAction: async (action: string, ids: number[]) => {
        const response = await apiClient.post(`/notifications/bulk-action`, { action, ids });
        return response.data;
    },

    markAllAsRead: async (userId: number) => {
        const response = await apiClient.put(`/notifications/user/${userId}/read-all`);
        return response.data;
    }
};
