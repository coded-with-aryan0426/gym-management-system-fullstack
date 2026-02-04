import type { 
  MembershipPackageDTO, 
  MembershipPlan, 
  PlanVariant, 
  PlanFeature,
  PlanCategory,
  PlanStatus,
  DurationUnit,
  FeatureCategory
} from '../types/membershipPackage';
import { apiClient } from './api';

// ==========================================
// LEGACY ANALYTICS (for flat plans)
// ==========================================
export interface MembershipPlanAnalytics {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  averagePrice: number;
  totalRevenue: number;
  plansByStatus: Record<string, number>;
  revenueByPlan: Record<string, number>;
  memberCountByPlan: Record<string, number>;
  averageDurationByPlan: Record<string, number>;
  mostPopularPlan: string;
  highestRevenuePlan: string;
  longestDurationPlan: string;
  plansCreatedThisMonth: number;
  plansCreatedLastMonth: number;
  monthOverMonthGrowth: number;
}

// ==========================================
// TIERED PLAN API TYPES
// ==========================================
export interface TieredPlanStatistics {
  totalPlans: number;
  activePlans: number;
  totalVariants: number;
  activeVariants: number;
  totalMembers: number;
  plansByCategory: Record<PlanCategory, number>;
  plansByStatus: Record<PlanStatus, number>;
}

export interface CreateTieredPlanRequest {
  planName: string;
  description?: string;
  category: PlanCategory;
  planColor?: string;
  iconName?: string;
  isRecommended?: boolean;
  variants: Omit<PlanVariant, 'variantId' | 'durationDays'>[];
  features: Omit<PlanFeature, 'featureId'>[];
}

export interface UpdateTieredPlanRequest extends CreateTieredPlanRequest {
  status: PlanStatus;
}

class MembershipPlanApiService {
  private static instance: MembershipPlanApiService;

  static getInstance(): MembershipPlanApiService {
    if (!MembershipPlanApiService.instance) {
      MembershipPlanApiService.instance = new MembershipPlanApiService();
    }
    return MembershipPlanApiService.instance;
  }

  /**
   * Get all membership plans (admin/owner only)
   */
  async getAllPlans(): Promise<{ data: MembershipPackageDTO[] }> {
    return apiClient.get<MembershipPackageDTO[]>('/admin/membership-plans');
  }

  /**
   * Get active membership plans (admin/owner only)
   */
  async getActivePlans(): Promise<{ data: MembershipPackageDTO[] }> {
    return apiClient.get<MembershipPackageDTO[]>('/admin/membership-plans/active');
  }

  /**
   * Create new membership plan (admin/owner only)
   */
  async createPlan(planData: Omit<MembershipPackageDTO, 'packageId'>): Promise<{ data: MembershipPackageDTO }> {
    return apiClient.post<MembershipPackageDTO>('/admin/membership-plans', planData);
  }

  /**
   * Update existing membership plan (admin/owner only)
   */
  async updatePlan(planId: number, planData: Partial<MembershipPackageDTO>): Promise<{ data: MembershipPackageDTO }> {
    return apiClient.put<MembershipPackageDTO>(`/admin/membership-plans/${planId}`, planData);
  }

  /**
   * Deactivate membership plan (admin/owner only)
   */
  async deactivatePlan(planId: number): Promise<void> {
    return apiClient.patch(`/admin/membership-plans/${planId}/deactivate`);
  }

  /**
   * Activate membership plan (admin/owner only)
   */
  async activatePlan(planId: number): Promise<void> {
    return apiClient.patch(`/admin/membership-plans/${planId}/activate`);
  }

  /**
   * Delete membership plan (admin/owner only)
   */
  async deletePlan(planId: number): Promise<void> {
    return apiClient.delete(`/admin/membership-plans/${planId}`);
  }

  /**
   * Get membership plan analytics (admin/owner only)
   */
  async getAnalytics(): Promise<{ data: MembershipPlanAnalytics }> {
    return apiClient.get<MembershipPlanAnalytics>('/admin/membership-plans/analytics');
  }

  /**
   * Get membership plans for member assignment (filtered active plans)
   */
  async getPlansForAssignment(): Promise<{ data: MembershipPackageDTO[] }> {
    return this.getActivePlans();
  }

  /**
   * Validate membership plan data before submission
   */
  validatePlanData(planData: Omit<MembershipPackageDTO, 'packageId'>): string[] {
    const errors: string[] = [];

    if (!planData.packageName || planData.packageName.trim().length === 0) {
      errors.push('Plan name is required');
    }

    if (!planData.price || planData.price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (!planData.durationDays || planData.durationDays <= 0) {
      errors.push('Duration must be greater than 0 days');
    }

    if (planData.durationDays > 1825) {
      errors.push('Duration cannot exceed 5 years (1825 days)');
    }

    if (planData.price < 10 || planData.price > 10000) {
      errors.push('Price must be between ₹10 and ₹10,000');
    }

    if (planData.includedPTSessions < 0) {
      errors.push('Included PT sessions cannot be negative');
    }

    return errors;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  /**
   * Format duration in days to human readable format
   */
  formatDuration(days: number): string {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Calculate monthly price from total price and duration
   */
  calculateMonthlyPrice(price: number, durationDays: number): number {
    const months = durationDays / 30.44; // Average days per month
    return Math.round((price / months) * 100) / 100;
  }

  /**
   * Compare two membership plans
   */
  comparePlans(plan1: MembershipPackageDTO, plan2: MembershipPackageDTO): {
    priceDifference: number;
    durationDifference: number;
    valuePerDay1: number;
    valuePerDay2: number;
    betterValue: 'plan1' | 'plan2' | 'equal';
  } {
    const valuePerDay1 = plan1.price / plan1.durationDays;
    const valuePerDay2 = plan2.price / plan2.durationDays;
    
    return {
      priceDifference: plan1.price - plan2.price,
      durationDifference: plan1.durationDays - plan2.durationDays,
      valuePerDay1,
      valuePerDay2,
      betterValue: valuePerDay1 < valuePerDay2 ? 'plan1' : valuePerDay2 < valuePerDay1 ? 'plan2' : 'equal'
    };
  }

  // ==========================================
  // TIERED PLAN API METHODS
  // ==========================================

  /**
   * Get all tiered membership plans
   */
  async getAllTieredPlans(): Promise<{ data: MembershipPlan[] }> {
    return apiClient.get<MembershipPlan[]>('/admin/tiered-plans');
  }

  /**
   * Get active tiered plans (for member assignment)
   */
  async getActiveTieredPlans(): Promise<{ data: MembershipPlan[] }> {
    return apiClient.get<MembershipPlan[]>('/admin/tiered-plans/active');
  }

  /**
   * Get a single tiered plan by ID
   */
  async getTieredPlanById(planId: number): Promise<{ data: MembershipPlan }> {
    return apiClient.get<MembershipPlan>(`/admin/tiered-plans/${planId}`);
  }

  /**
   * Get plans by category
   */
  async getTieredPlansByCategory(category: PlanCategory): Promise<{ data: MembershipPlan[] }> {
    return apiClient.get<MembershipPlan[]>(`/admin/tiered-plans/category/${category}`);
  }

  /**
   * Get tiered plan statistics
   */
  async getTieredPlanStatistics(): Promise<{ data: TieredPlanStatistics }> {
    return apiClient.get<TieredPlanStatistics>('/admin/tiered-plans/statistics');
  }

  /**
   * Create a new tiered plan
   */
  async createTieredPlan(data: CreateTieredPlanRequest): Promise<{ data: MembershipPlan }> {
    return apiClient.post<MembershipPlan>('/admin/tiered-plans', data);
  }

  /**
   * Update an existing tiered plan
   */
  async updateTieredPlan(planId: number, data: UpdateTieredPlanRequest): Promise<{ data: MembershipPlan }> {
    return apiClient.put<MembershipPlan>(`/admin/tiered-plans/${planId}`, data);
  }

  /**
   * Duplicate a tiered plan
   */
  async duplicateTieredPlan(planId: number): Promise<{ data: MembershipPlan }> {
    return apiClient.post<MembershipPlan>(`/admin/tiered-plans/${planId}/duplicate`);
  }

  /**
   * Update plan status (ACTIVE, INACTIVE, DRAFT, ARCHIVED)
   */
  async updateTieredPlanStatus(planId: number, status: PlanStatus): Promise<{ data: MembershipPlan }> {
    return apiClient.patch<MembershipPlan>(`/admin/tiered-plans/${planId}/status?status=${status}`);
  }

  /**
   * Activate a tiered plan
   */
  async activateTieredPlan(planId: number): Promise<{ data: MembershipPlan }> {
    return apiClient.patch<MembershipPlan>(`/admin/tiered-plans/${planId}/activate`);
  }

  /**
   * Deactivate a tiered plan
   */
  async deactivateTieredPlan(planId: number): Promise<{ data: MembershipPlan }> {
    return apiClient.patch<MembershipPlan>(`/admin/tiered-plans/${planId}/deactivate`);
  }

  /**
   * Archive a tiered plan
   */
  async archiveTieredPlan(planId: number): Promise<{ data: MembershipPlan }> {
    return apiClient.patch<MembershipPlan>(`/admin/tiered-plans/${planId}/archive`);
  }

  /**
   * Toggle recommended status
   */
  async toggleTieredPlanRecommended(planId: number): Promise<{ data: MembershipPlan }> {
    return apiClient.patch<MembershipPlan>(`/admin/tiered-plans/${planId}/toggle-recommended`);
  }

  /**
   * Reorder plans
   */
  async reorderTieredPlans(planIds: number[]): Promise<void> {
    return apiClient.patch('/admin/tiered-plans/reorder', planIds);
  }

  /**
   * Delete a tiered plan
   */
  async deleteTieredPlan(planId: number): Promise<void> {
    return apiClient.delete(`/admin/tiered-plans/${planId}`);
  }

  // ==========================================
  // TIERED PLAN HELPER METHODS
  // ==========================================

  /**
   * Format variant duration for display
   */
  formatVariantDuration(variant: PlanVariant): string {
    const unitLabels: Record<DurationUnit, [string, string]> = {
      DAYS: ['Day', 'Days'],
      WEEKS: ['Week', 'Weeks'],
      MONTHS: ['Month', 'Months'],
      YEARS: ['Year', 'Years'],
    };
    const [singular, plural] = unitLabels[variant.durationUnit];
    return `${variant.durationValue} ${variant.durationValue === 1 ? singular : plural}`;
  }

  /**
   * Get the starting (lowest) price from a plan's variants
   */
  getStartingPrice(plan: MembershipPlan): number {
    if (!plan.variants || plan.variants.length === 0) return 0;
    return Math.min(...plan.variants.filter(v => v.isActive).map(v => v.price));
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: PlanCategory): string {
    const labels: Record<PlanCategory, string> = {
      STANDARD: 'Standard',
      PREMIUM: 'Premium',
      VIP: 'VIP Elite',
      CORPORATE: 'Corporate',
      STUDENT: 'Student',
      CUSTOM: 'Custom',
    };
    return labels[category] || category;
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: PlanStatus): { bg: string; text: string } {
    const colors: Record<PlanStatus, { bg: string; text: string }> = {
      ACTIVE: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981' },
      INACTIVE: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' },
      DRAFT: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B' },
      ARCHIVED: { bg: 'rgba(107, 114, 128, 0.12)', text: '#6B7280' },
    };
    return colors[status] || colors.INACTIVE;
  }
}

export default MembershipPlanApiService.getInstance();