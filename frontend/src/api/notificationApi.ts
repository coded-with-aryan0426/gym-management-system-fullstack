import { apiClient } from '../services/api';

// Types (should match backend model)
export interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string; // ISO date string
    priority: 'high' | 'normal' | 'low';
    isStarred: boolean;
    isArchived: boolean;
    metaData?: string; // JSON string
    link?: string;
    senderId?: number;
    actionData?: string; // JSON string
    user?: {
        userId: number;
        fullName: string;
        avatarId?: string;
    };
}

export const notificationApi = {
    // Get notifications with filter
    getUserNotifications: async (userId: number, filter: 'all' | 'unread' | 'starred' | 'archived' = 'all') => {
        const response = await apiClient.get<Notification[]>(`/notifications/user/${userId}`, {
            params: { filter }
        });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async (userId: number) => {
        const response = await apiClient.get<{ count: number }>(`/notifications/user/${userId}/unread-count`);
        return response.data.count;
    },

    // Mark as read
    markAsRead: async (notificationId: number) => {
        const response = await apiClient.put<Notification>(`/notifications/${notificationId}/read`);
        return response.data;
    },

    // Toggle star
    toggleStar: async (notificationId: number) => {
        const response = await apiClient.put<Notification>(`/notifications/${notificationId}/star`);
        return response.data;
    },

    // Archive
    archive: async (notificationId: number) => {
        const response = await apiClient.put<Notification>(`/notifications/${notificationId}/archive`);
        return response.data;
    },

    // Delete
    delete: async (notificationId: number) => {
        await apiClient.delete(`/notifications/${notificationId}`);
    },

    // Bulk actions
    bulkAction: async (action: 'read' | 'archive' | 'delete', ids: number[]) => {
        const response = await apiClient.post(`/notifications/bulk-action`, {
            action,
            ids
        });
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async (userId: number) => {
        const response = await apiClient.put(`/notifications/user/${userId}/read-all`);
        return response.data;
    }
};
