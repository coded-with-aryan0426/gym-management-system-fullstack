import { apiClient } from './api';

export interface SuperAdminMetric {
  value: number | string;
  change: number;
}

export interface SuperAdminKpis {
  totalUsers: SuperAdminMetric;
  totalGyms: SuperAdminMetric;
  mrr: SuperAdminMetric;
  systemHealth: SuperAdminMetric;
}

export interface SuperAdminAlert {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: string;
  source: string;
  time: string;
  metric: string;
  affectedService: string;
  action: string;
}

export interface SuperAdminServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  latency: string;
}

export interface SuperAdminTopGym {
  gymId: number;
  name: string;
  city: string;
  members: number;
  revenue: number;
}

export interface SuperAdminTrendPoint {
  t: string;
  avg: number;
  p95: number;
}

export interface SuperAdminActivityItem {
  type: string;
  message: string;
  time: string;
  severity: string;
}

export interface SuperAdminDashboardData {
  kpis: SuperAdminKpis;
  summary: {
    activeCheckIns: number;
    scheduledSessions: number;
    unreadAlerts: number;
    criticalSecurityEvents: number;
  };
  topGyms: SuperAdminTopGym[];
  alerts: SuperAdminAlert[];
  serviceStatus: SuperAdminServiceStatus[];
  responseTrend: SuperAdminTrendPoint[];
  activityStream: SuperAdminActivityItem[];
}

export interface SuperAdminGym {
  id: number;
  name: string;
  owner: string;
  email: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended';
  members: number;
  trainers: number;
  revenue: number;
  city: string;
  state: string;
  created: string;
  lastActive: string;
  healthScore: number;
  growth: number;
}

export interface SuperAdminGymDeepDive extends SuperAdminGym {
  retentionRate: number;
  avgSessionDuration: string;
  classesPerWeek: number;
  equipmentCount: number;
  revenueHistory: Array<{ m: string; v: number }>;
  memberGrowth: Array<{ m: string; v: number }>;
  peakHours: Array<{ h: string; v: number }>;
  recentActivity: Array<{ action: string; detail: string; time: string }>;
  features: string[];
}

export interface SuperAdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin: string;
  loginStreak: number;
  totalLogins: number;
  riskScore: number;
  twoFA: boolean;
  emailVerified: boolean;
  gym?: string;
}

export interface SuperAdminUserTelemetry extends SuperAdminUser {
  device: string;
  browser: string;
  os: string;
  ip: string;
  country: string;
  city: string;
  totalSpent: number;
  loginHistory: Array<{ d: string; v: number }>;
  activityTimeline: Array<{ action: string; detail: string; time: string; type: string }>;
  permissions: string[];
}

export interface SuperAdminFeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  description: string;
  critical: boolean;
  updatedAt: string;
}

export interface SuperAdminDatabaseHealth {
  cpu: number;
  memory: number;
  connections: number;
  activeConnections: number;
  maxConnections: number;
  status: string;
}

export interface SuperAdminTableSize {
  name: string;
  sizeKb: number;
  sizeFormatted: string;
  rows: number;
}

// ── New interfaces for missing endpoints ──────────────────────────────

export interface SuperAdminRevenueTrendPoint {
  month: string;
  m: string;
  revenue: number;
}

export interface SuperAdminRevenueData {
  mrr: number;
  prevMrr: number;
  mrrChange: number;
  arr: number;
  monthlyTrend: SuperAdminRevenueTrendPoint[];
  byCategory: Array<{ category: string; amount: number }>;
  topGyms: Array<{ gymId: number; name: string; revenue: number; members: number }>;
  planDistribution: Record<string, number>;
  generatedAt: string;
}

export interface SuperAdminAnalyticsData {
  health: {
    totalUsers: number;
    totalGyms: number;
    activeMembers: number;
    totalAuditEvents: number;
    securityAlerts: number;
  };
  userGrowth: Array<{ month: string; newUsers: number }>;
  gymSignups: Array<{ month: string; gyms: number }>;
  severityDistribution: Record<string, number>;
  topActions: Array<{ action: string; count: number }>;
  generatedAt: string;
}

export interface SuperAdminAuditLogEntry {
  id: number;
  action: string;
  entity: string;
  entityName: string;
  details: string;
  userName: string;
  userRole: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  timestamp: string;
}


const getStorageKey = (key: string): string => {
  const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
  return `${key}_port_${port}`;
};

const SUPERADMIN_TOKEN_KEY = getStorageKey('sa_token');
const SUPERADMIN_AUTH_KEY = getStorageKey('sa_auth');
const SUPERADMIN_EXPIRES_KEY = getStorageKey('sa_expires_at');

export const superAdminApi = {
  async login(passphrase: string): Promise<{ token: string; expiresInSeconds: number }> {
    const response = await apiClient.post<{ token: string; expiresInSeconds: number }>(
      '/superadmin/auth/login',
      { passphrase }
    );

    const { token, expiresInSeconds } = response.data;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    sessionStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(SUPERADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(SUPERADMIN_EXPIRES_KEY, String(expiresAt));

    return response.data;
  },

  getToken(): string | null {
    const token = sessionStorage.getItem(SUPERADMIN_TOKEN_KEY);
    const expiresAt = Number(sessionStorage.getItem(SUPERADMIN_EXPIRES_KEY) || 0);
    if (!token || !expiresAt || Date.now() > expiresAt) {
      return null;
    }
    return token;
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null && sessionStorage.getItem(SUPERADMIN_AUTH_KEY) === 'true';
  },

  logout(): void {
    sessionStorage.removeItem(SUPERADMIN_TOKEN_KEY);
    sessionStorage.removeItem(SUPERADMIN_AUTH_KEY);
    sessionStorage.removeItem(SUPERADMIN_EXPIRES_KEY);
    sessionStorage.removeItem('sa_auth');
  },

  async getDashboard(): Promise<SuperAdminDashboardData> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminDashboardData>('/superadmin/dashboard', {
      headers: {
        'X-Superadmin-Token': token,
      },
    });
    return response.data;
  },

  async getGyms(): Promise<SuperAdminGym[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminGym[]>('/superadmin/gyms', {
      headers: {
        'X-Superadmin-Token': token,
      },
    });
    return response.data.map((gym) => ({
      ...gym,
      revenue: Number(gym.revenue ?? 0),
    }));
  },

  async getGymDeepDive(gymId: number): Promise<SuperAdminGymDeepDive> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminGymDeepDive>(`/superadmin/gyms/${gymId}/deep-dive`, {
      headers: {
        'X-Superadmin-Token': token,
      },
    });

    return {
      ...response.data,
      revenue: Number(response.data.revenue ?? 0),
      revenueHistory: response.data.revenueHistory.map((item) => ({ ...item, v: Number(item.v ?? 0) })),
      memberGrowth: response.data.memberGrowth.map((item) => ({ ...item, v: Number(item.v ?? 0) })),
      peakHours: response.data.peakHours.map((item) => ({ ...item, v: Number(item.v ?? 0) })),
    };
  },

  async getUsers(search?: string, role?: string): Promise<SuperAdminUser[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (role && role !== 'all') params.role = role;

    const response = await apiClient.get<SuperAdminUser[]>('/superadmin/users', {
      headers: {
        'X-Superadmin-Token': token,
      },
      params,
    });

    return response.data;
  },

  async getUserTelemetry(userId: number): Promise<SuperAdminUserTelemetry> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminUserTelemetry>(`/superadmin/users/${userId}/telemetry`, {
      headers: {
        'X-Superadmin-Token': token,
      },
    });

    return response.data;
  },

  async getFeatureFlags(): Promise<SuperAdminFeatureFlag[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminFeatureFlag[]>('/superadmin/features', {
      headers: {
        'X-Superadmin-Token': token,
      },
    });

    return response.data;
  },

  async updateFeatureFlag(key: string, updates: { enabled?: boolean; rolloutPercentage?: number }): Promise<SuperAdminFeatureFlag> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.put<SuperAdminFeatureFlag>(`/superadmin/features/${key}`, updates, {
      headers: {
        'X-Superadmin-Token': token,
      },
    });

    return response.data;
  },

  async getDatabaseHealth(): Promise<SuperAdminDatabaseHealth> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminDatabaseHealth>('/superadmin/database/health', {
      headers: {
        'X-Superadmin-Token': token,
      },
    });

    return response.data;
  },

  async getTableSizes(): Promise<SuperAdminTableSize[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Super Admin token missing or expired');
    }

    const response = await apiClient.get<SuperAdminTableSize[]>('/superadmin/database/tables', {
      headers: {
        'X-Superadmin-Token': token,
      },
    });

    return response.data;
  },

  // ── NEW ENDPOINTS ──────────────────────────────────────────────────

  async getRevenue(): Promise<SuperAdminRevenueData> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.get<SuperAdminRevenueData>('/superadmin/revenue', {
      headers: { 'X-Superadmin-Token': token },
    });
    return response.data;
  },

  async getAnalytics(): Promise<SuperAdminAnalyticsData> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.get<SuperAdminAnalyticsData>('/superadmin/analytics', {
      headers: { 'X-Superadmin-Token': token },
    });
    return response.data;
  },

  async getAuditLogs(limit = 100): Promise<SuperAdminAuditLogEntry[]> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.get<SuperAdminAuditLogEntry[]>('/superadmin/audit-logs', {
      headers: { 'X-Superadmin-Token': token },
      params: { limit },
    });
    return response.data;
  },

  async suspendGym(gymId: number, reason?: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/superadmin/gyms/${gymId}/suspend`,
      reason ? { reason } : {},
      { headers: { 'X-Superadmin-Token': token } }
    );
    return response.data;
  },

  async activateGym(gymId: number): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/superadmin/gyms/${gymId}/activate`,
      {},
      { headers: { 'X-Superadmin-Token': token } }
    );
    return response.data;
  },

  async banUser(userId: number, reason?: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/superadmin/users/${userId}/ban`,
      reason ? { reason } : {},
      { headers: { 'X-Superadmin-Token': token } }
    );
    return response.data;
  },

  async unbanUser(userId: number): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error('Super Admin token missing or expired');
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/superadmin/users/${userId}/unban`,
      {},
      { headers: { 'X-Superadmin-Token': token } }
    );
    return response.data;
  },
};

