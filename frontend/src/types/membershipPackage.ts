// ==========================================
// LEGACY FLAT PLAN STRUCTURE (Deprecated)
// ==========================================
export type MembershipPackageDTO = {
  packageId?: number;
  packageName: string;
  price: number;
  durationDays: number;
  includedPTSessions: number;
  isActive?: boolean;
  planColor?: string;
};

// ==========================================
// NEW TIERED PLAN ARCHITECTURE
// ==========================================

// Plan Categories for organization
export type PlanCategory = 'STANDARD' | 'PREMIUM' | 'VIP' | 'CORPORATE' | 'STUDENT' | 'CUSTOM';

// Plan Status
export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';

// Duration unit for flexible pricing
export type DurationUnit = 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

// Feature categories for grouping
export type FeatureCategory = 'ACCESS' | 'EQUIPMENT' | 'CLASSES' | 'AMENITIES' | 'SERVICES' | 'PERKS';

// Plan Variant (Duration option with pricing)
export interface PlanVariant {
  variantId?: number;
  durationValue: number;       // e.g., 1, 3, 6, 12
  durationUnit: DurationUnit;  // e.g., MONTHS
  durationDays: number;        // Computed total days
  price: number;
  originalPrice?: number;      // For showing discounts
  discountPercent?: number;    // e.g., 10 for 10% off
  includedPTSessions: number;
  isPopular?: boolean;         // Highlight badge
  isActive: boolean;
  sortOrder: number;
}

// Plan Feature (Amenities/Access included)
export interface PlanFeature {
  featureId?: number;
  name: string;
  description?: string;
  category: FeatureCategory;
  isIncluded: boolean;
  sortOrder: number;
}

// Main Membership Plan (Container for variants)
export interface MembershipPlan {
  planId?: number;
  planName: string;            // e.g., "Gold", "Platinum"
  description?: string;
  category: PlanCategory;
  planColor: string;           // Brand color for UI
  iconName?: string;           // Lucide icon name
  status: PlanStatus;
  
  // Variants (Different duration/price options)
  variants: PlanVariant[];
  
  // Features included in this plan
  features: PlanFeature[];
  
  // Metadata
  isRecommended?: boolean;     // Highlight as "Best Value"
  memberCount?: number;        // Number of active members
  sortOrder: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// FORM/REQUEST DTOs
// ==========================================

// Create/Update Plan Request
export interface CreateMembershipPlanRequest {
  planName: string;
  description?: string;
  category: PlanCategory;
  planColor?: string;          // Auto-assigned if not provided
  iconName?: string;
  variants: Omit<PlanVariant, 'variantId' | 'durationDays'>[];
  features: Omit<PlanFeature, 'featureId'>[];
  isRecommended?: boolean;
}

// Update Plan Request
export interface UpdateMembershipPlanRequest extends CreateMembershipPlanRequest {
  planId: number;
  status: PlanStatus;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

// Plan Summary (for list views)
export interface MembershipPlanSummary {
  planId: number;
  planName: string;
  category: PlanCategory;
  planColor: string;
  status: PlanStatus;
  variantCount: number;
  startingPrice: number;       // Lowest variant price
  memberCount: number;
  isRecommended: boolean;
}

// Grouped Plans Response (for tiered display)
export interface GroupedPlansResponse {
  plans: MembershipPlan[];
  totalPlans: number;
  totalActiveVariants: number;
  totalMembers: number;
}

// ==========================================
// UI HELPER TYPES
// ==========================================

// For the 5-step wizard
export interface PlanWizardState {
  step: 1 | 2 | 3 | 4 | 5;
  basicInfo: {
    planName: string;
    description: string;
    category: PlanCategory;
    planColor: string;
    iconName: string;
  };
  variants: PlanVariant[];
  features: PlanFeature[];
  settings: {
    isRecommended: boolean;
    status: PlanStatus;
  };
}

// Default features template
export const DEFAULT_FEATURES: Omit<PlanFeature, 'featureId'>[] = [
  { name: 'Gym Access', description: 'Full gym floor access', category: 'ACCESS', isIncluded: true, sortOrder: 1 },
  { name: 'Cardio Zone', description: 'Treadmills, bikes, ellipticals', category: 'EQUIPMENT', isIncluded: true, sortOrder: 2 },
  { name: 'Weight Training', description: 'Free weights and machines', category: 'EQUIPMENT', isIncluded: true, sortOrder: 3 },
  { name: 'Locker Room', description: 'Personal locker access', category: 'AMENITIES', isIncluded: true, sortOrder: 4 },
  { name: 'Group Classes', description: 'Yoga, Zumba, Spinning', category: 'CLASSES', isIncluded: false, sortOrder: 5 },
  { name: 'Swimming Pool', description: 'Pool and sauna access', category: 'AMENITIES', isIncluded: false, sortOrder: 6 },
  { name: 'Personal Training', description: 'One-on-one PT sessions', category: 'SERVICES', isIncluded: false, sortOrder: 7 },
  { name: 'Nutrition Consultation', description: 'Diet planning support', category: 'SERVICES', isIncluded: false, sortOrder: 8 },
  { name: 'Guest Passes', description: 'Bring friends monthly', category: 'PERKS', isIncluded: false, sortOrder: 9 },
  { name: 'Towel Service', description: 'Fresh towels provided', category: 'AMENITIES', isIncluded: false, sortOrder: 10 },
];

// Duration presets for quick selection
export const DURATION_PRESETS: { label: string; value: number; unit: DurationUnit }[] = [
  { label: '1 Month', value: 1, unit: 'MONTHS' },
  { label: '3 Months', value: 3, unit: 'MONTHS' },
  { label: '6 Months', value: 6, unit: 'MONTHS' },
  { label: '1 Year', value: 12, unit: 'MONTHS' },
];

// Plan color palette (premium curated)
export const PLAN_COLORS = [
  '#DC2626', // Crimson Red
  '#EA580C', // Burnt Orange  
  '#D97706', // Amber
  '#16A34A', // Emerald
  '#0891B2', // Cyan
  '#2563EB', // Royal Blue
  '#7C3AED', // Violet
  '#DB2777', // Pink
];

// Category display names
export const CATEGORY_LABELS: Record<PlanCategory, string> = {
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  VIP: 'VIP Elite',
  CORPORATE: 'Corporate',
  STUDENT: 'Student',
  CUSTOM: 'Custom',
};

// Helper: Convert duration to days
export const durationToDays = (value: number, unit: DurationUnit): number => {
  switch (unit) {
    case 'DAYS': return value;
    case 'WEEKS': return value * 7;
    case 'MONTHS': return value * 30;
    case 'YEARS': return value * 365;
    default: return value;
  }
};

// Helper: Format duration for display
export const formatDuration = (value: number, unit: DurationUnit): string => {
  const unitLabels: Record<DurationUnit, [string, string]> = {
    DAYS: ['Day', 'Days'],
    WEEKS: ['Week', 'Weeks'],
    MONTHS: ['Month', 'Months'],
    YEARS: ['Year', 'Years'],
  };
  const [singular, plural] = unitLabels[unit];
  return `${value} ${value === 1 ? singular : plural}`;
};
