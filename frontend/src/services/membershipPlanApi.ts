import { MembershipPackageDTO } from '../types/membershipPackage';
import { apiClient } from './api';

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
      errors.push('Price must be between $10 and $10,000');
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
}

export default MembershipPlanApiService.getInstance();