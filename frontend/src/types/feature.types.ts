export interface FeatureFlag {
  id: number;
  featureKey: string;
  enabled: boolean;
  description: string;
  allowedRoles: string;
  updatedAt: string;
}

export interface UpdateFeatureRequest {
  enabled?: boolean;
  description?: string;
  allowedRoles?: string;
}
