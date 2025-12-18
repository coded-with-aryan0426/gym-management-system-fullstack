import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { User, CreateUserDto, UpdateUserDto, MemberDTO } from '../types/user';
import type { GymSettings, UpdateSettingsDto } from '../types/settings';
import type { DashboardStats, PageResponse } from '../types/api';


const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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

  // Paginated Staff
  async getStaffPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    role?: string
  ): Promise<PageResponse<User>> {
    const params: Record<string, unknown> = { page, size };
    if (search) params.search = search;
    if (role) params.role = role;
    const response = await apiClient.get<PageResponse<User>>('/users/staff/paginated', { params });
    return response.data;
  },

  async searchUsers(role: string, query: string): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/search', { params: { role, q: query } });

    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
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

  async renewMembership(userId: number, packageId: number, customDurationMonths?: number): Promise<any> {
    const response = await apiClient.post('/memberships/renew', { userId, packageId, customDurationMonths });
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
};

export default api;

// PT Session endpoints
import type { PTSessionDTO, RecurringSessionRequest, CompleteSessionRequest, AvailableSlotDTO } from '../types/ptSession';
import type { StaffPerformanceDTO, AttendanceRecordDTO } from '../types/staffPerformance';
import type { StaffShiftDTO } from '../types/staffShift';
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

// Staff Performance endpoints
const staffPerformanceApi = {
  async getPerformance(staffId: number, month?: string): Promise<StaffPerformanceDTO> {
    const params = month ? { month } : {};
    const response = await apiClient.get<StaffPerformanceDTO>(`/staff/${staffId}/performance`, { params });
    return response.data;
  },

  async getAttendance(staffId: number, month?: string): Promise<StaffPerformanceDTO> {
    const params = month ? { month } : {};
    const response = await apiClient.get<StaffPerformanceDTO>(`/staff/${staffId}/attendance`, { params });
    return response.data;
  },

  async recordAttendance(staffId: number, record: AttendanceRecordDTO): Promise<StaffPerformanceDTO> {
    const response = await apiClient.post<StaffPerformanceDTO>(`/staff/${staffId}/attendance`, record);
    return response.data;
  },

  async getShifts(staffId: number, startDate: string, endDate: string): Promise<StaffShiftDTO[]> {
    const response = await apiClient.get<StaffShiftDTO[]>(`/staff/${staffId}/shifts`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  async assignShift(shift: StaffShiftDTO): Promise<StaffShiftDTO> {
    const response = await apiClient.post<StaffShiftDTO>('/staff/shifts', shift);
    return response.data;
  },

  async deleteShift(shiftId: number): Promise<void> {
    await apiClient.delete(`/staff/shifts/${shiftId}`);
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

// Export all APIs
export { ptSessionApi, staffPerformanceApi, gymSettingsApi, membershipPackageApi };
