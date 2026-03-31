import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getStorageKey = (key: string) => {
  const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
  return `${key}_port_${port}`;
};

const client = axios.create({ baseURL: BASE_URL });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(getStorageKey('token'));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttendanceTrendPoint {
  date: string;
  day: string;
  checkIns: number;
  uniqueMembers: number;
  checkedOut: number;
  avgDurationMinutes: number;
  peakHour: number;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
}

export interface LiveCheckIn {
  checkInId: number;
  memberId: number;
  memberName: string;
  role: string;
  checkInTime: string;
  minutesSince: number;
}

export interface TodayCheckIn {
  checkInId: number;
  memberId: number;
  memberName: string;
  email: string;
  role: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
  durationMinutes: number | null;
}

export interface AttendanceStats {
  todayCheckIns: number;
  weekCheckIns: number;
  monthCheckIns: number;
  liveNow: number;
  avgSessionMinutes: number;
  peakCapacity: number;
  busiestHour?: number;
  retentionRate?: number;
}

export interface CheckInRecord {
  checkInId: number;
  userId: number;
  gymId?: number;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
  checkInMethod?: 'MANUAL' | 'SELF' | 'QR' | 'CLASS';
  method?: string;
  deviceInfo?: string;
  ipAddress?: string;
  operatorUserId?: number;
  notes?: string;
  durationMinutes?: number;
}

export interface MemberSearchResult {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  membershipStatus?: string;
}

// Internal type for API response mapping
interface User {
  userId?: number;
  id?: number;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  membershipStatus?: string;
}

export interface GymTask {
  taskId: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  dueDate?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  urgent: number;
  overdue: number;
}

export interface AttendanceStreak {
  currentStreak: number;
  longestStreak: number;
  visitsThisMonth: number;
  totalVisits: number;
}

export interface TrainerMemberSummary {
  memberId: number;
  memberName: string;
  email: string;
  avatarUrl?: string;
  lastVisit?: string;
  visitsThisMonth: number;
  currentStreak: number;
  isInside: boolean;
  checkInTime?: string;
}

// ─── Attendance API ───────────────────────────────────────────────────────────

export const attendanceApi = {
  async getStats(role?: string): Promise<AttendanceStats> {
    const r = await client.get<AttendanceStats>('/attendance/stats', { params: { role } });
    return r.data;
  },

  async getLive(role?: string): Promise<{ currentCount: number; members: LiveCheckIn[] }> {
    const r = await client.get('/attendance/live', { params: { role } });
    return r.data;
  },

  async getToday(role?: string): Promise<TodayCheckIn[]> {
    const r = await client.get<TodayCheckIn[]>('/attendance/today', { params: { role } });
    return r.data;
  },

  async getTrends(from: string, to: string, role?: string): Promise<AttendanceTrendPoint[]> {
    const r = await client.get<AttendanceTrendPoint[]>('/attendance/trends', {
      params: { from, to, role },
    });
    return r.data;
  },

  async getHeatmap(weeks = 8, role?: string): Promise<HeatmapCell[]> {
    const r = await client.get<HeatmapCell[]>('/attendance/heatmap', { params: { weeks, role } });
    return r.data;
  },

  async seedAttendance(): Promise<{ recordsSeeded: number; message: string }> {
    const r = await client.post<{ recordsSeeded: number; message: string }>('/attendance/seed');
    return r.data;
  },

  // Manual check-in/check-out operations
  async checkIn(userId: number): Promise<CheckInRecord> {
    const r = await client.post<CheckInRecord>('/attendance/check-in', { userId });
    return r.data;
  },

  async checkOut(checkInId: number): Promise<CheckInRecord> {
    const r = await client.put<CheckInRecord>(`/attendance/check-out/${checkInId}`, {});
    return r.data;
  },

  // Search members for check-in
  async searchMembers(query: string, role?: string): Promise<MemberSearchResult[]> {
    const searchRole = role || 'CUSTOMER';
    const r = await client.get<User[]>('/users/search', {
      params: { q: query, role: searchRole }
    });
    return r.data.map(user => ({
      userId: user.userId ?? user.id ?? 0,
      fullName: user.fullName || user.name || 'Unknown',
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      membershipStatus: user.membershipStatus
    }));
  },
  // Export attendance data
  async exportAttendance(from: string, to: string, role?: string, format: 'csv' | 'json' = 'csv'): Promise<Blob | TodayCheckIn[]> {
    if (format === 'json') {
      const r = await client.get<TodayCheckIn[]>('/attendance/today', { params: { role } });
      return r.data;
    }
    const r = await client.get<TodayCheckIn[]>('/attendance/today', { params: { role } });
    return r.data;
  },

  // ── Member self-service endpoints ──────────────────────────────────────────
  async selfCheckIn(): Promise<CheckInRecord> {
    const r = await client.post<CheckInRecord>('/attendance/me/check-in');
    return r.data;
  },

  async getMyHistory(from?: string, to?: string): Promise<CheckInRecord[]> {
    const r = await client.get<CheckInRecord[]>('/attendance/me/history', {
      params: { from, to },
    });
    return r.data;
  },

  async getMyStreak(): Promise<AttendanceStreak> {
    const r = await client.get<AttendanceStreak>('/attendance/me/streak');
    return r.data;
  },

  // ── Trainer member attendance endpoint ──────────────────────────────────────
  async getTrainerMembersAttendance(from?: string, to?: string): Promise<TrainerMemberSummary[]> {
    const r = await client.get<TrainerMemberSummary[]>('/attendance/trainer/members', {
      params: { from, to },
    });
    return r.data;
  },

  async getMemberAttendance(memberId: number, from?: string, to?: string): Promise<CheckInRecord[]> {
    const r = await client.get<CheckInRecord[]>(`/attendance/trainer/member/${memberId}/history`, {
      params: { from, to },
    });
    return r.data;
  },
};

// ─── Task (Todo) API ──────────────────────────────────────────────────────────

export const taskApi = {
  async getAll(params?: { status?: string; category?: string }): Promise<GymTask[]> {
    const r = await client.get<GymTask[]>('/tasks', { params });
    return r.data;
  },

  async getStats(): Promise<TaskStats> {
    const r = await client.get<TaskStats>('/tasks/stats');
    return r.data;
  },

  async create(task: Partial<GymTask>): Promise<GymTask> {
    const r = await client.post<GymTask>('/tasks', task);
    return r.data;
  },

  async update(id: number, task: Partial<GymTask>): Promise<GymTask> {
    const r = await client.put<GymTask>(`/tasks/${id}`, task);
    return r.data;
  },

  async updateStatus(id: number, status: GymTask['status']): Promise<GymTask> {
    const r = await client.patch<GymTask>(`/tasks/${id}/status`, { status });
    return r.data;
  },

  async delete(id: number): Promise<void> {
    await client.delete(`/tasks/${id}`);
  },

  async seed(): Promise<{ inserted: number; message: string }> {
    const r = await client.post<{ inserted: number; message: string }>('/tasks/seed');
    return r.data;
  },
};
