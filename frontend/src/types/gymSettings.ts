export interface GymSettingsDTO {
  settingId?: number;
  settingKey: string;
  settingValue: string;
  settingType: string;
}

export interface GymHoursDTO {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export interface PTConfigDTO {
  defaultDurationMinutes: number;
  maxSessionsPerDay: number;
  slotIntervalMinutes: number;
}

export interface BlackoutDayDTO {
  blackoutId?: number;
  date: string;
  reason?: string;
}
