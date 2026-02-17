import { apiClient } from './api';
import type { Transaction } from '../types/finance';

interface FinancialStats {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    pendingPayments: number;
    pendingCount?: number;
    revenueChange?: number;
    expensesChange?: number;
}

export const financeApi = {
    getOverview: async (period: string = 'month'): Promise<FinancialStats> => {
        const response = await apiClient.get<FinancialStats>(`/finance/overview?period=${period}`);
        return response.data;
    },

    getTransactions: async (params: {
        status?: string;
        category?: string;
        search?: string;
        page?: number;
        size?: number
    }) => {
        const response = await apiClient.get('/finance/transactions', { params });
        return response.data;
    },

    createTransaction: async (transaction: Partial<Transaction>) => {
        const response = await apiClient.post('/finance/transactions', transaction);
        return response.data;
    },

    updateTransaction: async (id: number, transaction: Partial<Transaction>) => {
        const response = await apiClient.put(`/finance/transactions/${id}`, transaction);
        return response.data;
    },

    deleteTransaction: async (id: number) => {
        await apiClient.delete(`/finance/transactions/${id}`);
    },

    getBreakdown: async (period: string = 'month') => {
        const response = await apiClient.get<any>(`/finance/breakdown?period=${period}`);

        const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

        const process = (list: any[]) => {
            if (!list || !Array.isArray(list)) return [];
            const total = list.reduce((sum, item) => sum + (item[1] || 0), 0);
            return list.map((item, i) => ({
                label: item[0] || 'Unknown',
                value: item[1] || 0,
                percentage: total > 0 ? Math.round(((item[1] || 0) / total) * 100) : 0,
                color: COLORS[i % COLORS.length]
            }));
        };

        return {
            revenue: process(response.data.revenue),
            expenses: process(response.data.expenses)
        };
    },

    getChartData: async (period: string = 'month') => {
        const response = await apiClient.get(`/finance/chart?period=${period}`);
        return response.data;
    },

    getPendingTransactions: async (period: string = 'month') => {
        const response = await apiClient.get(`/finance/pending?period=${period}`);
        return response.data;
    },

    getCategoryStats: async (type: string = 'INCOME', period: string = 'month') => {
        const response = await apiClient.get(`/finance/category-stats?type=${type}&period=${period}`);
        return response.data;
    },

    getDailyTrend: async (period: string = 'month') => {
        const response = await apiClient.get(`/finance/daily-trend?period=${period}`);
        return response.data;
    },

    getTopTransactions: async (type: string = 'INCOME', period: string = 'month', limit: number = 5) => {
        const response = await apiClient.get(`/finance/top-transactions?type=${type}&period=${period}&limit=${limit}`);
        return response.data;
    }
};
