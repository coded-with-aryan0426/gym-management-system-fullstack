/**
 * Trainer Reports API Service
 * Real-data-driven analytics for trainer reports
 */

import { apiClient } from './api';

// ============ Types ============

export interface ReportOverview {
    totalSessions: number;
    totalSessionsChange: string;
    totalSessionsChangeType: 'positive' | 'negative' | 'neutral';
    previousPeriodSessions: number;
    activeMembers: number;
    activeMembersChange: string;
    activeMembersSubtext: string;
    avgAttendance: number;
    avgAttendanceChange: string;
    avgAttendanceChangeType: 'positive' | 'negative' | 'neutral';
    clientRating: number;
    clientRatingSubtext: string;
    reviewCount: number;
}

export interface WeeklyActivityDay {
    day: string;
    sessions: number;
    target: number;
}

export interface WeeklyActivity {
    days: WeeklyActivityDay[];
    totalSessions: number;
    dailyAverage: number;
    vsLastWeek: string;
    vsLastWeekType: 'positive' | 'negative' | 'neutral';
}

export interface SessionTypeBreakdown {
    type: string;
    count: number;
    percent: number;
    color: string;
}

export interface SessionTypesData {
    types: SessionTypeBreakdown[];
    totalSessions: number;
}

export type MetricConfidence = 'MEASURED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export interface PerformanceMetric {
    label: string;
    icon: string;
    value: number;
    max: number;
    percent: number;
    color: string;
    confidence: MetricConfidence;
    confidenceNote: string;
}

export interface PerformanceMetrics {
    metrics: PerformanceMetric[];
}

export interface Achievement {
    icon: string;
    label: string;
    date: string;
    color: string;
    type: string;
}

export interface SessionReport {
    id: number;
    memberName: string;
    memberAvatar: string;
    type: string;
    date: string;
    time: string;
    duration: string;
    status: 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
    rating: number | null;
    notes: string | null;
}

export interface SessionsResponse {
    items: SessionReport[];
    page: number;
    size: number;
}

export interface MemberProgress {
    id: number;
    name: string;
    avatar: string;
    sessions: number;
    attendance: number;
    goalProgress: number;
    trend: 'up' | 'down' | 'stable';
    lastSession: string;
    goal: string;
}

export interface EarningsCategory {
    category: string;
    amount: number;
    sessions: number;
    color: string;
}

export interface Earnings {
    totalEarnings: number;
    period: string;
    changePercent: string;
    changeType: 'positive' | 'negative' | 'neutral';
    breakdown: EarningsCategory[];
    avgPerSession: number;
    avgDailyEarnings: number;
    paidSessions: number;
    projectedMonthly: number;
}

// ============ API Response Wrapper ============

interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
}

function unwrapResponse<T>(response: any): T {
    if (response?.data?.success === true && response.data.data !== undefined) {
        return response.data.data as T;
    }
    if (response?.data) {
        return response.data as T;
    }
    throw new Error(response?.data?.message || 'API request failed');
}

// ============ API Methods ============

export const trainerReportsApi = {
    /**
     * Get overview KPIs with period comparison
     */
    async getOverview(period: string = 'This Month', startDate?: string, endDate?: string): Promise<ReportOverview> {
        const response = await apiClient.get('/trainer/reports/overview', {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) }
        });
        return unwrapResponse<ReportOverview>(response);
    },

    /**
     * Get weekly session activity breakdown
     */
    async getWeeklyActivity(period: string = 'This Week', startDate?: string, endDate?: string): Promise<WeeklyActivity> {
        const response = await apiClient.get('/trainer/reports/weekly-activity', {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) }
        });
        return unwrapResponse<WeeklyActivity>(response);
    },

    /**
     * Get session type distribution
     */
    async getSessionTypes(period: string = 'This Month', startDate?: string, endDate?: string): Promise<SessionTypesData> {
        const response = await apiClient.get('/trainer/reports/session-types', {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) }
        });
        return unwrapResponse<SessionTypesData>(response);
    },

    /**
     * Get performance metrics with confidence levels
     */
    async getPerformance(period: string = 'This Month', startDate?: string, endDate?: string): Promise<PerformanceMetrics> {
        const response = await apiClient.get('/trainer/reports/performance', {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) }
        });
        return unwrapResponse<PerformanceMetrics>(response);
    },

    /**
     * Get achievements (stored, idempotent)
     */
    async getAchievements(): Promise<Achievement[]> {
        const response = await apiClient.get('/trainer/reports/achievements');
        return unwrapResponse<Achievement[]>(response);
    },

    /**
     * Get paginated sessions table
     */
    async getSessions(params: {
        period?: string;
        status?: 'all' | 'completed' | 'cancelled' | 'no-show';
        page?: number;
        size?: number;
        startDate?: string;
        endDate?: string;
    } = {}): Promise<SessionsResponse> {
        const response = await apiClient.get('/trainer/reports/sessions', {
            params: {
                period: params.period || 'This Month',
                status: params.status || 'all',
                page: params.page || 0,
                size: params.size || 20,
                ...(params.startDate && { startDate: params.startDate }),
                ...(params.endDate && { endDate: params.endDate }),
            }
        });
        return unwrapResponse<SessionsResponse>(response);
    },

    /**
     * Get member progress cards
     */
    async getMembersProgress(): Promise<MemberProgress[]> {
        const response = await apiClient.get('/trainer/reports/members-progress');
        return unwrapResponse<MemberProgress[]>(response);
    },

    /**
     * Get earnings breakdown and projections
     */
    async getEarnings(period: string = 'This Month', startDate?: string, endDate?: string): Promise<Earnings> {
        const response = await apiClient.get('/trainer/reports/earnings', {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) }
        });
        return unwrapResponse<Earnings>(response);
    },

    /**
     * Export report as CSV
     */
    async exportCSV(type: 'sessions' | 'earnings', period: string = 'This Month', startDate?: string, endDate?: string): Promise<Blob> {
        const response = await apiClient.get(`/trainer/reports/export/${type}`, {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) },
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Export report as PDF
     */
    async exportPDF(period: string = 'This Month', startDate?: string, endDate?: string): Promise<Blob> {
        const response = await apiClient.get('/trainer/reports/export/pdf', {
            params: { period, ...(startDate && { startDate }), ...(endDate && { endDate }) },
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Download CSV file
     */
    downloadCSV(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};

export default trainerReportsApi;
