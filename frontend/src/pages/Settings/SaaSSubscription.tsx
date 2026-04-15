import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, Calendar, AlertCircle, Check, X, RefreshCw, ChevronDown, Zap } from 'lucide-react';
import { useSubscription, SubscriptionFeatures } from '../../hooks/useSubscription';
import { subscriptionApi, type PlanConfig, type Subscription } from '../../services/subscriptionApi';
// CSS moved to SASettings - this component is now used only in the creator portal

interface PlanWithPricing extends PlanConfig {
  effectivePrice?: number;
  savings?: number;
}

export default function SaaSSubscriptionPage() {
  const navigate = useNavigate();
  const {
    isLoading,
    subscription,
    currentPlan,
    license,
    isActive,
    isTrialing,
    isInGracePeriod,
    daysUntilExpiry,
    daysInGracePeriod,
    features,
    checkout,
    upgrade,
    cancel,
    reactivate,
    refresh
  } = useSubscription();

  const [plans, setPlans] = useState<PlanWithPricing[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<PlanConfig | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const result = await subscriptionApi.getAllPlans();
      const plansData = result?.data || [];
      const plansWithPricing = plansData.map((plan: PlanConfig) => {
        const basePrice = plan.prices?.monthly || 0;
        let effectivePrice = basePrice;
        let savings = 0;

        if (billingCycle === 'quarterly' && plan.prices?.quarterly) {
          effectivePrice = plan.prices.quarterly / 3;
          savings = ((basePrice - effectivePrice) / basePrice * 100);
        } else if (billingCycle === 'yearly' && plan.prices?.yearly) {
          effectivePrice = plan.prices.yearly / 12;
          savings = ((basePrice - effectivePrice) / basePrice * 100);
        }

        return { ...plan, effectivePrice, savings };
      });
      setPlans(plansWithPricing);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [billingCycle]);

  const handleCheckout = async (planId: string) => {
    await checkout(planId, billingCycle);
  };

  const handleStartTrial = async (planId: string) => {
    try {
      await subscriptionApi.startTrial(localStorage.getItem('userId') || '', planId);
      await refresh();
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setTargetPlan(plans.find(p => p.id === planId) || null);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (targetPlan) {
      await upgrade(targetPlan.id);
      setShowUpgradeModal(false);
      setTargetPlan(null);
    }
  };

  const handleCancel = async (immediate: boolean) => {
    await cancel(immediate);
    setShowCancelModal(false);
  };

  const handleReactivate = async () => {
    await reactivate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const currentTier = currentPlan?.tierLevel || 0;
  const currencySymbol = '₹';

  return (
    <div className="saas-subscription-page">
      <div className="page-header">
        <h1><Crown className="icon" /> SaaS Subscription</h1>
        <p>Manage your gym management software subscription</p>
      </div>

      {isInGracePeriod && (
        <div className="grace-period-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Grace Period Active</strong>
            <p>Your subscription features are temporarily available. Please renew to avoid service interruption.</p>
          </div>
        </div>
      )}

      {subscription && subscription.cancelAtPeriodEnd && (
        <div className="cancellation-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Subscription Cancelled</strong>
            <p>Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
          </div>
          <button onClick={handleReactivate} className="btn-primary">Reactivate</button>
        </div>
      )}

      {isInGracePeriod && (
        <div className="grace-period-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Grace Period Active</strong>
            <p>Your subscription features are temporarily available. Please renew to avoid service interruption.</p>
          </div>
        </div>
      )}

      <div className="current-subscription-card">
        <div className="subscription-header">
          <h2>Current Subscription</h2>
          <span className={`status-badge ${subscription?.status || 'none'}`}>
            {isTrialing ? 'Trial' : isInGracePeriod ? 'Grace Period' : (subscription?.status || 'None')}
          </span>
        </div>

        {subscription && currentPlan ? (
          <div className="subscription-details">
            <div className="detail-row">
              <span className="label">Plan</span>
              <span className="value">{currentPlan.displayName || currentPlan.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status</span>
              <span className="value">{subscription.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Billing Cycle</span>
              <span className="value">{subscription.billingCycle}</span>
            </div>
            <div className="detail-row">
              <span className="label">
                {isTrialing ? 'Trial Ends' : isInGracePeriod ? 'Grace Period Ends' : 'Next Billing Date'}
              </span>
              <span className="value">
                {new Date(isTrialing ? subscription.trialEnd || subscription.currentPeriodEnd : subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
            {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
              <div className="detail-row">
                <span className="label">Days Remaining</span>
                <span className="value highlight">{daysUntilExpiry} days</span>
              </div>
            )}
            {license && (
              <div className="detail-row">
                <span className="label">License Key</span>
                <code className="license-key">{license.licenseKey}</code>
              </div>
            )}
          </div>
        ) : (
          <div className="no-subscription">
            <p>No active subscription. Choose a plan to get started.</p>
          </div>
        )}

        {subscription && !subscription.cancelAtPeriodEnd && (
          <div className="subscription-actions">
            <button
              className="btn-danger-outline"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      <div className="billing-cycle-selector">
        <span>Billing Cycle:</span>
        <div className="cycle-options">
          <button
            className={billingCycle === 'monthly' ? 'active' : ''}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={billingCycle === 'quarterly' ? 'active' : ''}
            onClick={() => setBillingCycle('quarterly')}
          >
            Quarterly <span className="badge">Save 10%</span>
          </button>
          <button
            className={billingCycle === 'yearly' ? 'active' : ''}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly <span className="badge">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id || currentTier === plan.tierLevel;
          const isUpgrade = plan.tierLevel > currentTier;
          const isDowngrade = plan.tierLevel < currentTier && isCurrentPlan === false;

          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.isFeatured ? 'featured' : ''} ${isCurrentPlan ? 'current' : ''}`}
            >
              {plan.isFeatured && <span className="featured-badge">Most Popular</span>}
              {isCurrentPlan && <span className="current-badge">Current Plan</span>}

              <h3>{plan.displayName || plan.name}</h3>
              <p className="plan-description">{plan.description}</p>

              <div className="plan-price">
                <span className="currency">{currencySymbol}</span>
                <span className="amount">
                  {Math.round(plan.effectivePrice || plan.prices?.monthly || 0)}
                </span>
                <span className="period">/month</span>
              </div>

              {plan.savings && plan.savings > 0 && (
                <span className="savings-badge">Save {Math.round(plan.savings)}%</span>
              )}

              <ul className="plan-features">
                <li><Check size={14} /> Up to {plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers} members</li>
                <li><Check size={14} /> {plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff} staff</li>
                <li><Check size={14} /> {plan.maxTrainers === -1 ? 'Unlimited' : plan.maxTrainers} trainers</li>
                {plan.features?.analytics && <li><Check size={14} /> Analytics</li>}
                {plan.features?.paymentCollection && <li><Check size={14} /> Payment Collection</li>}
                {plan.features?.brandedMobileApp && <li><Check size={14} /> Branded Mobile App</li>}
                {plan.features?.apiAccess && <li><Check size={14} /> API Access</li>}
                {plan.features?.whiteLabel && <li><Check size={14} /> White Label</li>}
              </ul>

              {plan.trialDays > 0 && (
                <p className="trial-info">{plan.trialDays}-day free trial</p>
              )}

              {isCurrentPlan ? (
                <button className="btn-secondary" disabled>Current Plan</button>
              ) : isUpgrade ? (
                <button className="btn-primary" onClick={() => handleUpgrade(plan.id)}>
                  <Zap size={14} /> Upgrade
                </button>
              ) : isDowngrade ? (
                <button className="btn-secondary" onClick={() => handleCheckout(plan.id)}>
                  Downgrade
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => handleCheckout(plan.id)}>
                  Select Plan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showUpgradeModal && targetPlan && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Upgrade</h3>
            <p>
              Upgrade to <strong>{targetPlan.displayName || targetPlan.name}</strong> for{' '}
              {currencySymbol}{Math.round(targetPlan.prices?.yearly || 0) / 12}/month?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmUpgrade}>
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Cancel Subscription?</h3>
            <p>
              Your subscription will be cancelled at the end of the current billing period.
              You'll lose access to premium features.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>
                Keep Subscription
              </button>
              <button className="btn-danger" onClick={() => handleCancel(false)}>
                Cancel at Period End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
