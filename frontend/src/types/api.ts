// API-related type definitions
import type { UserSummary } from './user';

export interface DashboardStats {
  owners: { count: number; users: UserSummary[] };
  trainers: { count: number; users: UserSummary[] };
  staff: { count: number; users: UserSummary[] };
  customers: { count: number; users: UserSummary[] };
  // Extended properties for new dashboard
  totalRevenue?: number;
  activeMembers?: number;
  totalMembers?: number;
  pendingSessions?: number;
}

export interface ApiError {
  message: string;
  status: number;
}
