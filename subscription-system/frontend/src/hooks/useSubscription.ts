import { useState, useEffect, useCallback } from 'react';
import { subscriptionManagementApi, plansApi, licenseApi, type PlanConfig, type Subscription, type License } from '../api/subscriptionApi';

export interface SubscriptionFeatures {
  basicAccess: boolean;
  maxMembers: number;
  maxDevices: number;
  maxStaff: number;
  maxTrainers: number;
  maxClasses: number;
  memberManagement: boolean;
  qrCheckin: boolean;
  biometricCheckin: boolean | string;
  brandedMobileApp: boolean;
  trainerProfiles: number;
  ptSessionBooking: boolean;
  paymentCollection: boolean;
  multiGateway: boolean;
  staffPayroll: boolean;
  inventoryManagement: boolean;
  analytics: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  multiLocation: boolean;
  dedicatedSupport: boolean;
  dietManagement: boolean;
  workoutBuilder: boolean;
  exerciseLibrary: boolean | number;
  fitnessAssessment: boolean;
  storageLimitMb: number;
}

export interface UseSubscriptionResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  isActive: boolean;
  isTrialing: boolean;
  isInGracePeriod: boolean;
  subscription: Subscription | null;
  license: License | null;
  currentPlan: PlanConfig | null;
  features: SubscriptionFeatures;
  daysUntilExpiry: number | null;
  daysInGracePeriod: number | null;
  canAccessFeature: (feature: keyof SubscriptionFeatures) => boolean;
  getFeatureLimit: (feature: keyof SubscriptionFeatures) => number;
  error: string | null;
  startTrial: (planId: string) => Promise<void>;
  checkout: (planId: string, billingCycle: string) => Promise<void>;
  upgrade: (planId: string) => Promise<void>;
  downgrade: (planId: string) => Promise<void>;
  cancel: (immediate?: boolean) => Promise<void>;
  reactivate: () => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultFeatures: SubscriptionFeatures = {
  basicAccess: true,
  maxMembers: 10,
  maxDevices: 1,
  maxStaff: 1,
  maxTrainers: 1,
  maxClasses: 5,
  memberManagement: false,
  qrCheckin: false,
  biometricCheckin: false,
  brandedMobileApp: false,
  trainerProfiles: 0,
  ptSessionBooking: false,
  paymentCollection: false,
  multiGateway: false,
  staffPayroll: false,
  inventoryManagement: false,
  analytics: false,
  apiAccess: false,
  whiteLabel: false,
  multiLocation: false,
  dedicatedSupport: false,
  dietManagement: false,
  workoutBuilder: false,
  exerciseLibrary: false,
  fitnessAssessment: false,
  storageLimitMb: 100,
};

export function useSubscription(): UseSubscriptionResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);

    try {
      const [subRes, licenseRes, plansRes] = await Promise.all([
        subscriptionManagementApi.getStatus(userId).catch(() => null),
        licenseApi.getMyLicense(userId).catch(() => null),
        plansApi.getAll().catch(() => []),
      ]);

      if (subRes) {
        setSubscription(subRes);

        if (subRes.planId && plansRes.length > 0) {
          const plan = plansRes.find((p: PlanConfig) => p.id === subRes.planId);
          if (plan) {
            setCurrentPlan(plan);
          }
        }
      } else {
        setSubscription(null);
        setCurrentPlan(null);
      }

      if (licenseRes) {
        setLicense(licenseRes);
      } else {
        setLicense(null);
      }
    } catch (err) {
      setError('Failed to fetch subscription status');
      console.error('Subscription fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isActive = subscription?.status === 'active' ||
                   subscription?.status === 'trialing' ||
                   subscription?.isInGracePeriod;

  const isTrialing = subscription?.status === 'trialing';
  const isInGracePeriod = subscription?.isInGracePeriod;

  const features: SubscriptionFeatures = currentPlan?.features
    ? { ...defaultFeatures, ...currentPlan.features }
    : subscription?.features
      ? { ...defaultFeatures, ...subscription.features }
      : defaultFeatures;

  features.maxMembers = currentPlan?.maxMembers ?? features.maxMembers;
  features.maxDevices = currentPlan?.maxDevices ?? 1;
  features.maxStaff = currentPlan?.maxStaff ?? features.maxStaff;
  features.maxTrainers = currentPlan?.maxTrainers ?? features.maxTrainers;
  features.maxClasses = currentPlan?.maxClasses ?? features.maxClasses;

  const canAccessFeature = useCallback((feature: keyof SubscriptionFeatures): boolean => {
    if (!isActive && !isInGracePeriod) {
      if (feature === 'basicAccess' || feature === 'memberManagement' || feature === 'qrCheckin') {
        return true;
      }
      return false;
    }

    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return false;
  }, [isActive, isInGracePeriod, features]);

  const getFeatureLimit = useCallback((feature: keyof SubscriptionFeatures): number => {
    const value = features[feature];
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? -1 : 0;
    return 0;
  }, [features]);

  const startTrial = useCallback(async (planId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await subscriptionManagementApi.startTrial(userId, planId);
      await fetchSubscription();
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubscription]);

  const checkout = useCallback(async (planId: string, billingCycle: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const result = await subscriptionManagementApi.checkout(userId, planId, billingCycle);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upgrade = useCallback(async (planId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await subscriptionManagementApi.upgrade(userId, planId);
      await fetchSubscription();
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubscription]);

  const downgrade = useCallback(async (planId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await subscriptionManagementApi.downgrade(userId, planId);
      await fetchSubscription();
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubscription]);

  const cancel = useCallback(async (immediate: boolean = false) => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await subscriptionManagementApi.cancel(userId, immediate);
      await fetchSubscription();
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubscription]);

  const reactivate = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await subscriptionManagementApi.reactivate(userId);
      await fetchSubscription();
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubscription]);

  return {
    isLoading,
    isAuthenticated,
    isActive,
    isTrialing,
    isInGracePeriod,
    subscription,
    license,
    currentPlan,
    features,
    daysUntilExpiry: subscription?.daysUntilExpiry ?? null,
    daysInGracePeriod: subscription?.daysInGracePeriod ?? null,
    canAccessFeature,
    getFeatureLimit,
    error,
    startTrial,
    checkout,
    upgrade,
    downgrade,
    cancel,
    reactivate,
    refresh: fetchSubscription,
  };
}

export default useSubscription;
