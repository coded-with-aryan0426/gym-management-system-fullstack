import { useState, useEffect } from 'react';

interface PlanFeatures {
  basicAccess: boolean;
  maxMembers: number;
  maxStaff: number;
  maxTrainers: number;
  maxClasses: number;
  analytics: boolean;
  exportPdf: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  storageLimitMb: number;
}

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tierLevel: number;
  priceMonthly: number;
  priceQuarterly: number;
  priceYearly: number;
  currency: string;
  trialDays: number;
  gracePeriodDays: number;
  maxDevices: number;
  features: PlanFeatures;
  isActive: boolean;
  isFeatured: boolean;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planTier: number;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'paused' | 'pending';
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart: string;
  trialEnd: string;
  gracePeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  gateway: string;
  isInGracePeriod: boolean;
  daysUntilExpiry: number;
  daysInGracePeriod: number;
  features: PlanFeatures;
}

interface License {
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

interface UseLicenseResult {
  isLoading: boolean;
  isActive: boolean;
  isTrialing: boolean;
  isInGracePeriod: boolean;
  plan: Plan | null;
  subscription: Subscription | null;
  license: License | null;
  features: PlanFeatures;
  daysUntilExpiry: number | null;
  canAccessFeature: (feature: keyof PlanFeatures) => boolean;
  error: string | null;
}

export function useLicense(): UseLicenseResult {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenseAndSubscription();
  }, []);

  const fetchLicenseAndSubscription = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      const [subRes, licenseRes, plansRes] = await Promise.all([
        fetch(`/api/subscribe/status?userId=${userId}`).catch(() => null),
        fetch(`/api/license/my?userId=${userId}`).catch(() => null),
        fetch('/api/plans').catch(() => null)
      ]);

      if (subRes?.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }

      if (licenseRes?.ok) {
        const licenseData = await licenseRes.json();
        setLicense(licenseData);
      }

      if (plansRes?.ok) {
        const plans: Plan[] = await plansRes.json();
        if (subscription?.planId) {
          const currentPlan = plans.find(p => p.id === subscription.planId);
          setPlan(currentPlan || null);
        }
      }
    } catch (err) {
      setError('Failed to fetch subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';
  const isInGracePeriod = subscription?.isInGracePeriod || false;

  const defaultFeatures: PlanFeatures = {
    basicAccess: true,
    maxMembers: 10,
    maxStaff: 2,
    maxTrainers: 1,
    maxClasses: 5,
    analytics: false,
    exportPdf: false,
    apiAccess: false,
    prioritySupport: false,
    storageLimitMb: 100,
  };

  const features = subscription?.features || plan?.features || defaultFeatures;

  const canAccessFeature = (feature: keyof PlanFeatures): boolean => {
    if (!isActive && !isInGracePeriod) {
      if (feature === 'basicAccess') return true;
      return false;
    }
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return false;
  };

  return {
    isLoading,
    isActive,
    isTrialing,
    isInGracePeriod,
    plan,
    subscription,
    license,
    features,
    daysUntilExpiry: subscription?.daysUntilExpiry ?? null,
    canAccessFeature,
    error,
  };
}

export type { Plan, Subscription, License, PlanFeatures };
