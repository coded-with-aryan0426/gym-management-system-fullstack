import { apiClient } from './api';
import type { AxiosResponse } from 'axios';

export interface CurrencyConfig {
  defaultCurrency: string;
  symbol: string;
  supported: string[];
}

export interface PlanPrices {
  monthly: number;
  quarterly: number;
  yearly: number;
}

export interface PlanConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  gymTypes: string[];
  tierLevel: number;
  prices: PlanPrices;
  pricesUSD: PlanPrices;
  trialDays: number;
  gracePeriodDays: number;
  maxDevices: number;
  maxMembers: number;
  maxStaff: number;
  maxTrainers: number;
  maxClasses: number;
  features: Record<string, boolean | number>;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface PlansConfiguration {
  currency: CurrencyConfig;
  plans: PlanConfig[];
  billing: {
    defaultCycle: string;
    allowMonthly: boolean;
    allowQuarterly: boolean;
    allowYearly: boolean;
    taxPercent: number;
    discounts: Record<string, number>;
  };
  trial: {
    enabled: boolean;
    requireCreditCard: boolean;
    maxTrialsPerUser: number;
    autoConvert: boolean;
    conversionGracePeriodDays: number;
  };
  gracePeriod: {
    enabled: boolean;
    defaultDays: number;
    notifyDaysBefore: number[];
    notifyDuringGrace: boolean;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planTier: number;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'paused' | 'pending';
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  gracePeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  gateway?: string;
  isInGracePeriod: boolean;
  daysUntilExpiry: number;
  daysInGracePeriod: number;
  features: Record<string, boolean | number>;
}

export interface License {
  id: string;
  licenseKey: string;
  planName: string;
  planTier: number;
  maxDevices: number;
  activatedDeviceCount: number;
  expiresAt: string;
  isValid: boolean;
  isRevoked: boolean;
  isTransferable: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  gateway: string;
  status: string;
}

export const subscriptionApi = {
  getAllPlans: (): Promise<AxiosResponse<PlanConfig[]>> =>
    apiClient.get<PlanConfig[]>('/subscribe/plans'),

  getPlanById: (id: string): Promise<AxiosResponse<PlanConfig>> =>
    apiClient.get<PlanConfig>(`/subscribe/plans/${id}`),

  getConfig: (): Promise<AxiosResponse<PlansConfiguration>> =>
    apiClient.get<PlansConfiguration>('/subscribe/config'),

  getStatus: (userId: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.get<Subscription>(`/subscribe/status?userId=${userId}`),

  startTrial: (userId: string, planId: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(`/subscribe/trial?userId=${userId}&planId=${planId}`),

  checkout: (userId: string, planId: string, billingCycle: string, gateway: string = 'razorpay'): Promise<AxiosResponse<CheckoutSession>> =>
    apiClient.post<CheckoutSession>('/subscribe/checkout', {
      planId,
      billingCycle,
      gateway,
    }, {
      params: { userId }
    }),

  activate: (userId: string, gateway: string, subscriptionId: string, billingCycle?: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(
      `/subscribe/activate?userId=${userId}&gateway=${gateway}&gatewaySubscriptionId=${subscriptionId}${billingCycle ? `&billingCycle=${billingCycle}` : ''}`
    ),

  upgrade: (userId: string, newPlanId: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(`/subscribe/upgrade?userId=${userId}&newPlanId=${newPlanId}`),

  downgrade: (userId: string, newPlanId: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(`/subscribe/downgrade?userId=${userId}&newPlanId=${newPlanId}`),

  cancel: (userId: string, immediate: boolean = false): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(`/subscribe/cancel?userId=${userId}&immediate=${immediate}`),

  reactivate: (userId: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(`/subscribe/reactivate?userId=${userId}`),

  renew: (userId: string, billingCycle?: string): Promise<AxiosResponse<Subscription>> =>
    apiClient.post<Subscription>(
      `/subscribe/renew?userId=${userId}${billingCycle ? `&billingCycle=${billingCycle}` : ''}`
    ),
};

export const licenseApi = {
  validate: (licenseKey: string, deviceFingerprint: string, deviceName?: string): Promise<AxiosResponse<{ valid: boolean; message: string }>> =>
    apiClient.post<{ valid: boolean; message: string }>('/license/validate', {
      licenseKey,
      deviceFingerprint,
      deviceName,
    }),

  activate: (licenseKey: string, deviceFingerprint: string, deviceName?: string, deviceId?: string): Promise<AxiosResponse<{ valid: boolean; message: string }>> =>
    apiClient.post<{ valid: boolean; message: string }>('/license/activate', {
      licenseKey,
      deviceFingerprint,
      deviceName,
      deviceId,
    }),

  deactivate: (licenseKey: string, deviceFingerprint: string): Promise<AxiosResponse<{ valid: boolean; message: string }>> =>
    apiClient.post<{ valid: boolean; message: string }>(
      `/license/deactivate?licenseKey=${licenseKey}&deviceFingerprint=${deviceFingerprint}`
    ),

  getMyLicense: (userId: string): Promise<AxiosResponse<License>> =>
    apiClient.get<License>(`/license/my?userId=${userId}`),
};

export default subscriptionApi;
