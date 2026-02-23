export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'CONFIRMED' | 'NO_SHOW';
export type RecurringFrequency = 'WEEKLY' | 'BIWEEKLY';

export interface PTSessionDTO {
  sessionId?: number;
  trainerId: number;
  memberId: number;
  sessionDate: string;
  durationMinutes: number;
  status: SessionStatus;
  progressNotes?: string;
  workoutPlan?: string;
  dietPlan?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  trainerName?: string;
  memberName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecurringSessionRequest {
  trainerId: number;
  memberId: number;
  startDate: string;
  durationMinutes: number;
  frequency: RecurringFrequency;
  occurrences: number;
}

export interface CompleteSessionRequest {
  progressNotes?: string;
  workoutPlan?: string;
  dietPlan?: string;
  memberAttended?: boolean;
}

export interface AvailableSlotDTO {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAvailable: boolean;
  unavailableReason?: string;
}
