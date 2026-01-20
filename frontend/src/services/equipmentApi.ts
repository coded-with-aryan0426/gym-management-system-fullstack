import { apiClient } from './api';
import type { Equipment, EquipmentStats } from '../types/equipment';
import type { EquipmentMaintenance } from '../types/equipmentMaintenance';
import type { EquipmentIssue } from '../types/equipmentIssue';

export const equipmentApi = {
    // Equipment CRUD
    getAll: async () => {
        const response = await apiClient.get<Equipment[]>('/owner/equipment');
        return response.data;
    },

    create: async (equipment: Partial<Equipment>) => {
        const response = await apiClient.post<Equipment>('/owner/equipment', equipment);
        return response.data;
    },

    update: async (id: number, equipment: Partial<Equipment>) => {
        const response = await apiClient.put<Equipment>(`/owner/equipment/${id}`, equipment);
        return response.data;
    },

    delete: async (id: number) => {
        await apiClient.delete(`/owner/equipment/${id}`);
    },

    getStats: async () => {
        const response = await apiClient.get<EquipmentStats>('/owner/equipment/stats');
        return response.data;
    },

    // Maintenance
    getMaintenanceHistory: async (equipmentId: number) => {
        const response = await apiClient.get<EquipmentMaintenance[]>(`/owner/equipment/${equipmentId}/maintenance`);
        return response.data;
    },

    logMaintenance: async (equipmentId: number, maintenance: Partial<EquipmentMaintenance>) => {
        const response = await apiClient.post<EquipmentMaintenance>(`/owner/equipment/${equipmentId}/maintenance`, maintenance);
        return response.data;
    },

    // Trainer (Issue Reporting)
    reportIssue: async (equipmentId: number, issue: Partial<EquipmentIssue>) => {
        const response = await apiClient.post<EquipmentIssue>(`/trainer/equipment/${equipmentId}/report-issue`, issue);
        return response.data;
    }
};
