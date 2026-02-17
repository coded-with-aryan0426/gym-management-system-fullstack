export interface TrainerSlot {
    time: string
    status: 'available' | 'limited' | 'booked'
    memberName?: string
}

export interface TrainerSchedule {
    name: string
    initials: string
    slots: TrainerSlot[]
    sessionsToday: number
    totalRevenue: number
    availableSlots: number
}

export interface ExpiringMember {
    name: string
    plan: string
    daysLeft: number
}

export interface OverduePayment {
    name: string
    amount: number
    daysPast: number
}

export interface TopTrainer {
    name: string
    role: string
    revenue: number
    sessions: number
}

export interface MembershipPlan {
    name: string
    sold: number
    revenue: number
}

export interface StockItem {
    name: string
    level: number
    icon: 'towel' | 'protein' | 'water'
}

export interface Cancellation {
    name: string
    type: 'cancel' | 'freeze'
    date: string
    reason: string
}

export interface Birthday {
    name: string
    initials: string
}
