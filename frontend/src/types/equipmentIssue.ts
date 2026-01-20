import type { Equipment } from './equipment';

export interface EquipmentIssue {
    id: number;
    equipmentId: number;
    equipment?: Equipment;
    reportedByUserId?: number;
    description: string;
    priority: IssuePriority;
    status: IssueStatus;
    createdAt: string;
    updatedAt: string;
}

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
