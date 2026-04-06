import React, { ReactNode } from 'react';
import { Lock, Star, Zap, Crown } from 'lucide-react';
import { useSubscriptionContext, FeatureGate } from '../../contexts/SubscriptionContext';
import { SubscriptionFeatures } from '../../hooks/useSubscription';

interface FeatureGateWrapperProps {
  feature: keyof SubscriptionFeatures;
  children: ReactNode;
  fallback?: ReactNode;
  showPaywall?: boolean;
  requiredTier?: number;
  icon?: 'star' | 'zap' | 'crown' | 'lock';
  label?: string;
}

export function FeatureGateWrapper({
  feature,
  children,
  fallback,
  showPaywall = true,
  requiredTier,
  icon = 'star',
  label
}: FeatureGateWrapperProps) {
  const { canAccessFeature, currentPlan } = useSubscriptionContext();

  if (requiredTier !== undefined && (currentPlan?.tierLevel || 0) < requiredTier) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="feature-locked-card">
        <div className="locked-icon">
          {icon === 'crown' && <Crown size={24} />}
          {icon === 'zap' && <Zap size={24} />}
          {icon === 'star' && <Star size={24} />}
          {icon === 'lock' && <Lock size={24} />}
        </div>
        <h4>{label || feature.replace(/([A-Z])/g, ' $1').trim()}</h4>
        <p>This feature requires a higher tier plan</p>
        <a href="/settings/subscription" className="upgrade-link">
          Upgrade to Unlock
        </a>
      </div>
    );
  }

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  if (showPaywall) {
    return (
      <div className="feature-gate-overlay">
        <div className="blur-preview" style={{ filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' }}>
          <div style={{ minHeight: 100 }} />
        </div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(0, 0, 0, 0.7)',
          padding: 20,
          borderRadius: 12,
          zIndex: 10,
        }}>
          <Lock size={24} color="white" />
          <span style={{ color: 'white', fontSize: 14 }}>
            {feature.replace(/([A-Z])/g, ' $1').trim()} requires a paid plan
          </span>
          <a href="/settings/subscription" style={{
            background: '#6366f1',
            color: 'white',
            padding: '6px 16px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Upgrade
          </a>
        </div>
      </div>
    );
  }

  return null;
}

interface GatedSectionProps {
  children: ReactNode;
  title: string;
  description?: string;
  requiredTier?: number;
}

export function GatedSection({ children, title, description, requiredTier }: GatedSectionProps) {
  const { currentPlan, isActive } = useSubscriptionContext();

  if (requiredTier !== undefined && (currentPlan?.tierLevel || 0) < requiredTier) {
    return (
      <div className="gated-section-locked">
        <div className="gated-section-header">
          <h3>{title}</h3>
          <span className="tier-badge">{getTierName(requiredTier)}</span>
        </div>
        <p>{description || `This feature requires ${getTierName(requiredTier)} plan`}</p>
        <a href="/settings/subscription" className="upgrade-btn">
          Upgrade Now
        </a>
      </div>
    );
  }

  return (
    <div className="gated-section">
      <div className="gated-section-header">
        <h3>{title}</h3>
        {currentPlan && (
          <span className="current-tier">{currentPlan.displayName}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function getTierName(tier: number): string {
  const tiers: Record<number, string> = {
    0: 'Free',
    1: 'Starter',
    2: 'Professional',
    3: 'Business',
    4: 'Enterprise'
  };
  return tiers[tier] || `Tier ${tier}`;
}

interface PlanLimitDisplayProps {
  feature: keyof SubscriptionFeatures;
  label: string;
  icon?: ReactNode;
}

export function PlanLimitDisplay({ feature, label, icon }: PlanLimitDisplayProps) {
  const { features, getFeatureLimit, isActive, currentPlan } = useSubscriptionContext();

  if (!isActive) {
    return (
      <div className="limit-display locked">
        <span className="limit-icon">{icon}</span>
        <span className="limit-label">{label}</span>
        <span className="limit-value locked">Requires Subscription</span>
      </div>
    );
  }

  const limit = getFeatureLimit(feature);
  const displayValue = limit === -1 ? 'Unlimited' : limit;

  return (
    <div className="limit-display">
      <span className="limit-icon">{icon}</span>
      <span className="limit-label">{label}</span>
      <span className="limit-value">{displayValue}</span>
    </div>
  );
}

interface UpgradePromptProps {
  currentTier: number;
  targetTier: number;
  children?: ReactNode;
}

export function UpgradePrompt({ currentTier, targetTier, children }: UpgradePromptProps) {
  return (
    <div className="upgrade-prompt">
      {children || (
        <>
          <Star size={20} className="icon" />
          <div>
            <strong>Unlock {getTierName(targetTier)} Features</strong>
            <p>Upgrade from {getTierName(currentTier)} to {getTierName(targetTier)}</p>
          </div>
        </>
      )}
      <a href="/settings/subscription" className="upgrade-btn">
        Upgrade
      </a>
    </div>
  );
}

export default FeatureGateWrapper;
