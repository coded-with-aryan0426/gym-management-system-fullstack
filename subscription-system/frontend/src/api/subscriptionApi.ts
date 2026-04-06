const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

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

class SubscriptionApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const userId = localStorage.getItem('userId');
    if (userId) {
      (headers as Record<string, string>)['X-User-Id'] = userId;
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    if (response.status === 204) {
      return {} as T;
    }
    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete(endpoint: string): Promise<void> {
    return this.request<void>(endpoint, { method: 'DELETE' });
  }
}

export const subscriptionApi = new SubscriptionApiClient();

export const plansApi = {
  getAll: () => subscriptionApi.get<PlanConfig[]>('/subscribe/plans'),
  getById: (id: string) => subscriptionApi.get<PlanConfig>(`/subscribe/plans/${id}`),
  getConfig: () => subscriptionApi.get<PlansConfiguration>('/subscribe/config'),
  getGymTypes: () => subscriptionApi.get<string[]>('/plans/gym-types'),
};

export const subscriptionManagementApi = {
  getStatus: (userId: string) => subscriptionApi.get<Subscription>(`/subscribe/status?userId=${userId}`),

  startTrial: (userId: string, planId: string) =>
    subscriptionApi.post<Subscription>(`/subscribe/trial?userId=${userId}&planId=${planId}`),

  checkout: (userId: string, planId: string, billingCycle: string, gateway: string = 'razorpay') =>
    subscriptionApi.post<{ sessionId: string; checkoutUrl: string }>('/subscribe/checkout', {
      planId,
      billingCycle,
      gateway,
    }),

  activate: (userId: string, gateway: string, subscriptionId: string, billingCycle?: string) =>
    subscriptionApi.post<Subscription>(
      `/subscribe/activate?userId=${userId}&gateway=${gateway}&gatewaySubscriptionId=${subscriptionId}${billingCycle ? `&billingCycle=${billingCycle}` : ''}`
    ),

  upgrade: (userId: string, newPlanId: string) =>
    subscriptionApi.post<Subscription>(`/subscribe/upgrade?userId=${userId}&newPlanId=${newPlanId}`),

  downgrade: (userId: string, newPlanId: string) =>
    subscriptionApi.post<Subscription>(`/subscribe/downgrade?userId=${userId}&newPlanId=${newPlanId}`),

  cancel: (userId: string, immediate: boolean = false) =>
    subscriptionApi.post<Subscription>(`/subscribe/cancel?userId=${userId}&immediate=${immediate}`),

  reactivate: (userId: string) =>
    subscriptionApi.post<Subscription>(`/subscribe/reactivate?userId=${userId}`),

  renew: (userId: string, billingCycle?: string) =>
    subscriptionApi.post<Subscription>(
      `/subscribe/renew?userId=${userId}${billingCycle ? `&billingCycle=${billingCycle}` : ''}`
    ),
};

export const licenseApi = {
  validate: (licenseKey: string, deviceFingerprint: string, deviceName?: string) =>
    subscriptionApi.post<{ valid: boolean; message: string }>('/license/validate', {
      licenseKey,
      deviceFingerprint,
      deviceName,
    }),

  activate: (licenseKey: string, deviceFingerprint: string, deviceName?: string, deviceId?: string) =>
    subscriptionApi.post<{ valid: boolean; message: string }>('/license/activate', {
      licenseKey,
      deviceFingerprint,
      deviceName,
      deviceId,
    }),

  deactivate: (licenseKey: string, deviceFingerprint: string) =>
    subscriptionApi.post<{ valid: boolean; message: string }>(
      `/license/deactivate?licenseKey=${licenseKey}&deviceFingerprint=${deviceFingerprint}`
    ),

  getMyLicense: (userId: string) => subscriptionApi.get<License>(`/license/my?userId=${userId}`),
};

export const adminPlansApi = {
  getConfiguration: () => subscriptionApi.get<PlansConfiguration>('/admin/plans'),

  getPlan: (planId: string) =>
    subscriptionApi.get<PlanConfig>(`/admin/plans/${planId}`),

  updatePlan: (planId: string, updates: Partial<PlanConfig>) =>
    subscriptionApi.put<PlanConfig>(`/admin/plans/${planId}`, updates),

  createPlan: (plan: Omit<PlanConfig, 'id'> & { id: string }) =>
    subscriptionApi.post<PlanConfig>('/admin/plans', plan),

  deletePlan: (planId: string) =>
    subscriptionApi.delete(`/admin/plans/${planId}`),

  updatePrice: (planId: string, cycle: string, price: number) =>
    subscriptionApi.patch<PlanConfig>(`/admin/plans/${planId}/price/${cycle}?price=${price}`),

  getPricingSummary: () =>
    subscriptionApi.get<Record<string, any>>('/admin/plans/pricing-summary'),

  reloadPlans: () =>
    subscriptionApi.post<{ message: string }>('/admin/plans/reload'),
};

export default subscriptionApi;
