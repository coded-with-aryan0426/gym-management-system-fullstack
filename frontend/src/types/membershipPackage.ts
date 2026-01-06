export interface MembershipPackageDTO {
  packageId?: number;
  packageName: string;
  price: number;
  durationDays: number;
  includedPTSessions: number;
  isActive?: boolean;
}
