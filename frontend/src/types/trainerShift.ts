export type ShiftStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED';

export interface TrainerShiftDTO {
  shiftId?: number;
  trainerId: number;
  trainerName?: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status?: ShiftStatus;
}

