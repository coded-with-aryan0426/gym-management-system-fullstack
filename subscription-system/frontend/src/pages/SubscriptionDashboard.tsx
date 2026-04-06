import React, { useState } from 'react';
import { useLicense, Plan, Subscription } from '../../hooks/useLicense';
import './SubscriptionDashboard.css';

export const SubscriptionDashboard: React.FC = () => {
  const { subscription, license, plan, isActive, isTrialing, isInGracePeriod, daysUntilExpiry, features } = useLicense();
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!subscription) {
    return (
      <div className="subscription-dashboard empty">
        <h2>No Active Subscription</h2>
        <p>You don't have an active subscription yet.</p>
        <a href="/subscribe" className="cta-button">Choose a Plan</a>
      </div>
    );
  }

  const statusColor = isInGracePeriod
    ? '#f59e0b'
    : isTrialing
      ? '#6366f1'
      : isActive
        ? '#10b981'
        : '#ef4444';

  const statusText = isInGracePeriod
    ? `Grace Period - ${subscription.daysInGracePeriod} days left`
    : isTrialing
      ? `Trial - ${daysUntilExpiry} days left`
      : isActive
        ? 'Active'
        : subscription.status;

  return (
    <div className="subscription-dashboard">
      <div className="dashboard-header">
        <h1>Subscription</h1>
        <a href="/subscribe/plans" className="manage-link">Change Plan</a>
      </div>

      <div className="current-plan-card">
        <div className="plan-info">
          <span className="plan-badge" style={{ background: statusColor }}>{statusText}</span>
          <h2>{plan?.displayName || subscription.planName}</h2>
          <p className="billing-info">
            {subscription.billingCycle === 'monthly' && 'Billed monthly'}
            {subscription.billingCycle === 'quarterly' && 'Billed quarterly'}
            {subscription.billingCycle === 'yearly' && 'Billed annually'}
            {subscription.billingCycle === 'trial' && `Trial ends ${new Date(subscription.trialEnd!).toLocaleDateString()}`}
          </p>
        </div>

        <div className="plan-dates">
          <div className="date-item">
            <span className="label">Current Period</span>
            <span className="value">
              {new Date(subscription.currentPeriodStart!).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
            </span>
          </div>
          {subscription.autoRenew && (
            <div className="date-item">
              <span className="label">Next Renewal</span>
              <span className="value">{new Date(subscription.currentPeriodEnd!).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="cancellation-warning">
            <span>⚠️</span> Your subscription will be cancelled on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
            <button onClick={() => setShowCancelModal(false)}>Reactivate</button>
          </div>
        )}
      </div>

      {license && (
        <div className="license-card">
          <h3>License Information</h3>
          <div className="license-key">
            <span className="label">License Key</span>
            <code>{license.licenseKey}</code>
          </div>
          <div className="license-details">
            <div className="detail">
              <span className="label">Devices</span>
              <span className="value">{license.activatedDeviceCount} / {license.maxDevices === -1 ? '∞' : license.maxDevices}</span>
            </div>
            <div className="detail">
              <span className="label">Expires</span>
              <span className="value">{new Date(license.expiresAt!).toLocaleDateString()}</span>
            </div>
            <div className="detail">
              <span className="label">Status</span>
              <span className={`value status ${license.isValid ? 'valid' : 'invalid'}`}>
                {license.isRevoked ? 'Revoked' : license.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="features-section">
        <h3>Your Features</h3>
        <div className="features-grid">
          <FeatureItem label="Basic Access" enabled={features.basicAccess} />
          <FeatureItem label="Members" value={`${features.maxMembers === -1 ? 'Unlimited' : features.maxMembers}`} enabled />
          <FeatureItem label="Staff" value={`${features.maxStaff === -1 ? 'Unlimited' : features.maxStaff}`} enabled />
          <FeatureItem label="Trainers" value={`${features.maxTrainers === -1 ? 'Unlimited' : features.maxTrainers}`} enabled />
          <FeatureItem label="Classes" value={`${features.maxClasses === -1 ? 'Unlimited' : features.maxClasses}`} enabled />
          <FeatureItem label="Analytics" enabled={features.analytics} />
          <FeatureItem label="PDF Export" enabled={features.exportPdf} />
          <FeatureItem label="API Access" enabled={features.apiAccess} />
          <FeatureItem label="Priority Support" enabled={features.prioritySupport} />
        </div>
      </div>

      <div className="actions-section">
        <button className="action-btn secondary">Update Payment Method</button>
        <button className="action-btn secondary">Download Invoices</button>
        {!subscription.cancelAtPeriodEnd && (
          <button className="action-btn danger" onClick={() => setShowCancelModal(true)}>
            Cancel Subscription
          </button>
        )}
      </div>

      {showCancelModal && (
        <CancelModal onClose={() => setShowCancelModal(false)} />
      )}
    </div>
  );
};

interface FeatureItemProps {
  label: string;
  enabled?: boolean;
  value?: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ label, enabled = true, value }) => (
  <div className={`feature-item ${enabled ? 'enabled' : 'disabled'}`}>
    <span className="feature-icon">{enabled ? '✓' : '✗'}</span>
    <span className="feature-label">{label}</span>
    {value && <span className="feature-value">{value}</span>}
  </div>
);

interface CancelModalProps {
  onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3>Cancel Subscription?</h3>
      <p>
        Are you sure you want to cancel? You'll lose access to premium features
        at the end of your current billing period.
      </p>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Keep Subscription</button>
        <button className="btn-danger">Cancel Now</button>
      </div>
    </div>
  </div>
);

export default SubscriptionDashboard;
