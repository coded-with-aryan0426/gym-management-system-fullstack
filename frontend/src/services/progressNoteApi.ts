import { apiClient } from './api';

export interface NoteStat {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export interface NoteAttachment {
    type: 'photo' | 'video' | 'document';
    name: string;
    url?: string;
}

export interface ProgressNoteDTO {
    id?: number;
    member: {
        id?: number; // Added for convenience
        name: string;
        avatar?: string;
        goal?: string;
        startDate?: string;
    };
    date: string;       // YYYY-MM-DD or readable
    time: string;       // HH:mm AM/PM
    sessionType: string;
    category: 'strength' | 'cardio' | 'flexibility' | 'nutrition' | 'general';
    mood: 'excellent' | 'good' | 'average' | 'struggling';
    content: string;
    highlights?: string[];
    concerns?: string[];
    goals?: string[];
    stats: NoteStat[];
    attachments: NoteAttachment[];
    tags: string[];
    followUp?: string;
    private: boolean;
}

export const progressNoteApi = {
    getAllNotes: async () => {
        const response = await apiClient.get('/progress-notes');
        return response.data;
    },

    // Backend requires memberId in path. Deprecating this in favor of createNoteForMember
    createNote: async (note: ProgressNoteDTO) => {
        console.error("Use createNoteForMember instead");
        throw new Error("Use createNoteForMember");
    },

    createNoteForMember: async (memberId: number, note: ProgressNoteDTO) => {
        const response = await apiClient.post(`/members/${memberId}/progress-notes`, note);
        return response.data;
    },

    updateNote: async (id: number, note: ProgressNoteDTO) => {
        const response = await apiClient.put(`/progress-notes/${id}`, note);
        return response.data;
    },

    deleteNote: async (id: number) => {
        const response = await apiClient.delete(`/progress-notes/${id}`);
        return response.data;
    },

    getNotesByMember: async (memberId: number) => {
        const response = await apiClient.get(`/members/${memberId}/progress-notes`);
        return response.data;
    }
};

