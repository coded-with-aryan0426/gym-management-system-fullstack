export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';
export type TransactionMethod = 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Other';
export type TransactionCategory = 'Membership' | 'Personal Training' | 'Class Pack' | 'Merchandise' | 'Diet Plan' | 'Registration' | 'Other';
export type ExpenseCategory = 'Salary' | 'Rent' | 'Utilities' | 'Equipment' | 'Marketing' | 'Maintenance' | 'Software' | 'Other';

export interface Transaction {
    id: number;
    transactionId?: number; // legacy support
    dateTime: string; // ISO string from backend
    description: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    status: string; // 'Completed' | 'Pending' | 'Cancelled'
    referenceNumber?: string;
    createdBy?: string;

    // UI helpers (mapped from backend data)
    invoiceId?: string; // Display ID (e.g. INV-{id})
    date?: string; // YYYY-MM-DD
    relatedUserName?: string;
    method?: TransactionMethod;
}

export interface Expense {
    id: number | string;
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    status: 'Paid' | 'Pending';
    paymentMethod?: TransactionMethod;
    recurring?: boolean;
}

export interface KPIStats {
    totalRevenue: number;
    revenueChange: number; // Percent change vs last period
    totalExpenses: number;
    expensesChange: number;
    netProfit: number;
    profitMargin: number;
    pendingPayments: number; // Amount to be collected
    pendingCount: number; // Number of pending invoices
    cashInHand: number; // Amount collected via Cash
}

export interface RevenueSource {
    label: string;
    value: number;
    percentage: number;
    growth: number; // Growth percentage
    color: string;
}

export interface ExpenseBreakdown {
    label: string;
    value: number;
    percentage: number;
    budget: number; // Budgeted amount
    color: string;
}
