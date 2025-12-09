export interface StaffPerformanceDTO {
  performanceId?: number;
  staffId: number;
  staffName?: string;
  sessionsCompleted: number;
  attendanceRate: number;
  satisfactionScore: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  recordMonth: string;
}

export interface AttendanceRecordDTO {
  staffId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
}

export interface StaffSummaryDTO {
  totalStaff: number;
  activeTrainers: number;
  averageAttendanceRate: number;
  averageSatisfactionScore: number;
  totalSessionsThisMonth: number;
  recordMonth: string;
}
