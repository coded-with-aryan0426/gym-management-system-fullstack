export interface Equipment {
    id: number;
    name: string;
    category: EquipmentCategory;
    icon: string;
    brand: string;
    model: string;
    serialNumber?: string;
    purchaseDate: string;
    purchaseCost: number;
    warrantyExpiryDate?: string;
    vendorName?: string;
    quantity: number;
    location: string;
    status: EquipmentStatus;
    condition: EquipmentCondition;
    usageLevel?: UsageLevel;
    lastMaintenanceDate?: string;
    nextMaintenanceDueDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type EquipmentCategory = 'STRENGTH' | 'CARDIO' | 'FUNCTIONAL' | 'YOGA' | 'RECOVERY' | 'OTHER';
export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'RETIRED';
export type EquipmentCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type UsageLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EquipmentStats {
    total: number;
    active: number;
    maintenance: number;
    outOfOrder: number;
}
