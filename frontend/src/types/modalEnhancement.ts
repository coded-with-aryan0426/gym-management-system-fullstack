// Enhanced Modal Types for Real-time User Action Modals

import type { User } from './user';

// Core Data Models
export interface EnhancedUser extends User {
  version: number;
  lastModified: Date;
  modifiedBy: string;
  auditTrail: AuditEntry[];
  relationships: {
    trainers?: User[];
    customers?: User[];
  };
  metadata: {
    isOnline?: boolean;
    lastSeen?: Date;
    preferences?: UserPreferences;
  };
}

export interface Relationship {
  id: string;
  trainerId: number;
  customerId: number;
  assignedDate: Date;
  assignedBy: string;
  status: 'active' | 'inactive' | 'pending';
  metadata?: {
    specializations?: string[];
    notes?: string;
  };
}

export interface AuditEntry {
  id: string;
  userId: number;
  action: 'create' | 'update' | 'delete' | 'assign' | 'unassign';
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DataConflict {
  id: string;
  type: 'concurrent_modification' | 'stale_data' | 'relationship_conflict';
  field: string;
  currentValue: any;
  incomingValue: any;
  timestamp: Date;
  conflictingUser: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
}

// Real-time Data Types
export interface RealTimeUserData {
  user: User;
  relationships: Relationship[];
  lastUpdated: Date;
  version: number;
  conflicts?: DataConflict[];
}

export interface DataUpdate {
  type: 'user_update' | 'relationship_update' | 'user_delete';
  userId: number;
  data: any;
  version: number;
  timestamp: Date;
}

// CRUD Operation Types
export interface CRUDOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'user' | 'relationship';
  data: any;
  optimistic: boolean;
  timestamp: Date;
}

export interface ConflictResolution {
  action: 'accept_current' | 'accept_incoming' | 'merge' | 'manual';
  resolvedData?: any;
}

// Error Types
export interface ErrorInfo {
  code: string;
  message: string;
  field?: string;
  recoverable: boolean;
  retryable: boolean;
}

// Enhanced Modal Props
export interface EnhancedUserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userType: 'member' | 'staff';
  realTimeEnabled?: boolean;
  optimisticUpdates?: boolean;
  auditTrail?: boolean;
  onUserUpdate?: (user: User) => void;
  onRelationshipChange?: (relationships: Relationship[]) => void;
}

// Service Interfaces
export interface RealTimeDataProvider {
  subscribeToUserUpdates(userId: number): Observable<User>;
  subscribeToRelationshipUpdates(userId: number): Observable<Relationship[]>;
  unsubscribe(subscriptionId: string): void;
  getLatestData(userId: number): Promise<RealTimeUserData>;
}

export interface OptimisticUpdateManager {
  applyOptimisticUpdate(operation: CRUDOperation): void;
  revertOptimisticUpdate(operationId: string): void;
  confirmOptimisticUpdate(operationId: string): void;
  handleConflict(conflict: DataConflict): ConflictResolution;
}

export interface MicroInteractionEngine {
  triggerHoverEffect(element: HTMLElement): void;
  showLoadingState(operation: string): void;
  displaySuccessAnimation(operation: string): void;
  showErrorState(error: ErrorInfo): void;
  createSkeletonLoader(contentType: string): React.ReactElement;
}

// Observable type (simplified for now, can be replaced with RxJS later)
export interface Observable<T> {
  subscribe(observer: (value: T) => void): { unsubscribe: () => void };
}

// Versioned Entity for Optimistic Locking
export interface VersionedEntity {
  version: number;
  lastModified: Date;
}

// Search and Filter Types
export interface SearchOptions {
  query: string;
  filters: Record<string, any>;
  excludeIds?: number[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}