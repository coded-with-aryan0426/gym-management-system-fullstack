// =====================================================
// TIERED MEMBERSHIP PLAN SYSTEM - TYPE DEFINITIONS
// =====================================================

/**
 * Categories for membership plans
 */
export type PlanCategory = 'fitness' | 'swimming' | 'crossfit' | 'yoga' | 'mixed';

/**
 * Status options for membership plans
 */
export type PlanStatus = 'active' | 'inactive' | 'archived';

/**
 * Duration units for plan variants
 */
export type DurationUnit = 'days' | 'months' | 'years';

/**
 * Feature categories for organization
 */
export type FeatureCategory = 'access' | 'services' | 'training';

/**
 * Main Membership Plan - Container for duration variants
 * One "Gold" plan contains pricing for 1m, 3m, 6m, 12m, etc.
 */
export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  category: PlanCategory;
  icon: string; // emoji
  color: string; // hex color
  status: PlanStatus;
  isFeatured: boolean;
  
  // Policy settings
  freezeAllowed: boolean;
  maxFreezeDays: number;
  freezeFee: number;
  transferAllowed: boolean;
  transferFee: number;
  upgradeAllowed: boolean;
  downgradeAllowed: boolean;
  
  // Billing options
  emiAvailable: boolean;
  autoRenewal: boolean;
  
  // Visibility
  showOnPortal: boolean;
  isLimitedOffer: boolean;
  offerStartDate?: string;
  offerEndDate?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  durations: PlanDuration[];
  features: PlanFeature[];
  
  // Analytics
  memberCount?: number;
  totalRevenue?: number;
}

/**
 * Duration Variant - Each plan can have multiple durations with different pricing
 */
export interface PlanDuration {
  id: number;
  planId: number;
  durationValue: number; // e.g., 1, 3, 6, 12, 45
  durationUnit: DurationUnit;
  price: number;
  discountPercent: number; // calculated from base price
  ptSessions: number;
  isPopular: boolean;
  isBestValue: boolean;
  label?: string; // optional custom label like "Trial Pack"
  isEnabled: boolean;
  sortOrder: number;
  createdAt?: string;
}

/**
 * Plan Feature - Individual feature included/excluded in a plan
 */
export interface PlanFeature {
  id: number;
  planId: number;
  featureKey: string;
  featureName: string;
  featureIcon: string;
  category: FeatureCategory;
  isIncluded: boolean;
  quantity?: number; // for things like guest passes
  createdAt?: string;
}

/**
 * Feature Library - Master list of available features
 */
export interface FeatureLibraryItem {
  id: number;
  category: FeatureCategory;
  featureKey: string;
  featureName: string;
  featureIcon: string;
  description: string;
  sortOrder: number;
}

// =====================================================
// DTOs FOR API COMMUNICATION
// =====================================================

/**
 * DTO for creating a new membership plan
 */
export interface CreateMembershipPlanDTO {
  name: string;
  description?: string;
  category: PlanCategory;
  icon?: string;
  color?: string;
  status?: PlanStatus;
  isFeatured?: boolean;
  
  // Policy settings
  freezeAllowed?: boolean;
  maxFreezeDays?: number;
  freezeFee?: number;
  transferAllowed?: boolean;
  transferFee?: number;
  upgradeAllowed?: boolean;
  downgradeAllowed?: boolean;
  
  // Billing
  emiAvailable?: boolean;
  autoRenewal?: boolean;
  
  // Visibility
  showOnPortal?: boolean;
  isLimitedOffer?: boolean;
  offerStartDate?: string;
  offerEndDate?: string;
  
  // Relations
  durations: CreatePlanDurationDTO[];
  features?: CreatePlanFeatureDTO[];
}

/**
 * DTO for creating a duration variant
 */
export interface CreatePlanDurationDTO {
  durationValue: number;
  durationUnit: DurationUnit;
  price: number;
  ptSessions?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  label?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}

/**
 * DTO for creating/updating a plan feature
 */
export interface CreatePlanFeatureDTO {
  featureKey: string;
  isIncluded: boolean;
  quantity?: number;
}

/**
 * DTO for updating an existing plan
 */
export interface UpdateMembershipPlanDTO extends Partial<CreateMembershipPlanDTO> {
  id?: number;
}

// =====================================================
// FORM STATE INTERFACES
// =====================================================

/**
 * Step 1: Basic Info form state
 */
export interface PlanBasicInfoFormState {
  name: string;
  description: string;
  category: PlanCategory;
  icon: string;
  color: string;
}

/**
 * Step 2: Pricing form state
 */
export interface PlanPricingFormState {
  baseMonthlyPrice: number;
  ptSessionRate: number;
  durations: DurationFormItem[];
  customDurations: CustomDurationFormItem[];
}

/**
 * Standard duration item for form
 */
export interface DurationFormItem {
  durationValue: number;
  durationUnit: DurationUnit;
  price: number;
  ptSessions: number;
  discountPercent: number;
  isPopular: boolean;
  isBestValue: boolean;
  isEnabled: boolean;
}

/**
 * Custom duration item for form
 */
export interface CustomDurationFormItem {
  id: string; // temporary id for form management
  durationValue: number;
  durationUnit: DurationUnit;
  price: number;
  ptSessions: number;
  label: string;
}

/**
 * Step 3: Features form state
 */
export interface PlanFeaturesFormState {
  features: FeatureFormItem[];
  customFeatures: string[];
}

/**
 * Feature item for form
 */
export interface FeatureFormItem {
  featureKey: string;
  featureName: string;
  featureIcon: string;
  category: FeatureCategory;
  isIncluded: boolean;
  quantity?: number;
}

/**
 * Step 4: Settings form state
 */
export interface PlanSettingsFormState {
  // Freeze policy
  freezeAllowed: boolean;
  maxFreezeDays: number;
  freezeFee: number;
  
  // Transfer policy
  transferAllowed: boolean;
  transferFee: number;
  
  // Upgrade/Downgrade
  upgradeAllowed: boolean;
  downgradeAllowed: boolean;
  
  // Billing
  emiAvailable: boolean;
  autoRenewal: boolean;
  
  // Visibility
  status: PlanStatus;
  showOnPortal: boolean;
  isFeatured: boolean;
  isLimitedOffer: boolean;
  offerStartDate: string;
  offerEndDate: string;
}

/**
 * Complete form state for all steps
 */
export interface PlanWizardFormState {
  basicInfo: PlanBasicInfoFormState;
  pricing: PlanPricingFormState;
  features: PlanFeaturesFormState;
  settings: PlanSettingsFormState;
}

// =====================================================
// ANALYTICS & DISPLAY INTERFACES
// =====================================================

/**
 * Plan analytics data
 */
export interface MembershipPlanAnalytics {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  totalMembers: number;
  totalRevenue: number;
  averagePlanPrice: number;
  mostPopularPlan: string;
  highestRevenuePlan: string;
  plansByCategory: Record<PlanCategory, number>;
  membersByPlan: Record<string, number>;
  revenueByPlan: Record<string, number>;
}

/**
 * Plan card display data (for dashboard)
 */
export interface PlanCardDisplayData {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: PlanStatus;
  memberCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  durations: {
    value: number;
    unit: DurationUnit;
    price: number;
    ptSessions: number;
    isPopular: boolean;
    isBestValue: boolean;
  }[];
  featureCount: number;
}

// =====================================================
// UTILITY CONSTANTS
// =====================================================

/**
 * Standard duration options
 */
export const STANDARD_DURATIONS: { value: number; unit: DurationUnit; label: string }[] = [
  { value: 1, unit: 'months', label: '1 Month' },
  { value: 3, unit: 'months', label: '3 Months' },
  { value: 6, unit: 'months', label: '6 Months' },
  { value: 1, unit: 'years', label: '1 Year' },
  { value: 2, unit: 'years', label: '2 Years' },
];

/**
 * Default discount percentages for durations
 */
export const DEFAULT_DISCOUNTS: Record<string, number> = {
  '1-months': 0,
  '3-months': 10,
  '6-months': 20,
  '12-months': 30,
  '1-years': 30,
  '24-months': 40,
  '2-years': 40,
};

/**
 * Plan category options with icons
 */
export const PLAN_CATEGORIES: { value: PlanCategory; label: string; icon: string }[] = [
  { value: 'fitness', label: 'Fitness', icon: '🏋️' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'crossfit', label: 'CrossFit', icon: '💪' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'mixed', label: 'Mixed', icon: '🎯' },
];

/**
 * Premium plan icon options
 */
export const PLAN_ICONS: string[] = [
  '💎', '⭐', '🏆', '👑', '🔥', '⚡', '🎯', '🚀',
  '🌟', '💫', '🏅', '🎖️', '🏋️', '💪', '🧘', '🏊',
];

/**
 * Premium color palette for plans
 */
export const PLAN_COLORS: string[] = [
  '#DC2626', // Red
  '#EA580C', // Orange
  '#D97706', // Amber
  '#CA8A04', // Yellow
  '#65A30D', // Lime
  '#16A34A', // Green
  '#059669', // Emerald
  '#0D9488', // Teal
  '#0891B2', // Cyan
  '#0284C7', // Sky
  '#2563EB', // Blue
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#9333EA', // Purple
  '#C026D3', // Fuchsia
  '#DB2777', // Pink
];

/**
 * Default feature library
 */
export const FEATURE_LIBRARY: Omit<FeatureLibraryItem, 'id'>[] = [
  // Access
  { category: 'access', featureKey: 'gym_floor', featureName: 'Gym Floor Access', featureIcon: '🏋️', description: 'Full access to gym floor equipment', sortOrder: 1 },
  { category: 'access', featureKey: 'cardio_zone', featureName: 'Cardio Zone', featureIcon: '🏃', description: 'Access to cardio equipment area', sortOrder: 2 },
  { category: 'access', featureKey: 'weight_area', featureName: 'Weight Area', featureIcon: '💪', description: 'Access to free weights section', sortOrder: 3 },
  { category: 'access', featureKey: 'group_classes', featureName: 'Group Classes', featureIcon: '🧘', description: 'Unlimited group fitness classes', sortOrder: 4 },
  { category: 'access', featureKey: 'pool', featureName: 'Swimming Pool', featureIcon: '🏊', description: 'Pool and swimming facilities', sortOrder: 5 },
  { category: 'access', featureKey: 'sauna', featureName: 'Sauna/Steam', featureIcon: '🧖', description: 'Sauna and steam room access', sortOrder: 6 },
  
  // Services
  { category: 'services', featureKey: 'locker', featureName: 'Locker', featureIcon: '🔐', description: 'Personal locker storage', sortOrder: 7 },
  { category: 'services', featureKey: 'towel', featureName: 'Towel Service', featureIcon: '🧺', description: 'Fresh towels provided', sortOrder: 8 },
  { category: 'services', featureKey: 'shower_kit', featureName: 'Shower Kit', featureIcon: '🚿', description: 'Complimentary shower amenities', sortOrder: 9 },
  { category: 'services', featureKey: 'parking', featureName: 'Parking', featureIcon: '🅿️', description: 'Free parking space', sortOrder: 10 },
  { category: 'services', featureKey: 'drinks', featureName: 'Complimentary Drinks', featureIcon: '🥤', description: 'Free drinks and refreshments', sortOrder: 11 },
  { category: 'services', featureKey: 'wifi', featureName: 'Premium WiFi', featureIcon: '📶', description: 'High-speed internet access', sortOrder: 12 },
  
  // Training
  { category: 'training', featureKey: 'workout_plan', featureName: 'Custom Workout Plan', featureIcon: '📋', description: 'Personalized workout program', sortOrder: 13 },
  { category: 'training', featureKey: 'nutrition', featureName: 'Nutrition Consultation', featureIcon: '🥗', description: 'Diet and nutrition advice', sortOrder: 14 },
  { category: 'training', featureKey: 'body_scan', featureName: 'Body Composition Scan', featureIcon: '📊', description: 'Regular body analysis', sortOrder: 15 },
  { category: 'training', featureKey: 'buddy_pass', featureName: 'Buddy Pass', featureIcon: '👥', description: 'Bring a friend passes', sortOrder: 16 },
  { category: 'training', featureKey: 'guest_pass', featureName: 'Guest Pass', featureIcon: '🎁', description: 'Guest day passes', sortOrder: 17 },
];
