export interface TrainerPerformanceDTO {
  performanceId?: number;
  trainerId: number;
  trainerName?: string;
  sessionsCompleted: number;
  attendanceRate: number;
  satisfactionScore: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  recordMonth: string;
}

export interface AttendanceRecordDTO {
  trainerId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
}

export interface TrainerSummaryDTO {
  totalTrainers: number;
  activeTrainers: number;
  averageAttendanceRate: number;
  averageSatisfactionScore: number;
  totalSessionsThisMonth: number;
  recordMonth: string;
}

