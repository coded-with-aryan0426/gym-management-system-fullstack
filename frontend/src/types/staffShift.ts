export type ShiftStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED';

export interface StaffShiftDTO {
  shiftId?: number;
  staffId: number;
  staffName?: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status?: ShiftStatus;
}
