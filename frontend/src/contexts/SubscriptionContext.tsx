import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription, SubscriptionFeatures } from '../hooks/useSubscription';

interface SubscriptionContextType {
  isLoading: boolean;
  isActive: boolean;
  isTrialing: boolean;
  isInGracePeriod: boolean;
  isAuthenticated: boolean;
  subscription: any;
  license: any;
  currentPlan: any;
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
  showPaywall: boolean;
  requiredPlan?: string;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

interface SubscriptionProviderProps {
  children: ReactNode;
  requiredPlanForFeatures?: string[];
}

export function SubscriptionProvider({
  children,
  requiredPlanForFeatures = []
}: SubscriptionProviderProps) {
  const subscription = useSubscription();

  const showPaywall = !subscription.isActive && !subscription.isInGracePeriod;

  return (
    <SubscriptionContext.Provider value={{ ...subscription, showPaywall }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  }
  return context;
}

interface FeatureGateProps {
  feature: keyof SubscriptionFeatures;
  children: ReactNode;
  fallback?: ReactNode;
  requiredTier?: number;
}

export function FeatureGate({ feature, children, fallback, requiredTier }: FeatureGateProps) {
  const { canAccessFeature, currentPlan, isActive, isInGracePeriod } = useSubscriptionContext();

  if (requiredTier !== undefined && currentPlan?.tierLevel < requiredTier) {
    if (fallback) return <>{fallback}</>;
    return <SubscriptionPaywallOverlay feature={feature} />;
  }

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  if (!isActive && !isInGracePeriod) {
    return <SubscriptionPaywallOverlay feature={feature} />;
  }

  return null;
}

function SubscriptionPaywallOverlay({ feature }: { feature: string }) {
  return (
    <div className="feature-gate-overlay">
      <div className="blur-preview" style={{ filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' }}>
        <div style={{ minHeight: 100 }} />
      </div>
      <div className="overlay-content" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: 24,
        borderRadius: 12,
        zIndex: 10,
        textAlign: 'center'
      }}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>
          {formatFeatureName(feature)} requires a paid plan
        </span>
        <a href="/subscribe" style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: 6,
          fontWeight: 600,
          textDecoration: 'none',
          fontSize: 14
        }}>
          Upgrade Now
        </a>
      </div>
    </div>
  );
}

function formatFeatureName(feature: string): string {
  return feature
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

interface SubscriptionStatusProps {
  className?: string;
}

export function SubscriptionStatusBadge({ className }: SubscriptionStatusProps) {
  const { subscription, currentPlan, daysUntilExpiry, isInGracePeriod, isTrialing } = useSubscriptionContext();

  if (!subscription) {
    return (
      <span className={className} style={{
        background: '#fee2e2',
        color: '#dc2626',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500
      }}>
        No Subscription
      </span>
    );
  }

  let statusColor = '#10b981';
  let statusText = 'Active';

  if (isTrialing) {
    statusColor = '#6366f1';
    statusText = `Trial - ${daysUntilExpiry} days left`;
  } else if (isInGracePeriod) {
    statusColor = '#f59e0b';
    statusText = 'Grace Period';
  } else if (subscription.status === 'cancelled') {
    statusColor = '#dc2626';
    statusText = 'Cancelled';
  } else if (subscription.status === 'expired') {
    statusColor = '#dc2626';
    statusText = 'Expired';
  }

  return (
    <span className={className} style={{
      background: statusColor,
      color: 'white',
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500
    }}>
      {currentPlan?.displayName || subscription.planName} - {statusText}
    </span>
  );
}

export function SubscriptionRenewalBanner() {
  const { subscription, daysUntilExpiry, isActive, isInGracePeriod, checkout } = useSubscriptionContext();

  if (!subscription || !isActive || daysUntilExpiry === null || daysUntilExpiry > 7) {
    return null;
  }

  const isUrgent = daysUntilExpiry <= 3 || isInGracePeriod;

  return (
    <div style={{
      background: isUrgent ? '#fef3c7' : '#eff6ff',
      color: isUrgent ? '#92400e' : '#1e40af',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        {isInGracePeriod ? (
          <strong>⚠️ Grace Period Active</strong>
        ) : (
          <strong>⚠️ Subscription Expiring Soon</strong>
        )}
        <p style={{ margin: '4px 0 0', fontSize: 14 }}>
          {isInGracePeriod
            ? `Your subscription expired. Renew now to keep access.`
            : `Your subscription expires in ${daysUntilExpiry} days.`}
        </p>
      </div>
      <button
        onClick={() => checkout(subscription.planId, 'yearly')}
        style={{
          background: isUrgent ? '#f59e0b' : '#6366f1',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 6,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Renew Now
      </button>
    </div>
  );
}

export default SubscriptionProvider;
