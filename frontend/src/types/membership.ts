
export interface MembershipDTO {
    id: number;
    userId: number;
    packageId: number;
    packageName: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
    remainingSessions?: number;
    amountPaid: number;
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
    autoRenewal: boolean;
    features: string[];
}

export interface MembershipHistoryDTO {
    id: number;
    userId: number;
    action: string;
    actionDate: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
}
