import type { Equipment } from './equipment';

export interface EquipmentMaintenance {
    id: number;
    equipmentId: number;
    equipment?: Equipment;
    maintenanceType: MaintenanceType;
    description: string;
    technicianName: string;
    vendor?: string;
    cost: number;
    maintenanceDate: string;
    nextDueDate?: string;
    status: MaintenanceStatus;
    documentUrl?: string;
    createdAt?: string;
}

export type MaintenanceType = 'PREVENTIVE' | 'REPAIR' | 'INSPECTION';
export type MaintenanceStatus = 'SCHEDULED' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
