import React, { useState } from 'react';
import { useLicense, PlanFeatures } from '../../hooks/useLicense';
import './FeatureGate.css';

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPaywall?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showPaywall = true,
}) => {
  const { isActive, isInGracePeriod, canAccessFeature, isLoading } = useLicense();
  const [showModal, setShowModal] = useState(false);

  const hasAccess = canAccessFeature(feature);

  if (isLoading) {
    return (
      <div className="feature-gate-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showPaywall) {
    return (
      <div className="feature-gate-locked">
        <span className="lock-icon">🔒</span>
        <span className="lock-text">Upgrade to access</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="feature-gate-overlay"
        onClick={() => setShowModal(true)}
      >
        <div className="blur-preview">{children}</div>
        <div className="overlay-content">
          <span className="lock-icon">🔒</span>
          <span className="feature-name">{formatFeatureName(feature)}</span>
          <button className="upgrade-btn">Upgrade Now</button>
        </div>
      </div>

      {showModal && (
        <PaywallModal
          feature={feature}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

function formatFeatureName(feature: string): string {
  return feature
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

interface PaywallModalProps {
  feature: keyof PlanFeatures;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ feature, onClose }) => {
  return (
    <div className="paywall-modal-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="paywall-header">
          <h2>Unlock {formatFeatureName(feature)}</h2>
          <p>Upgrade your plan to access this feature and much more!</p>
        </div>

        <div className="paywall-plans">
          <PlanCard name="Professional" price={79.99} highlighted />
          <PlanCard name="Enterprise" price={199.99} />
        </div>

        <div className="paywall-footer">
          <button className="secondary-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

interface PlanCardProps {
  name: string;
  price: number;
  highlighted?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, price, highlighted }) => {
  return (
    <div className={`plan-card ${highlighted ? 'highlighted' : ''}`}>
      {highlighted && <span className="badge">Most Popular</span>}
      <h3>{name}</h3>
      <div className="price">
        <span className="currency">$</span>
        <span className="amount">{price}</span>
        <span className="period">/month</span>
      </div>
      <ul className="features">
        <li>✓ All Basic features</li>
        <li>✓ Advanced Analytics</li>
        <li>✓ API Access</li>
        <li>✓ Priority Support</li>
      </ul>
      <button className="select-btn">
        Select {name}
      </button>
    </div>
  );
};

export default FeatureGate;
