import { Check, Star, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Paper, Button } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { formatPrice, convertPrice } from '../../utils/geo.utils';
import './PricingPlans.css';

const PLAN_PRICE_INR = 4999;
const TOTAL_VALUE_INR = 582500;
const DAILY_VALUE_INR = 166;

const valueTiers = [
  {
    id: 'starter',
    name: 'Starter',
    basePriceINR: 999,
    description: 'Perfect for solo trainers',
    features: ['Up to 30 members', 'QR check-in', 'Basic scheduling', 'Email support'],
    recommended: false,
    tierValueINR: 83250,
    yearlyPriceINR: 9590,
  },
  {
    id: 'professional',
    name: 'Professional',
    basePriceINR: 2999,
    description: 'For growing studios',
    features: ['Up to 100 members', 'PT booking', 'Payment collection', 'Mobile app', 'Priority support'],
    recommended: true,
    tierValueINR: 249750,
    yearlyPriceINR: 28790,
  },
  {
    id: 'business',
    name: 'Business',
    basePriceINR: 7999,
    description: 'For medium gyms',
    features: ['Up to 500 members', 'Multi-gateway', 'Staff payroll', 'Advanced analytics', 'API access'],
    recommended: false,
    tierValueINR: 124750,
    yearlyPriceINR: 76790,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    basePriceINR: 19999,
    description: 'For chains & franchises',
    features: ['Unlimited members', 'Multi-location', 'White-label', 'Custom API', '24/7 support'],
    recommended: false,
    tierValueINR: 124750,
    yearlyPriceINR: 191990,
  },
];

export default function PricingPlans() {
  const { theme } = useTheme();
  const { currency } = useGeoLocation();
  const isDark = theme === 'dark';
  const annualDiscount = 0.20;

  const planPrice = formatPrice(convertPrice(PLAN_PRICE_INR, currency), currency);
  const totalValue = formatPrice(convertPrice(TOTAL_VALUE_INR, currency), currency);
  const dailyValue = formatPrice(convertPrice(DAILY_VALUE_INR, currency), currency);

  const getFormattedValue = (valueINR: number) => {
    return formatPrice(convertPrice(valueINR, currency), currency);
  };

  return (
    <section id="pricing" className={`pricing-plans-section ${isDark ? 'dark' : 'light'}`}>
      <div className="pricing-plans-container">
        <div className="pricing-plans-header">
          <h2 className="pricing-plans-title">THE VALUE</h2>
          <h3 className="pricing-plans-headline">Everything You Need to Dominate</h3>
          <p className="pricing-plans-subtitle">
            Don't just buy software. Buy the complete operating system for your gym's future.
          </p>
        </div>

        <div className="pricing-plans-grid">
          {valueTiers.map((plan) => {
            const monthlyPrice = convertPrice(plan.basePriceINR, currency);
            const annualPrice = convertPrice(plan.yearlyPriceINR, currency);

            return (
              <div
                key={plan.id}
                className={`pricing-plan-card ${plan.recommended ? 'recommended' : ''}`}
              >
                {plan.recommended && (
                  <div className="recommended-badge">
                    <Star size={14} /> Most Popular
                  </div>
                )}
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-tagline">{plan.description}</p>
                <div className="plan-value-strikethrough">
                  {getFormattedValue(plan.tierValueINR)} value
                </div>
                <div className="plan-price">
                  <span className="price-amount">{formatPrice(annualPrice, currency)}</span>
                  <span className="price-period">/year</span>
                </div>
                <p className="price-monthly">
                  {formatPrice(monthlyPrice, currency)}/month billed annually
                </p>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <Check size={16} className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className={`plan-cta ${plan.recommended ? 'primary' : ''}`}>
                  View Details
                </Link>
              </div>
            );
          })}
        </div>

        <Paper className={`pricing-summary-card ${isDark ? 'dark' : 'light'}`}>
          <div className="summary-total-value">
            Total Value: {totalValue}
          </div>

          <div className="summary-label">YOUR INVESTMENT</div>

          <div className="summary-price">
            {planPrice}<span className="summary-period">/month</span>
          </div>

          <div className="summary-daily">
            That's {dailyValue}/day — less than a single personal training session
          </div>

          <div className="summary-highlight">
            One late payment collected pays for your entire year.
          </div>

          <Button
            className="summary-cta"
            variant="contained"
            endIcon={<ArrowRight size={20} />}
          >
            Start Your 14-Day Free Trial
          </Button>

          <div className="summary-footer">
            <Lock size={16} />
            No credit card required. Cancel anytime.
          </div>
        </Paper>

        <div className="pricing-cta">
          <p>Need a custom solution for your chain or franchise?</p>
          <Link to="/pricing" className="cta-link">
            Compare all features →
          </Link>
        </div>
      </div>
    </section>
  );
}