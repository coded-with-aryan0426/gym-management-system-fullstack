// Settings-related type definitions
export interface GymSettings {
  gymName: string;
  email: string; // Unified to email
  phone: string;
  address: string;
  website: string;
  description: string;
  logo: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  features: string[];
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
  };
  billing: {
    cardLastFour: string;
    currentPlan: string;
  };
  advanced: {
    currency: string;
    dateFormat: string;
    timezone: string;
    autoLogout: boolean;
    dataRetention: number;
    marketingEmails: boolean;
    weeklyReports: boolean;
    pushNotifications: boolean;
    membershipReminders: boolean;
    sessionReminders: boolean;
    paymentAlerts: boolean;
  };
}

export interface UpdateSettingsDto {
  gymName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  logo?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  features?: string[];
  notifications?: {
    emailAlerts?: boolean;
    smsAlerts?: boolean;
  };
  advanced?: Partial<GymSettings['advanced']>;
}
