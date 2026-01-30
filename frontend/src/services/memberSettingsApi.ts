import api from './api';

export type MemberSettingsDTO = {
    profile: any;
    preferences: {
        workoutPreferences?: string;
        skillLevel?: string;
        theme?: string;
        language?: string;
    };
    notifications: {
        workoutReminders?: boolean;
        classSchedule?: boolean;
        trainerMessages?: boolean;
        marketingEmails?: boolean;
    };
    privacy: {
        profileVisibility?: string;
        showProgressPhotos?: boolean;
        allowTrainerAccess?: boolean;
    };
}

export const memberSettingsApi = {
    getSettings: async (userId: number) => {
        const response = await api.get(`/member/settings/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: number, data: any) => {
        const response = await api.patch(`/member/settings/${userId}/profile`, data);
        return response.data;
    },

    updatePreferences: async (userId: number, data: any) => {
        const response = await api.patch(`/member/settings/${userId}/preferences`, data);
        return response.data;
    },

    updateNotifications: async (userId: number, data: any) => {
        const response = await api.patch(`/member/settings/${userId}/notifications`, data);
        return response.data;
    },

    updatePrivacy: async (userId: number, data: any) => {
        const response = await api.patch(`/member/settings/${userId}/privacy`, data);
        return response.data;
    },

    changePassword: async (userId: number, data: any) => {
        const response = await api.post(`/member/settings/${userId}/change-password`, data);
        return response.data;
    },

    getSessions: async (userId: number) => {
        const response = await api.get(`/member/settings/${userId}/sessions`);
        return response.data;
    }
};
