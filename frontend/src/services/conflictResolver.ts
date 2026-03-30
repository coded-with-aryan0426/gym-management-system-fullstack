/**
 * Conflict Resolution Service
 * Stage 3.5: Local-First Architecture
 * 
 * Handles merge conflicts between local and server state.
 * Implements multiple strategies: Last-Write-Wins, Manual, Field-Level Merge
 */

export type ConflictStrategy = 'last-write-wins' | 'manual' | 'field-merge' | 'server-wins' | 'client-wins';

export interface Conflict<T = any> {
  id: string;
  entityType: string;
  entityId: number;
  localVersion: T;
  serverVersion: T;
  localTimestamp: number;
  serverTimestamp: number;
  conflictingFields: string[];
}

export interface ConflictResolution<T = any> {
  strategy: ConflictStrategy;
  resolvedData: T;
  timestamp: number;
}

class ConflictResolutionService {
  private pendingConflicts: Map<string, Conflict> = new Map();
  private resolutionCallbacks: Map<string, (resolution: ConflictResolution) => void> = new Map();

  /**
   * Detect conflicts between local and server versions
   */
  detectConflict<T extends Record<string, any>>(
    entityType: string,
    entityId: number,
    localVersion: T,
    serverVersion: T
  ): Conflict<T> | null {
    const conflictingFields: string[] = [];

    // Compare all fields
    for (const key in localVersion) {
      if (key === 'id' || key === 'updatedAt' || key === 'createdAt') continue;

      if (JSON.stringify(localVersion[key]) !== JSON.stringify(serverVersion[key])) {
        conflictingFields.push(key);
      }
    }

    // No conflict if fields are identical
    if (conflictingFields.length === 0) {
      return null;
    }

    const conflict: Conflict<T> = {
      id: `conflict_${entityType}_${entityId}_${Date.now()}`,
      entityType,
      entityId,
      localVersion,
      serverVersion,
      localTimestamp: (localVersion as any).updatedAt || Date.now(),
      serverTimestamp: (serverVersion as any).updatedAt || Date.now(),
      conflictingFields,
    };

    console.warn(`[ConflictResolver] Conflict detected for ${entityType}/${entityId}:`, conflictingFields);

    return conflict;
  }

  /**
   * Resolve conflict using specified strategy
   */
  async resolveConflict<T>(
    conflict: Conflict<T>,
    strategy: ConflictStrategy,
    manualResolution?: Partial<T>
  ): Promise<ConflictResolution<T>> {
    let resolvedData: T;

    switch (strategy) {
      case 'last-write-wins':
        resolvedData = conflict.localTimestamp > conflict.serverTimestamp
          ? conflict.localVersion
          : conflict.serverVersion;
        console.log(`[ConflictResolver] Last-write-wins: ${conflict.localTimestamp > conflict.serverTimestamp ? 'local' : 'server'} wins`);
        break;

      case 'server-wins':
        resolvedData = conflict.serverVersion;
        console.log('[ConflictResolver] Server-wins strategy applied');
        break;

      case 'client-wins':
        resolvedData = conflict.localVersion;
        console.log('[ConflictResolver] Client-wins strategy applied');
        break;

      case 'field-merge':
        resolvedData = this.fieldLevelMerge(conflict);
        console.log('[ConflictResolver] Field-level merge applied');
        break;

      case 'manual':
        if (!manualResolution) {
          throw new Error('Manual resolution requires manualResolution parameter');
        }
        resolvedData = { ...conflict.serverVersion, ...manualResolution };
        console.log('[ConflictResolver] Manual resolution applied');
        break;

      default:
        throw new Error(`Unknown conflict strategy: ${strategy}`);
    }

    const resolution: ConflictResolution<T> = {
      strategy,
      resolvedData,
      timestamp: Date.now(),
    };

    // Remove from pending
    this.pendingConflicts.delete(conflict.id);

    // Notify listeners
    const callback = this.resolutionCallbacks.get(conflict.id);
    if (callback) {
      callback(resolution);
      this.resolutionCallbacks.delete(conflict.id);
    }

    // Emit resolution event
    window.dispatchEvent(new CustomEvent('conflict-resolved', {
      detail: { conflict, resolution }
    }));

    return resolution;
  }

  /**
   * Field-level merge: Keep newer value for each field
   */
  private fieldLevelMerge<T extends Record<string, any>>(conflict: Conflict<T>): T {
    const merged = { ...conflict.serverVersion };

    for (const field of conflict.conflictingFields) {
      // If local is newer, use local value
      if (conflict.localTimestamp > conflict.serverTimestamp) {
        merged[field] = conflict.localVersion[field];
      }
      // Otherwise keep server value (already in merged)
    }

    return merged as T;
  }

  /**
   * Register a conflict for manual resolution
   * Returns a promise that resolves when user resolves it
   */
  async registerConflict<T>(conflict: Conflict<T>): Promise<ConflictResolution<T>> {
    this.pendingConflicts.set(conflict.id, conflict);

    // Emit event for UI to show conflict modal
    window.dispatchEvent(new CustomEvent('conflict-detected', {
      detail: conflict
    }));

    // Return promise that resolves when user resolves
    return new Promise((resolve) => {
      this.resolutionCallbacks.set(conflict.id, resolve as any);
    });
  }

  /**
   * Get all pending conflicts
   */
  getPendingConflicts(): Conflict[] {
    return Array.from(this.pendingConflicts.values());
  }

  /**
   * Get pending conflict by ID
   */
  getConflict(id: string): Conflict | undefined {
    return this.pendingConflicts.get(id);
  }

  /**
   * Auto-resolve all pending conflicts with given strategy
   */
  async autoResolveAll(strategy: ConflictStrategy): Promise<ConflictResolution[]> {
    const conflicts = this.getPendingConflicts();
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict, strategy);
      resolutions.push(resolution);
    }

    console.log(`[ConflictResolver] Auto-resolved ${resolutions.length} conflicts with ${strategy}`);
    return resolutions;
  }

  /**
   * Clear all pending conflicts
   */
  clearAll(): void {
    this.pendingConflicts.clear();
    this.resolutionCallbacks.clear();
  }

  /**
   * Subscribe to conflict events
   */
  onConflict(callback: (conflict: Conflict) => void): () => void {
    const handler = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(event.detail);
      }
    };

    window.addEventListener('conflict-detected', handler);

    return () => {
      window.removeEventListener('conflict-detected', handler);
    };
  }

  /**
   * Subscribe to resolution events
   */
  onResolution(callback: (data: { conflict: Conflict; resolution: ConflictResolution }) => void): () => void {
    const handler = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(event.detail);
      }
    };

    window.addEventListener('conflict-resolved', handler);

    return () => {
      window.removeEventListener('conflict-resolved', handler);
    };
  }
}

// Export singleton instance
export const conflictResolver = new ConflictResolutionService();
