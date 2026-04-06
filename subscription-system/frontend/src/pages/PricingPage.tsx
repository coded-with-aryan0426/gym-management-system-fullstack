import React, { useState, useEffect } from 'react';
import { useLicense, Plan } from '../../hooks/useLicense';
import './PricingPage.css';

interface PricingPageProps {
  onSelectPlan?: (plan: Plan, billingCycle: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan }) => {
  const { subscription, isActive } = useLicense();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrice = (plan: Plan): number => {
    switch (billingCycle) {
      case 'quarterly': return plan.priceQuarterly || plan.priceMonthly * 3 * 0.9;
      case 'yearly': return plan.priceYearly || plan.priceMonthly * 12 * 0.8;
      default: return plan.priceMonthly;
    }
  };

  const getSavings = (plan: Plan): string => {
    if (billingCycle === 'monthly') return '';
    const monthlyTotal = plan.priceMonthly * (billingCycle === 'quarterly' ? 3 : 12);
    const cyclePrice = getPrice(plan);
    const savings = ((monthlyTotal - cyclePrice) / monthlyTotal * 100).toFixed(0);
    return `Save ${savings}%`;
  };

  if (isLoading) {
    return <div className="pricing-loading">Loading plans...</div>;
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your fitness business</p>

        <div className="billing-toggle">
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
            Quarterly
          </button>
          <button
            className={billingCycle === 'yearly' ? 'active' : ''}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="pricing-plans">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.isFeatured ? 'featured' : ''} ${isActive && subscription?.planId === plan.id ? 'current' : ''}`}
          >
            {plan.isFeatured && <span className="featured-badge">Most Popular</span>}

            <div className="plan-header">
              <h2>{plan.displayName}</h2>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-price">
              <span className="currency">$</span>
              <span className="amount">{getPrice(plan).toFixed(2)}</span>
              <span className="period">/{billingCycle === 'monthly' ? 'mo' : billingCycle === 'quarterly' ? 'qtr' : 'yr'}</span>
            </div>

            {getSavings(plan) && (
              <span className="savings-badge">{getSavings(plan)}</span>
            )}

            <ul className="plan-features">
              <li className={plan.features.basicAccess ? 'included' : 'not-included'}>
                {plan.features.basicAccess ? '✓' : '✗'} Basic Access
              </li>
              <li className={plan.features.maxMembers > 0 ? 'included' : 'not-included'}>
                {plan.features.maxMembers === -1 ? '∞' : plan.features.maxMembers} Members
              </li>
              <li className={plan.features.maxStaff > 0 ? 'included' : 'not-included'}>
                {plan.features.maxStaff === -1 ? '∞' : plan.features.maxStaff} Staff
              </li>
              <li className={plan.features.maxTrainers > 0 ? 'included' : 'not-included'}>
                {plan.features.maxTrainers === -1 ? '∞' : plan.features.maxTrainers} Trainers
              </li>
              <li className={plan.features.maxClasses > 0 ? 'included' : 'not-included'}>
                {plan.features.maxClasses === -1 ? '∞' : plan.features.maxClasses} Classes
              </li>
              <li className={plan.features.analytics ? 'included' : 'not-included'}>
                {plan.features.analytics ? '✓' : '✗'} Analytics
              </li>
              <li className={plan.features.exportPdf ? 'included' : 'not-included'}>
                {plan.features.exportPdf ? '✓' : '✗'} PDF Export
              </li>
              <li className={plan.features.apiAccess ? 'included' : 'not-included'}>
                {plan.features.apiAccess ? '✓' : '✗'} API Access
              </li>
              <li className={plan.features.prioritySupport ? 'included' : 'not-included'}>
                {plan.features.prioritySupport ? '✓' : '✗'} Priority Support
              </li>
            </ul>

            {plan.trialDays > 0 && (
              <div className="trial-info">
                {plan.trialDays}-day free trial
              </div>
            )}

            <button
              className={`select-plan-btn ${plan.isFeatured ? 'featured' : ''}`}
              onClick={() => onSelectPlan?.(plan, billingCycle)}
              disabled={isActive && subscription?.planId === plan.id}
            >
              {isActive && subscription?.planId === plan.id
                ? 'Current Plan'
                : plan.tierLevel === 0
                  ? 'Get Started Free'
                  : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
