// Optimistic Locking Service for Enhanced User Action Modals

import type {
  VersionedEntity,
  DataConflict,
  ConflictResolution,
  AuditEntry
} from '../types/modalEnhancement';
import type { User } from '../types/user';
import { enhancedApi } from './enhancedApi';

interface LockInfo {
  entityId: number;
  entityType: 'user' | 'relationship';
  version: number;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
}

interface MergeResult<T> {
  merged: T;
  conflicts: DataConflict[];
  autoResolved: boolean;
}

export class OptimisticLockingService {
  private locks: Map<string, LockInfo> = new Map();
  private lockTimeout = 5 * 60 * 1000; // 5 minutes

  // Version control methods
  async updateWithVersionCheck<T extends VersionedEntity>(
    entity: T,
    updates: Partial<T>,
    entityType: 'user' | 'relationship'
  ): Promise<T> {
    const lockKey = this.getLockKey(entityType, (entity as any).userId || (entity as any).id);

    try {
      // Acquire lock
      await this.acquireLock(lockKey, entityType, entity.version);

      // Detect conflicts
      const conflicts = await this.detectVersionConflicts(entity, updates, entityType);

      if (conflicts.length > 0) {
        // Handle conflicts
        const resolution = await this.resolveConflicts(conflicts, entity, updates);

        if (resolution.action === 'manual') {
          throw new Error('Manual conflict resolution required');
        }

        // Apply resolved changes
        const resolvedUpdates = resolution.resolvedData || updates;
        return await this.performUpdate(entity, resolvedUpdates, entityType);
      }

      // No conflicts, proceed with update
      return await this.performUpdate(entity, updates, entityType);

    } finally {
      // Always release lock
      this.releaseLock(lockKey);
    }
  }

  // Lock management
  private async acquireLock(
    lockKey: string,
    entityType: 'user' | 'relationship',
    version: number
  ): Promise<void> {
    const existingLock = this.locks.get(lockKey);

    if (existingLock && existingLock.expiresAt > new Date()) {
      throw new Error(`Entity is locked by ${existingLock.lockedBy}`);
    }

    const lock: LockInfo = {
      entityId: parseInt(lockKey.split('_')[1]),
      entityType,
      version,
      lockedBy: 'current_user', // This would be the actual user
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + this.lockTimeout)
    };

    this.locks.set(lockKey, lock);
    console.log(`[OptimisticLockingService] Lock acquired: ${lockKey}`);
  }

  private releaseLock(lockKey: string): void {
    this.locks.delete(lockKey);
    console.log(`[OptimisticLockingService] Lock released: ${lockKey}`);
  }

  private getLockKey(entityType: string, entityId: number): string {
    return `${entityType}_${entityId}`;
  }

  // Conflict detection
  private async detectVersionConflicts<T extends VersionedEntity>(
    entity: T,
    updates: Partial<T>,
    entityType: 'user' | 'relationship'
  ): Promise<DataConflict[]> {
    try {
      if (entityType === 'user') {
        return await enhancedApi.detectConflicts(
          (entity as any).userId,
          updates as Partial<User>,
          entity.version
        );
      }

      // For relationships, we'd implement similar logic
      return [];
    } catch (error) {
      console.error('[OptimisticLockingService] Failed to detect conflicts:', error);
      return [];
    }
  }

  // Conflict resolution
  private async resolveConflicts<T>(
    conflicts: DataConflict[],
    entity: T,
    updates: Partial<T>
  ): Promise<ConflictResolution> {
    console.log('[OptimisticLockingService] Resolving conflicts:', conflicts);

    // Try automatic resolution first
    const autoResolution = this.attemptAutoResolution(conflicts, entity, updates);

    if (autoResolution.autoResolved) {
      return {
        action: 'merge',
        resolvedData: autoResolution.merged
      };
    }

    // If auto-resolution failed, require manual intervention
    return {
      action: 'manual'
    };
  }

  // Three-way merge implementation
  private attemptAutoResolution<T>(
    conflicts: DataConflict[],
    entity: T,
    updates: Partial<T>
  ): MergeResult<T> {
    const merged = { ...entity };
    const unresolvedConflicts: DataConflict[] = [];
    let autoResolved = true;

    for (const conflict of conflicts) {
      const resolution = this.resolveFieldConflict(conflict, entity, updates);

      if (resolution.canAutoResolve) {
        (merged as any)[conflict.field] = resolution.resolvedValue;
      } else {
        unresolvedConflicts.push(conflict);
        autoResolved = false;
      }
    }

    return {
      merged,
      conflicts: unresolvedConflicts,
      autoResolved
    };
  }

  private resolveFieldConflict<T>(
    conflict: DataConflict,
    entity: T,
    updates: Partial<T>
  ): { canAutoResolve: boolean; resolvedValue?: any } {
    const { field, currentValue, incomingValue, type } = conflict;

    // Auto-resolution rules
    switch (type) {
      case 'stale_data':
        // Always accept incoming for stale data
        return {
          canAutoResolve: true,
          resolvedValue: incomingValue
        };

      case 'concurrent_modification':
        // Auto-resolve non-critical fields
        if (this.isNonCriticalField(field)) {
          // Use "last writer wins" for non-critical fields
          return {
            canAutoResolve: true,
            resolvedValue: incomingValue
          };
        }
        break;

      case 'relationship_conflict':
        // Never auto-resolve relationship conflicts
        return { canAutoResolve: false };
    }

    return { canAutoResolve: false };
  }

  private isNonCriticalField(field: string): boolean {
    const nonCriticalFields = [
      'lastSeen',
      'preferences',
      'metadata',
      'notes'
    ];

    return nonCriticalFields.includes(field);
  }

  // Update execution
  private async performUpdate<T extends VersionedEntity>(
    entity: T,
    updates: Partial<T>,
    entityType: 'user' | 'relationship'
  ): Promise<T> {
    try {
      if (entityType === 'user') {
        const updatedUser = await enhancedApi.updateUserWithVersion(
          (entity as any).userId,
          updates as Partial<User>,
          entity.version
        );

        return {
          ...updatedUser,
          version: entity.version + 1,
          lastModified: new Date()
        } as unknown as T;
      }

      // For relationships, implement similar logic
      throw new Error(`Update not implemented for entity type: ${entityType}`);

    } catch (error) {
      console.error('[OptimisticLockingService] Failed to perform update:', error);
      throw error;
    }
  }

  // Utility methods
  isLocked(entityType: string, entityId: number): boolean {
    const lockKey = this.getLockKey(entityType, entityId);
    const lock = this.locks.get(lockKey);
    return lock ? lock.expiresAt > new Date() : false;
  }

  getLockInfo(entityType: string, entityId: number): LockInfo | null {
    const lockKey = this.getLockKey(entityType, entityId);
    return this.locks.get(lockKey) || null;
  }

  // Cleanup expired locks
  cleanupExpiredLocks(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    this.locks.forEach((lock, key) => {
      if (lock.expiresAt <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.locks.delete(key);
      console.log(`[OptimisticLockingService] Expired lock cleaned up: ${key}`);
    });
  }

  // Start cleanup interval
  startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredLocks();
    }, 60000); // Clean up every minute
  }
}

// Singleton instance
export const optimisticLockingService = new OptimisticLockingService();

// Start cleanup interval
optimisticLockingService.startCleanupInterval();
