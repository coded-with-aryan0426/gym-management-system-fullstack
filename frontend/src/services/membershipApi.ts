import { apiClient } from './api';
import { MembershipDTO } from '../types/membership';
import type { MembershipPackageDTO } from '../types/membershipPackage';

class MembershipApiService {
  private static instance: MembershipApiService;

  static getInstance(): MembershipApiService {
    if (!MembershipApiService.instance) {
      MembershipApiService.instance = new MembershipApiService();
    }
    return MembershipApiService.instance;
  }

  /**
   * Get membership details for a specific member
   */
  async getMemberMembership(memberId: number): Promise<{ data: MembershipDTO }> {
    return apiClient.get<MembershipDTO>(`/members/${memberId}/membership`);
  }

  /**
   * Get membership plan details
   */
  async getMembershipPlan(packageId: number): Promise<{ data: MembershipPackageDTO }> {
    return apiClient.get<MembershipPackageDTO>(`/membership-packages/${packageId}`);
  }

  /**
   * Generate QR code for check-in
   */
  async generateCheckInQR(memberId: number): Promise<{ data: { qrCode: string } }> {
    return apiClient.post<{ qrCode: string }>(`/members/${memberId}/qr-code`);
  }

  /**
   * Renew membership
   */
  async renewMembership(memberId: number, packageId: number): Promise<{ data: MembershipDTO }> {
    return apiClient.post<MembershipDTO>(`/members/${memberId}/renew`, { packageId });
  }

  /**
   * Upgrade membership plan
   */
  async upgradeMembership(memberId: number, newPackageId: number): Promise<{ data: MembershipDTO }> {
    return apiClient.post<MembershipDTO>(`/members/${memberId}/upgrade`, { newPackageId });
  }

  /**
   * Cancel membership (Admin/Owner only or Member with valid reason)
   */
  async cancelMembership(memberId: number, reason: string): Promise<{ data: void }> {
    return apiClient.post<void>(`/members/${memberId}/cancel`, { reason });
  }

  /**
   * Get membership history
   */
  async getMembershipHistory(memberId: number): Promise<{ data: MembershipDTO[] }> {
    return apiClient.get<MembershipDTO[]>(`/members/${memberId}/membership-history`);
  }
}

export default MembershipApiService.getInstance();
