import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Zap, Users, Building2, Crown, ChevronDown, ChevronUp, Globe, MapPin, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import {
  formatPrice,
  convertPrice,
  type Currency,
} from '../../utils/geo.utils';
import './PricingPage.css';

interface PlanFeature {
  name: string;
  starter?: string | boolean;
  professional?: string | boolean;
  business?: string | boolean;
  enterprise?: string | boolean;
}

const GYM_TYPES = [
  {
    id: 'solo',
    name: 'Solo Trainer',
    icon: Users,
    description: 'Independent personal trainer with up to 30 clients',
    members: 'Up to 30',
    trainers: '1',
    color: '#6366f1'
  },
  {
    id: 'small',
    name: 'Small Studio',
    icon: Building2,
    description: 'Boutique gym or specialized fitness studio',
    members: '30-100',
    trainers: '1-3',
    color: '#8b5cf6'
  },
  {
    id: 'medium',
    name: 'Medium Gym',
    icon: Zap,
    description: 'Full-service gym with group classes',
    members: '100-300',
    trainers: '4-10',
    color: '#ec4899'
  },
  {
    id: 'large',
    name: 'Large Gym',
    icon: Building2,
    description: 'Multi-facility fitness center',
    members: '300-1000',
    trainers: '10-25',
    color: '#f59e0b'
  },
  {
    id: 'enterprise',
    name: 'Chain / Franchise',
    icon: Crown,
    description: 'Multiple locations with franchise model',
    members: '1000+',
    trainers: '25+',
    color: '#ef4444'
  }
];

interface Plan {
  id: string;
  name: string;
  basePriceINR: number;
  description: string;
  recommended: boolean;
  gymTypes: string[];
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    basePriceINR: 999,
    description: 'Perfect for solo trainers getting started',
    recommended: false,
    gymTypes: ['solo'],
    features: [
      'Up to 30 members',
      'QR code check-in',
      'Basic scheduling (10 classes/week)',
      '1 trainer profile',
      'Email support',
      'Mobile dashboard'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    basePriceINR: 2999,
    description: 'Ideal for growing studios and small gyms',
    recommended: true,
    gymTypes: ['solo', 'small'],
    features: [
      'Up to 100 members',
      'Biometric check-in (1 device)',
      'Unlimited classes',
      'PT session booking',
      'Branded mobile app',
      'Payment collection',
      'Diet management',
      'Priority email/chat support'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    basePriceINR: 7999,
    description: 'For established medium-sized gyms',
    recommended: false,
    gymTypes: ['small', 'medium'],
    features: [
      'Up to 500 members',
      'Multi payment gateways',
      'Staff payroll',
      'Inventory management',
      'Advanced analytics',
      '3 biometric devices',
      '5 trainer profiles',
      'API access (limited)',
      'Online training sessions'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    basePriceINR: 19999,
    description: 'Complete solution for large gyms & chains',
    recommended: false,
    gymTypes: ['medium', 'large', 'enterprise'],
    features: [
      'Unlimited members',
      'Unlimited locations',
      'Franchise management',
      'Custom branding (white-label)',
      'Full API access',
      'Webhooks',
      'Custom development',
      '24/7 dedicated support',
      'On-site training',
      'Dedicated account manager'
    ]
  }
];

const FEATURES: PlanFeature[] = [
  // Member Management
  { name: 'Member Management', starter: 'Up to 30', professional: 'Up to 100', business: 'Up to 500', enterprise: 'Unlimited' },
  { name: 'Member Check-in (QR)', starter: true, professional: true, business: true, enterprise: true },
  { name: 'Biometric Check-in', starter: false, professional: '1 Device', business: '3 Devices', enterprise: 'Unlimited' },
  { name: 'Member Mobile App', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Branded Mobile App', starter: false, professional: false, business: true, enterprise: true },

  // Trainer Management
  { name: 'Trainer Profiles', starter: '1', professional: 'Up to 5', business: 'Up to 15', enterprise: 'Unlimited' },
  { name: 'Trainer Schedules', starter: true, professional: true, business: true, enterprise: true },
  { name: 'Trainer Availability Calendar', starter: false, professional: true, business: true, enterprise: true },
  { name: 'PT Session Booking', starter: false, professional: true, business: true, enterprise: true },
  { name: 'PT Package Management', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Trainer Commission Tracking', starter: false, professional: false, business: true, enterprise: true },

  // Class Management
  { name: 'Class Scheduling', starter: '10/week', professional: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Class Types', starter: '2', professional: '5', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Class Booking & Waitlist', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Instructor Assignment', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Class Capacity Management', starter: false, professional: true, business: true, enterprise: true },

  // Billing & Payments
  { name: 'Membership Plans', starter: '3', professional: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Payment Collection', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Multi-Payment Gateway', starter: false, professional: false, business: true, enterprise: true },
  { name: 'Auto-Billing & Recurring', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Invoice Generation', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Financial Reporting', starter: false, professional: 'Basic', business: 'Advanced', enterprise: 'Custom' },

  // Workout & Nutrition
  { name: 'Workout Plan Builder', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Exercise Library', starter: false, professional: '500+', business: '1000+', enterprise: 'Unlimited' },
  { name: 'Diet Management', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Progress Tracking', starter: false, professional: true, business: true, enterprise: true },
  { name: 'Member Assessments', starter: false, professional: true, business: true, enterprise: true },

  // Business Management
  { name: 'Inventory Management', starter: false, professional: false, business: true, enterprise: true },
  { name: 'Staff Management', starter: false, professional: 'Basic', business: 'Advanced', enterprise: 'Full' },
  { name: 'Staff Payroll', starter: false, professional: false, business: true, enterprise: true },
  { name: 'Attendance Reports', starter: true, professional: true, business: true, enterprise: true },
  { name: 'Business Analytics', starter: false, professional: 'Basic', business: 'Advanced', enterprise: 'Custom' },

  // Locations & Franchise
  { name: 'Locations', starter: '1', professional: '1', business: '1', enterprise: 'Unlimited' },
  { name: 'Multi-Location Dashboard', starter: false, professional: false, business: false, enterprise: true },
  { name: 'Franchise Management', starter: false, professional: false, business: false, enterprise: true },
  { name: 'Centralized Member Management', starter: false, professional: false, business: false, enterprise: true },

  // Integrations & API
  { name: 'API Access', starter: false, professional: false, business: 'Limited', enterprise: 'Full' },
  { name: 'Third-Party Integrations', starter: false, professional: false, business: 'Limited', enterprise: 'Full' },
  { name: 'Webhooks', starter: false, professional: false, business: false, enterprise: true },
  { name: 'Custom Development', starter: false, professional: false, business: false, enterprise: true },

  // Support
  { name: 'Email Support', starter: true, professional: true, business: true, enterprise: true },
  { name: 'Chat Support', starter: false, professional: 'Priority', business: 'Priority', enterprise: '24/7 Dedicated' },
  { name: 'Onboarding Assistance', starter: 'Self-serve', professional: 'Guided', business: 'Guided', enterprise: 'White-glove' },
  { name: 'Training Sessions', starter: false, professional: false, business: 'Online', enterprise: 'On-site' },
];

const FEATURE_CATEGORIES = [
  { name: 'Member Management', features: FEATURES.filter(f => f.name.includes('Member') || f.name.includes('Check-in') || f.name.includes('App')) },
  { name: 'Trainer Management', features: FEATURES.filter(f => f.name.includes('Trainer') || f.name.includes('PT ')) },
  { name: 'Class Management', features: FEATURES.filter(f => f.name.includes('Class')) },
  { name: 'Billing & Payments', features: FEATURES.filter(f => f.name.includes('Membership') || f.name.includes('Payment') || f.name.includes('Invoice') || f.name.includes('Financial')) },
  { name: 'Workout & Nutrition', features: FEATURES.filter(f => f.name.includes('Workout') || f.name.includes('Diet') || f.name.includes('Progress')) },
  { name: 'Business Operations', features: FEATURES.filter(f => f.name.includes('Inventory') || f.name.includes('Staff') || f.name.includes('Attendance') || f.name.includes('Business')) },
  { name: 'Locations & Franchise', features: FEATURES.filter(f => f.name.includes('Location') || f.name.includes('Franchise') || f.name.includes('Centralized')) },
  { name: 'Integrations & API', features: FEATURES.filter(f => f.name.includes('API') || f.name.includes('Integration') || f.name.includes('Webhook')) },
  { name: 'Support', features: FEATURES.filter(f => f.name.includes('Support') || f.name.includes('Training') || f.name.includes('Onboarding')) },
];

const CURRENCIES: { code: Currency; symbol: string; name: string; flag: string }[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
];

const CURRENCY_SELECTOR_OPTIONS = ['INR', 'USD', 'GBP', 'EUR'] as const;

export default function PricingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { location, currency, isLoading, setCurrency } = useGeoLocation();
  const isDark = theme === 'dark';
  const [selectedGymType, setSelectedGymType] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Member Management');
  const [showAnnual, setShowAnnual] = useState(true);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const annualDiscount = 0.20;

  const getCellContent = (value: string | boolean | undefined) => {
    if (value === true) return <Check size={18} className="check-icon" />;
    if (value === false) return <X size={18} className="x-icon" />;
    return <span className="cell-text">{value}</span>;
  };

  const getPrice = (plan: Plan) => {
    const basePrice = convertPrice(plan.basePriceINR, currency);
    if (showAnnual) {
      return Math.round(basePrice * 12 * (1 - annualDiscount));
    }
    return basePrice;
  };

  const getMonthlyEquivalent = (plan: Plan) => {
    return convertPrice(plan.basePriceINR, currency);
  };

  const recommendedPlan = PLANS.find(p => p.recommended);

  return (
    <div className={`pricing-page ${isDark ? 'dark' : 'light'}`}>
      <div className="pricing-hero">
        <div className="pricing-header-row">
          <div className="pricing-header-left">
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="pricing-title">Simple, Transparent Pricing</h1>
            <p className="pricing-tagline">Everything you need to run your gym, from solo trainer to franchise chain</p>
          </div>
          <div className="pricing-controls">
            {location?.country && (
              <span className="detected-location">
                <MapPin size={14} />
                {location.country}
              </span>
            )}
            <div className="currency-selector-wrapper">
              <button
                className="currency-change-btn"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              >
                <Globe size={14} />
                {currency}
                <ChevronDown size={14} />
              </button>
              <div className={`currency-dropdown ${showCurrencyDropdown ? 'show' : ''}`}>
                {CURRENCIES.map(curr => (
                  <button
                    key={curr.code}
                    className={`currency-option ${currency === curr.code ? 'active' : ''}`}
                    onClick={() => {
                      setCurrency(curr.code);
                      setShowCurrencyDropdown(false);
                    }}
                  >
                    <span>{curr.flag}</span>
                    <span>{curr.code}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="billing-toggle">
              <button
                className={`toggle-btn ${!showAnnual ? 'active' : ''}`}
                onClick={() => setShowAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`toggle-btn ${showAnnual ? 'active' : ''}`}
                onClick={() => setShowAnnual(true)}
              >
                Annual <span className="discount-badge">-20%</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="gym-type-selector">
        <h2>Select Your Gym Type</h2>
        <p className="section-subtitle">We'll recommend the best plan for your needs</p>
        <div className="gym-types-grid">
          {GYM_TYPES.map(gym => {
            const Icon = gym.icon;
            const isSelected = selectedGymType === gym.id;
            return (
              <button
                key={gym.id}
                className={`gym-type-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedGymType(isSelected ? null : gym.id)}
                style={{ '--accent': gym.color } as React.CSSProperties}
              >
                <div className="gym-icon-wrapper">
                  <Icon size={32} style={{ color: '#ffffff' }} />
                </div>
                <h3>{gym.name}</h3>
                <p>{gym.description}</p>
                <div className="gym-stats">
                  <span>{gym.members} members</span>
                  <span>{gym.trainers} trainers</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="plans-grid">
        {PLANS.map(plan => {
          const isRecommended = plan.recommended;
          const isVisible = !selectedGymType || plan.gymTypes.includes(selectedGymType as any);
          const annualPrice = getPrice(plan);
          const monthlyPrice = getMonthlyEquivalent(plan);

          return (
            <div
              key={plan.id}
              className={`plan-card ${isRecommended ? 'recommended' : ''} ${isVisible ? '' : 'dimmed'}`}
            >
              {isRecommended && (
                <div className="recommended-badge">
                  <Star size={14} /> Most Popular
                </div>
              )}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
              </div>
              <div className="plan-price">
                <span className="price-amount">{formatPrice(showAnnual ? annualPrice : monthlyPrice, currency)}</span>
                <span className="price-period">/{showAnnual ? 'year' : 'month'}</span>
              </div>
              {showAnnual && (
                <p className="monthly-equivalent">
                  {formatPrice(monthlyPrice, currency)}/month billed annually
                </p>
              )}
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={16} className="check-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`plan-cta ${isRecommended ? 'primary' : ''}`}>
                Start 14-Day Free Trial
              </button>
            </div>
          );
        })}
      </div>

      <div className="features-section">
        <h2>Compare All Features</h2>
        <div className="feature-categories">
          {FEATURE_CATEGORIES.map(category => (
            <div key={category.name} className="feature-category">
              <button
                className="category-header"
                onClick={() => setExpandedCategory(
                  expandedCategory === category.name ? null : category.name
                )}
              >
                <h3>{category.name}</h3>
                <span className="feature-count">{category.features.length} features</span>
                {expandedCategory === category.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedCategory === category.name && (
                <div className="feature-table">
                  <div className="feature-row header">
                    <div className="feature-name">Feature</div>
                    <div className="plan-cols">
                      <div className="plan-header-cell">Starter</div>
                      <div className="plan-header-cell">Professional</div>
                      <div className="plan-header-cell">Business</div>
                      <div className="plan-header-cell">Enterprise</div>
                    </div>
                  </div>
                  {category.features.map(feature => (
                    <div key={feature.name} className="feature-row">
                      <div className="feature-name">{feature.name}</div>
                      <div className="plan-cols">
                        <div className="plan-cell">{getCellContent(feature.starter)}</div>
                        <div className="plan-cell">{getCellContent(feature.professional)}</div>
                        <div className="plan-cell">{getCellContent(feature.business)}</div>
                        <div className="plan-cell">{getCellContent(feature.enterprise)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I change plans later?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades are applied at the next billing cycle.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards, UPI, net banking, and bank transfers. Enterprise customers can pay via invoice.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>Yes! All plans come with a 14-day free trial. No credit card required to start.</p>
          </div>
          <div className="faq-item">
            <h3>What happens to my data if I cancel?</h3>
            <p>Your data is always accessible. You can export all data before cancellation, and we retain it for 30 days after.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer discounts for nonprofits or startups?</h3>
            <p>Yes, we offer special pricing for nonprofits, educational institutions, and fitness startups. Contact our sales team for details.</p>
          </div>
          <div className="faq-item">
            <h3>How does per-member billing work?</h3>
            <p>Our plans include a base member limit. If you exceed that limit, you can add more members at a per-member rate that varies by plan.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Transform Your Gym?</h2>
        <p>Join thousands of fitness businesses already using our platform</p>
        <div className="cta-buttons">
          <button className="cta-primary">Start 14-Day Free Trial</button>
          <button className="cta-secondary">Talk to Sales</button>
        </div>
      </div>

      <div className="trust-badges">
        <p>Trusted by gyms worldwide</p>
        <div className="trust-stats">
          <div className="trust-stat">
            <strong>500+</strong>
            <span>Gyms</span>
          </div>
          <div className="trust-stat">
            <strong>50,000+</strong>
            <span>Members</span>
          </div>
          <div className="trust-stat">
            <strong>99.9%</strong>
            <span>Uptime</span>
          </div>
          <div className="trust-stat">
            <strong>4.9/5</strong>
            <span>Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}