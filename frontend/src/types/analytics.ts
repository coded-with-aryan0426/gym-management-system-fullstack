export interface PTRevenueAnalytics {
  totalPTRevenue: number;
  averageRevenuePerMember: number;
  totalPTMembers: number;
  activePTMembers: number;
  renewalRate: number;
  topSpenders: MemberRevenueInsight[];
  productBreakdown: ProductRevenue[];
  monthlyTrends: MonthlyTrend[];
  ageGroupAnalysis: AgeGroupSpending[];
}

export interface MemberRevenueInsight {
  memberId: number;
  memberName: string;
  email: string;
  totalSpent: number;
  sessionsCompleted: number;
  membershipPlan: string;
  supplementProbability: number;
  renewalLikelihood: 'High' | 'Medium' | 'Low';
  memberSince: string;
  lastVisit: string;
}

export interface ProductRevenue {
  productName: string;
  category: string;
  revenue: number;
  unitsSold: number;
  percentageShare: number;
  growthRate: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  ptRevenue: number;
  supplementRevenue: number;
  newMembers: number;
  churned: number;
}

export interface AgeGroupSpending {
  ageGroup: string;
  memberCount: number;
  averageSpend: number;
  totalSpend: number;
  topProduct: string;
}

export interface StaffAttendanceAnalytics {
  staffRecords: StaffAttendanceRecord[];
  averageArrivalTime: number;
  totalLateArrivals: number;
  totalAbsences: number;
  overtimeHours: number;
  monthlyCalendar: AttendanceDay[];
  topLateEmployees: TopLateEmployee[];
}

export interface StaffAttendanceRecord {
  staffId: number;
  staffName: string;
  role: string;
  avatarUrl: string | null;
  dailyRecords: DailyAttendance[];
  punctualityScore: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  avgArrivalMinutes: number;
  overtimeHours: number;
}

export interface DailyAttendance {
  date: string;
  status: 'present' | 'late' | 'absent' | 'leave' | 'weekend';
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  hoursWorked: number;
  isWeekend: boolean;
  isToday: boolean;
}

export interface AttendanceDay {
  date: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  isWeekend: boolean;
  isToday: boolean;
}

export interface TopLateEmployee {
  staffId: number;
  staffName: string;
  lateCount: number;
  totalLateMinutes: number;
  avgLateMinutes: number;
}

export interface ActionableInsight {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  impact: string;
  action: string;
  priority: 'critical' | 'warning' | 'opportunity' | 'info';
  data?: Record<string, unknown>;
}

export interface InsightsPanel {
  criticalInsights: ActionableInsight[];
  warningInsights: ActionableInsight[];
  opportunityInsights: ActionableInsight[];
  performanceSummary: PerformanceSummary;
}

export interface PerformanceSummary {
  retentionRate: number;
  retentionChange: number;
  classUtilization: number;
  utilizationChange: number;
  trainerNPS: number;
  topTrainer: string;
  revenueGrowth: number;
  newMembersThisMonth: number;
  churnedThisMonth: number;
}

export interface TrainerPerformanceInsight {
  trainerId: number;
  trainerName: string;
  sessionsCompleted: number;
  revenueGenerated: number;
  retentionRate: number;
  activeClients: number;
  avgSessionRating: number;
  impactLevel: 'high' | 'medium' | 'growing';
}

export interface HourlyTraffic {
  hour: number;
  label: string;
  memberTraffic: number;
  trainerActivity: number;
  utilizationPercent: number;
}

export interface DailyPattern {
  dayOfWeek: string;
  hourlyData: HourlyTraffic[];
  peakHour: number;
  totalVisits: number;
}

export interface TrafficHeatmapData {
  weeklyPattern: DailyPattern[];
  peakTime: string;
  lowUtilizationTime: string;
  weekendPattern: string;
}

export interface MembershipMovement {
  newJoins: number;
  newJoinsChange: number;
  renewals: number;
  renewalsChange: number;
  reactivations: number;
  reactivationsChange: number;
  churned: number;
  churnedChange: number;
  netGrowth: number;
}

export interface FullAnalyticsDashboard {
  ptRevenue: PTRevenueAnalytics;
  staffAttendance: StaffAttendanceAnalytics;
  insights: InsightsPanel;
  trafficHeatmap: TrafficHeatmapData;
  membershipMovement: MembershipMovement;
  trainerPerformance: TrainerPerformanceInsight[];
}

export type DateRange = '7d' | '30d' | '90d' | 'year';
