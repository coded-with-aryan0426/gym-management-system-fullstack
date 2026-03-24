import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { User, CreateUserDto, UpdateUserDto, MemberDTO, TrainerPerformance } from '../types/user';
import type { GymSettings, UpdateSettingsDto } from '../types/settings';
import type { DashboardStats, PageResponse } from '../types/api';


const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generate a storage key scoped to the current port for session isolation.
 */
const getStorageKey = (key: string): string => {
  const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
  return `${key}_port_${port}`;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (port-scoped)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(getStorageKey('token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Always redirect on 401 - no dev mode bypass
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isLoginPage = window.location.pathname === '/login';

      if (!isLoginRequest && !isLoginPage) {
        localStorage.removeItem(getStorageKey('token'));
        localStorage.removeItem(getStorageKey('user'));
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  // User endpoints
  async getUsers(role?: string): Promise<User[]> {
    const params = role ? { role } : {};
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  async getMembers(): Promise<MemberDTO[]> {
    const response = await apiClient.get<MemberDTO[]>('/users/members');
    return response.data;
  },

  async getMemberPlanNames(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/users/members/plan-names');
    return response.data;
  },

  async assignRandomMembershipPackages(): Promise<Record<string, unknown>> {
    const response = await apiClient.post<Record<string, unknown>>('/users/members/assign-random-packages');
    return response.data;
  },

  // Paginated Members
  async getMembersPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    status?: string,
    plan?: string
  ): Promise<PageResponse<MemberDTO>> {
    const params: Record<string, unknown> = { page, size };
    if (search) params.search = search;
    if (status) params.status = status;
    if (plan) params.plan = plan;
    const response = await apiClient.get<PageResponse<MemberDTO>>('/users/members/paginated', { params });
    return response.data;
  },

  // Paginated Trainers
  async getTrainersPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    role?: string
  ): Promise<PageResponse<User>> {
    const params: Record<string, unknown> = { page, size };
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await apiClient.get<PageResponse<User>>('/users/trainers/paginated', { params });
    return response.data;
  },

  async getStaffPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    role?: string
  ): Promise<PageResponse<any>> {
    const params: Record<string, any> = { page, size };
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await apiClient.get<PageResponse<any>>('/users/staff/paginated', { params });
    return response.data;
  },

  async updateStaffDetails(id: number, data: Record<string, any>): Promise<any> {
    const response = await apiClient.put(`/users/staff/${id}`, data);
    return response.data;
  },

  async searchUsers(role: string, query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/search', { params: { role, q: query } });

    return response.data;
  },

  async getAllTrainersPerformance(): Promise<Record<number, TrainerPerformance>> {
    const response = await apiClient.get<Record<number, TrainerPerformance>>('/users/trainers/performance');
    return response.data;
  },

  // Trainer Details (owner-side)
  async getTrainerDetails(trainerId: number): Promise<any> {
    const response = await apiClient.get(`/users/trainers/${trainerId}/details`);
    return response.data;
  },

  async updateTrainerDetails(trainerId: number, data: any): Promise<any> {
    const response = await apiClient.put(`/users/trainers/${trainerId}/details`, data);
    return response.data;
  },

  // Compensation / Salary
  async getTrainerCompensation(trainerId: number): Promise<any[]> {
    const response = await apiClient.get(`/users/${trainerId}/compensation`);
    return response.data;
  },

  async createCompensationRule(trainerId: number, data: any): Promise<any> {
    const response = await apiClient.post(`/users/${trainerId}/compensation`, data);
    return response.data;
  },

  async updateCompensationRule(trainerId: number, ruleId: number, data: any): Promise<any> {
    const response = await apiClient.put(`/users/${trainerId}/compensation/${ruleId}`, data);
    return response.data;
  },

  async deleteCompensationRule(trainerId: number, ruleId: number): Promise<any> {
    const response = await apiClient.delete(`/users/${trainerId}/compensation/${ruleId}`);
    return response.data;
  },

  // Attendance
  async getTrainerAttendance(trainerId: number, days: number = 30): Promise<any> {
    const response = await apiClient.get(`/users/${trainerId}/attendance`, { params: { days } });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Member Detail - Additional data
  async getMemberAttendance(memberId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/members/${memberId}/attendance`);
    return response.data;
  },

  async getMemberPayments(memberId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/members/${memberId}/payments`);
    return response.data;
  },

  async getMemberSessions(memberId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/members/${memberId}/sessions`);
    return response.data;
  },

  async getMemberNotes(memberId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/members/${memberId}/progress-notes`);
    return response.data;
  },

  async createMemberNote(memberId: number, noteData: any): Promise<any> {
    const response = await apiClient.post(`/members/${memberId}/progress-notes`, noteData);
    return response.data;
  },

  async sendMemberMessage(memberId: number, payload: { subject: string; body: string }): Promise<any> {
    const response = await apiClient.post(`/members/${memberId}/send-message`, payload);
    return response.data;
  },

  async createUser(user: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/users', user);
    return response.data;
  },

  async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, user);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Auth endpoints
  async login(credentials: any): Promise<any> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async signupStaff(data: any): Promise<any> {
    const response = await apiClient.post('/auth/signup/staff', data);
    return response.data;
  },

  async signupMember(data: any): Promise<any> {
    const response = await apiClient.post('/auth/signup/member', data);
    return response.data;
  },

  async sendOtp(email: string, purpose: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET'): Promise<any> {
    const response = await apiClient.post('/auth/send-otp', { email, purpose });
    return response.data;
  },

  async verifyOtp(email: string, otp: string, purpose: 'SIGNUP' | 'LOGIN' | 'PASSWORD_RESET'): Promise<any> {
    const response = await apiClient.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  },

  async verifyLogin(email: string, otp: string): Promise<any> {
    const response = await apiClient.post('/auth/login/verify-otp', { email, otp, purpose: 'LOGIN' });
    return response.data;
  },

  async changePasswordFirstLogin(data: any): Promise<any> {
    const response = await apiClient.post('/auth/change-password-first-login', data);
    return response.data;
  },

  async ownerRegister(data: any): Promise<any> {
    const response = await apiClient.post('/auth/owner/register', data);
    return response.data;
  },

  async setActiveGym(data: { userId: number, gymId: number, context: string }): Promise<any> {
    const response = await apiClient.post('/auth/set-active-gym', data);
    return response.data;
  },

  // Stats endpoint
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/stats');
    return response.data;
  },

  // Dashboard endpoints (new)
  async getDashboardMetrics(): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data;
  },

  async getTrainerDashboard(): Promise<any> {
    const response = await apiClient.get('/trainer/dashboard');
    return response.data;
  },

  async getOwnerDashboard(): Promise<any> {
    const response = await apiClient.get('/owner/dashboard');
    return response.data;
  },

  // Enhanced Dashboard Analytics APIs
  async getDailyRevenue(from: string, to: string): Promise<any> {
    const response = await apiClient.get(`/dashboard/analytics/revenue-daily?from=${from}&to=${to}`);
    return response.data;
  },

  async getDailyAttendance(from: string, to: string): Promise<any> {
    const response = await apiClient.get(`/dashboard/analytics/attendance-daily?from=${from}&to=${to}`);
    return response.data;
  },

  async getMembershipBreakdown(): Promise<any> {
    const response = await apiClient.get('/dashboard/analytics/membership-breakdown');
    return response.data;
  },

  async getRevenueBySource(from: string, to: string): Promise<any> {
    const response = await apiClient.get(`/dashboard/analytics/revenue-by-source?from=${from}&to=${to}`);
    return response.data;
  },

  async getOverduePayments(limit: number = 10): Promise<any> {
    const response = await apiClient.get(`/dashboard/analytics/overdue-payments?limit=${limit}`);
    return response.data;
  },

  async getTodaysClasses(): Promise<any> {
    const response = await apiClient.get('/dashboard/analytics/todays-classes');
    return response.data;
  },

  async getOccupancy(): Promise<any> {
    const response = await apiClient.get('/dashboard/analytics/occupancy');
    return response.data;
  },

  async getMonthlyProgress(): Promise<any> {
    const response = await apiClient.get('/dashboard/analytics/monthly-progress');
    return response.data;
  },

  async getDashboardSummary(): Promise<any> {
    const response = await apiClient.get('/dashboard/analytics/summary');
    return response.data;
  },

  // Finance endpoints (real transaction-based data)
  async getFinanceOverview(period: string = 'month'): Promise<any> {
    const response = await apiClient.get('/finance/overview', { params: { period } });
    return response.data;
  },

  async getFinanceDailyTrend(period: string = 'month'): Promise<any[]> {
    const response = await apiClient.get<any[]>('/finance/daily-trend', { params: { period } });
    return response.data;
  },

  async getFinanceCategoryStats(type: string = 'INCOME', period: string = 'month'): Promise<any[]> {
    const response = await apiClient.get<any[]>('/finance/category-stats', { params: { type, period } });
    return response.data;
  },

  async getFinanceBreakdown(period: string = 'month'): Promise<any> {
    const response = await apiClient.get('/finance/breakdown', { params: { period } });
    return response.data;
  },

  async getFloorStatus(): Promise<unknown[]> {
    const response = await apiClient.get('/dashboard/floor-status');
    return response.data;
  },

  async getDashboardAlerts(): Promise<unknown[]> {
    const response = await apiClient.get('/dashboard/alerts');
    return response.data;
  },

  async getDashboardTransactions(): Promise<unknown[]> {
    const response = await apiClient.get('/dashboard/transactions');
    return response.data;
  },

  async checkInMember(userId: number): Promise<unknown> {
    const response = await apiClient.post(`/dashboard/check-in/${userId}`);
    return response.data;
  },

  async checkOutMember(checkInId: number): Promise<unknown> {
    const response = await apiClient.post(`/dashboard/check-out/${checkInId}`);
    return response.data;
  },

  // Settings endpoints
  async getSettings(): Promise<GymSettings> {
    const response = await apiClient.get<GymSettings>('/settings');
    return response.data;
  },

  async updateSettings(settings: UpdateSettingsDto): Promise<GymSettings> {
    const response = await apiClient.put<GymSettings>('/settings', settings);
    return response.data;
  },

  // Trainer-Customer mapping endpoints
  async getTrainerCustomers(trainerId: number): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/users/${trainerId}/customers`);
    return response.data;
  },

  async getCustomerTrainers(customerId: number): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/users/${customerId}/trainers`);
    return response.data;
  },

  // Assign/Remove customer to/from trainer
  async assignCustomerToTrainer(trainerId: number, customerId: number): Promise<User> {
    const response = await apiClient.post<User>(`/users/${trainerId}/customers/${customerId}`);
    return response.data;
  },

  async removeCustomerFromTrainer(trainerId: number, customerId: number): Promise<User> {
    const response = await apiClient.delete<User>(`/users/${trainerId}/customers/${customerId}`);
    return response.data;
  },

  // Transaction endpoints
  async getPackages(activeOnly: boolean = true): Promise<any[]> {
    const response = await apiClient.get<any[]>('/packages', { params: { active: activeOnly } });
    return response.data;
  },

  async renewMembership(userId: number, packageId: number, customDurationMonths?: number, gymId?: number): Promise<any> {
    const response = await apiClient.post('/memberships/renew', { userId, packageId, customDurationMonths, gymId });
    return response.data;
  },

  async renewMembershipWithPlan(userId: number, planId: number, variantId: number, gymId?: number, isUpgrade?: boolean): Promise<any> {
    const response = await apiClient.post('/memberships/renew', { userId, planId, variantId, gymId, isUpgrade });
    return response.data;
  },

  async getActiveTieredPlans(): Promise<any[]> {
    const response = await apiClient.get('/admin/tiered-plans/active');
    return response.data;
  },

  async getAllTieredPlans(): Promise<any[]> {
    const response = await apiClient.get('/admin/tiered-plans');
    return response.data;
  },

  async createTransaction(data: { userId: number; amount: number; type: string; description: string }): Promise<unknown> {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },

  async getTransactions(filters?: { startDate?: string; endDate?: string }): Promise<unknown[]> {
    const response = await apiClient.get('/dashboard/transactions', { params: filters });
    return response.data;
  },

  // PT Session creation (quick method for Staff page)
  async createPTSession(data: { trainerId: number; memberId?: number; date: string; time: string; duration: number; notes?: string }): Promise<unknown> {
    // Combine date and time into LocalDateTime format
    const sessionDate = `${data.date}T${data.time}:00`;

    const response = await apiClient.post('/pt-sessions', {
      trainerId: data.trainerId,
      memberId: data.memberId || 1, // Default to member ID 1 if not provided
      sessionDate: sessionDate,
      durationMinutes: data.duration,
      status: 'SCHEDULED',
      progressNotes: data.notes || '',
    });
    return response.data;
  },

  // Check if email already exists
  async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    try {
      const users = await this.getUsers();
      const exists = users.some(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        (excludeUserId ? u.userId !== excludeUserId : true)
      );
      return exists;
    } catch {
      return false; // Assume email doesn't exist if check fails
    }
  },

  // Feature Flag endpoints (JWT-authenticated, for in-app feature toggles)
  async getAllFeatures(): Promise<import('../types/feature.types').FeatureFlag[]> {
    const response = await apiClient.get<import('../types/feature.types').FeatureFlag[]>('/features/all');
    return response.data;
  },

  async getFeature(key: string): Promise<import('../types/feature.types').FeatureFlag> {
    const response = await apiClient.get<import('../types/feature.types').FeatureFlag>(`/features/${key}`);
    return response.data;
  },

  async updateFeature(
    key: string,
    data: import('../types/feature.types').UpdateFeatureRequest,
  ): Promise<import('../types/feature.types').FeatureFlag> {
    const response = await apiClient.put<import('../types/feature.types').FeatureFlag>(`/features/${key}`, data);
    return response.data;
  },

  // Generic methods to allow direct apiClient usage through the api object
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),
};

export { apiClient };
export default api;

// PT Session endpoints
import type { PTSessionDTO, RecurringSessionRequest, CompleteSessionRequest, AvailableSlotDTO } from '../types/ptSession';
import type { TrainerPerformanceDTO, AttendanceRecordDTO } from '../types/trainerPerformance';
import type { TrainerShiftDTO } from '../types/trainerShift';
import type { GymHoursDTO, PTConfigDTO, BlackoutDayDTO } from '../types/gymSettings';

import type { MembershipPackageDTO } from '../types/membershipPackage';

const ptSessionApi = {
  async getAllSessions(): Promise<PTSessionDTO[]> {
    const response = await apiClient.get<PTSessionDTO[]>('/pt-sessions');
    return response.data;
  },

  async createSession(session: PTSessionDTO): Promise<PTSessionDTO> {
    const response = await apiClient.post<PTSessionDTO>('/pt-sessions', session);
    return response.data;
  },

  async updateSession(id: number, session: PTSessionDTO): Promise<PTSessionDTO> {
    const response = await apiClient.put<PTSessionDTO>(`/pt-sessions/${id}`, session);
    return response.data;
  },

  async cancelSession(id: number): Promise<void> {
    await apiClient.delete(`/pt-sessions/${id}`);
  },

  async getTrainerSessions(trainerId: number, startDate?: string, endDate?: string): Promise<PTSessionDTO[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<PTSessionDTO[]>(`/pt-sessions/trainer/${trainerId}`, { params });
    return response.data;
  },

  async getMemberSessions(memberId: number, startDate?: string, endDate?: string): Promise<PTSessionDTO[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<PTSessionDTO[]>(`/pt-sessions/member/${memberId}`, { params });
    return response.data;
  },

  async getAvailableSlots(trainerId: number, date: string): Promise<AvailableSlotDTO[]> {
    const response = await apiClient.get<AvailableSlotDTO[]>('/pt-sessions/available-slots', {
      params: { trainerId, date }
    });
    return response.data;
  },

  async markSessionComplete(id: number, request: CompleteSessionRequest): Promise<PTSessionDTO> {
    const response = await apiClient.post<PTSessionDTO>(`/pt-sessions/${id}/complete`, request);
    return response.data;
  },

  async createRecurringSessions(request: RecurringSessionRequest): Promise<PTSessionDTO[]> {
    const response = await apiClient.post<PTSessionDTO[]>('/pt-sessions/recurring', request);
    return response.data;
  },

  async getSession(id: number): Promise<PTSessionDTO> {
    const response = await apiClient.get<PTSessionDTO>(`/pt-sessions/${id}`);
    return response.data;
  },
};

// Trainer Performance endpoints
const trainerPerformanceApi = {
  async getPerformance(trainerId: number, month?: string): Promise<TrainerPerformanceDTO> {
    const params = month ? { month } : {};
    const response = await apiClient.get<TrainerPerformanceDTO>(`/trainers/${trainerId}/performance`, { params });
    return response.data;
  },

  async getAttendance(trainerId: number, month?: string): Promise<TrainerPerformanceDTO> {
    const params = month ? { month } : {};
    const response = await apiClient.get<TrainerPerformanceDTO>(`/trainers/${trainerId}/attendance`, { params });
    return response.data;
  },

  async recordAttendance(trainerId: number, record: AttendanceRecordDTO): Promise<TrainerPerformanceDTO> {
    const response = await apiClient.post<TrainerPerformanceDTO>(`/trainers/${trainerId}/attendance`, record);
    return response.data;
  },

  async getShifts(trainerId: number, startDate: string, endDate: string): Promise<TrainerShiftDTO[]> {
    const response = await apiClient.get<TrainerShiftDTO[]>(`/trainers/${trainerId}/shifts`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  async assignShift(shift: TrainerShiftDTO): Promise<TrainerShiftDTO> {
    const response = await apiClient.post<TrainerShiftDTO>('/trainers/shifts', shift);
    return response.data;
  },

  async deleteShift(shiftId: number): Promise<void> {
    await apiClient.delete(`/trainers/shifts/${shiftId}`);
  },
};

// Gym Settings endpoints
const gymSettingsApi = {
  async getGymHours(): Promise<GymHoursDTO[]> {
    const response = await apiClient.get<GymHoursDTO[]>('/settings/gym-hours');
    return response.data;
  },

  async updateGymHours(hours: GymHoursDTO): Promise<GymHoursDTO> {
    const response = await apiClient.put<GymHoursDTO>('/settings/gym-hours', hours);
    return response.data;
  },

  async getPTConfig(): Promise<PTConfigDTO> {
    const response = await apiClient.get<PTConfigDTO>('/settings/pt-config');
    return response.data;
  },

  async updatePTConfig(config: PTConfigDTO): Promise<PTConfigDTO> {
    const response = await apiClient.put<PTConfigDTO>('/settings/pt-config', config);
    return response.data;
  },

  async getBlackoutDays(): Promise<BlackoutDayDTO[]> {
    const response = await apiClient.get<BlackoutDayDTO[]>('/settings/blackout-days');
    return response.data;
  },

  async addBlackoutDay(date: string, reason?: string): Promise<BlackoutDayDTO> {
    const response = await apiClient.post<BlackoutDayDTO>('/settings/blackout-days', null, {
      params: { date, reason }
    });
    return response.data;
  },

  async deleteBlackoutDay(date: string): Promise<void> {
    await apiClient.delete('/settings/blackout-days', {
      params: { date }
    });
  },
};

// Membership Package endpoints
const membershipPackageApi = {
  async getPackages(activeOnly: boolean = false): Promise<MembershipPackageDTO[]> {
    const response = await apiClient.get<MembershipPackageDTO[]>('/packages', {
      params: { activeOnly }
    });
    return response.data;
  },

  async createPackage(pkg: MembershipPackageDTO): Promise<MembershipPackageDTO> {
    const response = await apiClient.post<MembershipPackageDTO>('/packages', pkg);
    return response.data;
  },

  async updatePackage(id: number, pkg: MembershipPackageDTO): Promise<MembershipPackageDTO> {
    const response = await apiClient.put<MembershipPackageDTO>(`/packages/${id}`, pkg);
    return response.data;
  },

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/packages/${id}`);
  },
};

// Analytics API
import type {
  FullAnalyticsDashboard,
  PTRevenueAnalytics,
  StaffAttendanceAnalytics,
  InsightsPanel,
  TrafficHeatmapData,
  MembershipMovement,
  TrainerPerformanceInsight,
  DateRange
} from '../types/analytics';

const analyticsApi = {
  async getFullDashboard(period: DateRange = '30d'): Promise<FullAnalyticsDashboard> {
    const response = await apiClient.get<FullAnalyticsDashboard>('/analytics/dashboard', {
      params: { period }
    });
    return response.data;
  },

  async getPTRevenueAnalytics(period: DateRange = '30d'): Promise<PTRevenueAnalytics> {
    const response = await apiClient.get<PTRevenueAnalytics>('/analytics/pt-revenue', {
      params: { period }
    });
    return response.data;
  },

  async getStaffAttendanceAnalytics(month?: string): Promise<StaffAttendanceAnalytics> {
    const response = await apiClient.get<StaffAttendanceAnalytics>('/analytics/staff-attendance', {
      params: month ? { month } : {}
    });
    return response.data;
  },

  async getInsightsPanel(period: DateRange = '30d'): Promise<InsightsPanel> {
    const response = await apiClient.get<InsightsPanel>('/analytics/insights', {
      params: { period }
    });
    return response.data;
  },

  async getTrafficHeatmap(period: DateRange = '30d'): Promise<TrafficHeatmapData> {
    const response = await apiClient.get<TrafficHeatmapData>('/analytics/traffic-heatmap', {
      params: { period }
    });
    return response.data;
  },

  async getMembershipMovement(period: DateRange = '30d'): Promise<MembershipMovement> {
    const response = await apiClient.get<MembershipMovement>('/analytics/membership-movement', {
      params: { period }
    });
    return response.data;
  },

  async getTrainerPerformance(period: DateRange = '30d'): Promise<TrainerPerformanceInsight[]> {
    const response = await apiClient.get<TrainerPerformanceInsight[]>('/analytics/trainer-performance', {
      params: { period }
    });
    return response.data;
  }
};

// Member Progress API
export interface ProgressMetricDTO {
  id?: number;
  userId?: number;
  recordDate?: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
  notes?: string;
  createdAt?: string;
}

export interface BodyMeasurementDTO {
  id?: number;
  userId?: number;
  recordDate?: string;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  shoulders?: number;
  neck?: number;
  calves?: number;
  notes?: string;
  createdAt?: string;
}

export interface MemberGoalDTO {
  id?: number;
  userId?: number;
  title: string;
  goalType: string;
  startValue?: number;
  currentValue?: number;
  targetValue: number;
  unit?: string;
  startDate?: string;
  targetDate?: string;
  weeklyTarget?: number;
  isActive?: boolean;
  completedAt?: string;
  createdAt?: string;
}

export interface PersonalBestDTO {
  id?: number;
  userId?: number;
  exercise: string;
  weightValue: number;
  reps?: number;
  unit?: string;
  recordDate?: string;
  previousBest?: number;
  category?: string;
  notes?: string;
  createdAt?: string;
}

export interface WorkoutLogDTO {
  id?: number;
  userId?: number;
  workoutDate?: string;
  durationMinutes?: number;
  workoutType?: string;
  caloriesBurned?: number;
  exercisesCount?: number;
  intensityLevel?: number;
  notes?: string;
  createdAt?: string;
}

export interface ProgressSummaryDTO {
  userId: number;
  currentWeight?: number;
  startWeight?: number;
  goalWeight?: number;
  weightChange?: number;
  weightChangePercent?: number;
  currentBodyFat?: number;
  startBodyFat?: number;
  bodyFatChange?: number;
  currentMuscleMass?: number;
  startMuscleMass?: number;
  muscleMassChange?: number;
  currentBmi?: number;
  bmiCategory?: string;
  currentStreak?: number;
  longestStreak?: number;
  totalWorkouts?: number;
  workoutsThisWeek?: number;
  workoutsThisMonth?: number;
  totalCaloriesBurned?: number;
  avgWorkoutDuration?: number;
  consistencyRate?: number;
  totalProgressEntries?: number;
  totalPersonalBests?: number;
  activeGoals?: number;
  completedGoals?: number;
  firstEntryDate?: string;
  lastEntryDate?: string;
  recentMetrics?: ProgressMetricDTO[];
  recentMeasurements?: BodyMeasurementDTO[];
  topPersonalBests?: PersonalBestDTO[];
  activeGoalsList?: MemberGoalDTO[];
  recentWorkouts?: WorkoutLogDTO[];
}

const memberProgressApi = {
  async getSummary(memberId: number): Promise<ProgressSummaryDTO> {
    const response = await apiClient.get<ProgressSummaryDTO>('/member/progress/summary', {
      params: { memberId }
    });
    return response.data;
  },

  async getMetrics(memberId: number, timeRange?: string): Promise<ProgressMetricDTO[]> {
    const response = await apiClient.get<ProgressMetricDTO[]>('/member/progress/metrics', {
      params: { memberId, timeRange }
    });
    return response.data;
  },

  async createMetric(memberId: number, dto: ProgressMetricDTO): Promise<ProgressMetricDTO> {
    const response = await apiClient.post<ProgressMetricDTO>('/member/progress/metrics', dto, {
      params: { memberId }
    });
    return response.data;
  },

  async updateMetric(memberId: number, metricId: number, dto: ProgressMetricDTO): Promise<ProgressMetricDTO> {
    const response = await apiClient.put<ProgressMetricDTO>(`/member/progress/metrics/${metricId}`, dto, {
      params: { memberId }
    });
    return response.data;
  },

  async deleteMetric(memberId: number, metricId: number): Promise<void> {
    await apiClient.delete(`/member/progress/metrics/${metricId}`, {
      params: { memberId }
    });
  },

  async getMeasurements(memberId: number, timeRange?: string): Promise<BodyMeasurementDTO[]> {
    const response = await apiClient.get<BodyMeasurementDTO[]>('/member/progress/measurements', {
      params: { memberId, timeRange }
    });
    return response.data;
  },

  async createMeasurement(memberId: number, dto: BodyMeasurementDTO): Promise<BodyMeasurementDTO> {
    const response = await apiClient.post<BodyMeasurementDTO>('/member/progress/measurements', dto, {
      params: { memberId }
    });
    return response.data;
  },

  async updateMeasurement(memberId: number, measurementId: number, dto: BodyMeasurementDTO): Promise<BodyMeasurementDTO> {
    const response = await apiClient.put<BodyMeasurementDTO>(`/member/progress/measurements/${measurementId}`, dto, {
      params: { memberId }
    });
    return response.data;
  },

  async deleteMeasurement(memberId: number, measurementId: number): Promise<void> {
    await apiClient.delete(`/member/progress/measurements/${measurementId}`, {
      params: { memberId }
    });
  },

  async getGoals(memberId: number): Promise<MemberGoalDTO[]> {
    const response = await apiClient.get<MemberGoalDTO[]>('/member/progress/goals', {
      params: { memberId }
    });
    return response.data;
  },

  async getPersonalBests(memberId: number): Promise<PersonalBestDTO[]> {
    const response = await apiClient.get<PersonalBestDTO[]>('/member/progress/personal-bests', {
      params: { memberId }
    });
    return response.data;
  },

  async createGoal(memberId: number, dto: MemberGoalDTO): Promise<MemberGoalDTO> {
    const response = await apiClient.post<MemberGoalDTO>('/member/progress/goals', dto, {
      params: { memberId }
    });
    return response.data;
  },

  async updateGoal(memberId: number, goalId: number, dto: MemberGoalDTO): Promise<MemberGoalDTO> {
    const response = await apiClient.put<MemberGoalDTO>(`/member/progress/goals/${goalId}`, dto, {
      params: { memberId }
    });
    return response.data;
  },

  async deleteGoal(memberId: number, goalId: number): Promise<void> {
    await apiClient.delete(`/member/progress/goals/${goalId}`, {
      params: { memberId }
    });
  },

  async createOrUpdatePersonalBest(memberId: number, dto: PersonalBestDTO): Promise<PersonalBestDTO> {
    const response = await apiClient.post<PersonalBestDTO>('/member/progress/personal-bests', dto, {
      params: { memberId }
    });
    return response.data;
  },

  async deletePersonalBest(memberId: number, pbId: number): Promise<void> {
    await apiClient.delete(`/member/progress/personal-bests/${pbId}`, {
      params: { memberId }
    });
  },

  async getWorkouts(memberId: number, timeRange?: string): Promise<WorkoutLogDTO[]> {
    const response = await apiClient.get<WorkoutLogDTO[]>('/member/progress/workouts', {
      params: { memberId, timeRange }
    });
    return response.data;
  },

  async createWorkout(memberId: number, dto: WorkoutLogDTO): Promise<WorkoutLogDTO> {
    const response = await apiClient.post<WorkoutLogDTO>('/member/progress/workouts', dto, {
      params: { memberId }
    });
    return response.data;
  },

  async deleteWorkout(memberId: number, logId: number): Promise<void> {
    await apiClient.delete(`/member/progress/workouts/${logId}`, {
      params: { memberId }
    });
  },

  async getPhotos(memberId: number): Promise<any[]> {
    const response = await apiClient.get<any[]>('/member/progress/photos', {
      params: { memberId }
    });
    return response.data;
  },

  async addPhoto(memberId: number, data: { photoUrl: string; description?: string; recordDate?: string }): Promise<any> {
    const response = await apiClient.post<any>('/member/progress/photos', data, {
      params: { memberId }
    });
    return response.data;
  },

  async uploadPhoto(memberId: number, file: File, description?: string, recordDate?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (recordDate) formData.append('recordDate', recordDate);

    const response = await apiClient.post<any>('/member/progress/photos/upload', formData, {
      params: { memberId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePhoto(memberId: number, photoId: number): Promise<void> {
    await apiClient.delete(`/member/progress/photos/${photoId}`, {
      params: { memberId }
    });
  }
};

// Gym Classes API
export interface GymClassDTO {
  classId: number;
  className: string;
  classType: string;
  description?: string;
  trainerId?: number;
  trainerName?: string;
  startTime: string;
  durationMinutes: number;
  maxCapacity: number;
  currentBookings: number;
  spotsLeft: number;
  difficulty?: string;
  location?: string;
  status: string;
  recurring?: boolean;
  recurrencePattern?: string;
  isBooked?: boolean;
  bookingId?: number;
  isWaitlisted?: boolean;
}

export interface ClassBookingDTO {
  bookingId: number;
  classId: number;
  className: string;
  classType: string;
  memberId: number;
  memberName: string;
  status: string;
  bookedAt: string;
  cancelledAt?: string;
  attended?: boolean;
  notes?: string;
  classStartTime: string;
  durationMinutes: number;
  trainerName?: string;
  location?: string;
  difficulty?: string;
}

const gymClassApi = {
  async getAvailableClasses(memberId?: number): Promise<GymClassDTO[]> {
    const params = memberId ? { memberId } : {};
    const response = await apiClient.get<GymClassDTO[]>('/classes', { params });
    return response.data;
  },

  async getTodaysClasses(memberId?: number): Promise<GymClassDTO[]> {
    const params = memberId ? { memberId } : {};
    const response = await apiClient.get<GymClassDTO[]>('/classes/today', { params });
    return response.data;
  },

  async getMemberBookings(memberId: number): Promise<ClassBookingDTO[]> {
    const response = await apiClient.get<ClassBookingDTO[]>(`/classes/member/${memberId}/bookings`);
    return response.data;
  },

  async getMemberBookingsCount(memberId: number): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`/classes/member/${memberId}/bookings/count`);
    return response.data.count;
  },

  async bookClass(classId: number, memberId: number): Promise<ClassBookingDTO> {
    const response = await apiClient.post<ClassBookingDTO>(`/classes/${classId}/book`, null, {
      params: { memberId }
    });
    return response.data;
  },

  async cancelBooking(bookingId: number, memberId: number): Promise<void> {
    await apiClient.delete(`/classes/bookings/${bookingId}`, {
      params: { memberId }
    });
  },

  async createClass(dto: Partial<GymClassDTO>): Promise<GymClassDTO> {
    const response = await apiClient.post<GymClassDTO>('/classes', dto);
    return response.data;
  }
};

// Export all APIs
export { ptSessionApi, trainerPerformanceApi, gymSettingsApi, membershipPackageApi, analyticsApi, memberProgressApi, gymClassApi };
