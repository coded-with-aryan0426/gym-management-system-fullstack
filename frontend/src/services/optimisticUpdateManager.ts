/**
 * Optimistic Update Manager
 * Stage 3: Real-Time Sync Layer - Phase 3 (Optimistic Mutation Layer)
 * 
 * Manages optimistic UI updates before server confirmation.
 * Provides rollback capability on failure and conflict detection.
 */

import type { CRUDOperation, DataConflict, ConflictResolution } from '../types/modalEnhancement';

interface PendingMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId?: string;
  patch: any;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'rejected';
  rollbackData?: any; // Store original data for rollback
}

class OptimisticUpdateManager {
  private pending = new Map<string, PendingMutation>();
  private snapshots = new Map<string, any>(); // Original data snapshots
  private eventTarget = new EventTarget();

  /**
   * Apply an optimistic update to the UI
   * @param operation - The CRUD operation to apply optimistically
   */
  applyOptimisticUpdate(operation: CRUDOperation): void {
    const mutationId = operation.id;
    const entityKey = `${operation.entity}_${operation.data?.id || 'new'}`;

    // Create snapshot of current state for potential rollback
    if (operation.type === 'update' || operation.type === 'delete') {
      // In real implementation, this would query current state from React Query cache
      this.snapshots.set(mutationId, { ...operation.data });
    }

    // Store pending mutation
    const mutation: PendingMutation = {
      id: mutationId,
      type: operation.type,
      entity: operation.entity,
      entityId: operation.data?.id,
      patch: operation.data,
      timestamp: operation.timestamp.getTime(),
      status: 'pending',
      rollbackData: this.snapshots.get(mutationId)
    };

    this.pending.set(mutationId, mutation);

    // Emit optimistic update event for UI to react
    this.emitEvent('optimistic-update', { operation });

    // Simulate server call (in real implementation, this would be actual API call)
    // For now, we just mark it as applied
    console.log(`[OptimisticUpdateManager] Applied optimistic ${operation.type} for ${operation.entity}:`, operation.data);
  }

  /**
   * Revert an optimistic update (rollback)
   * @param operationId - ID of the operation to revert
   */
  revertOptimisticUpdate(operationId: string): void {
    const mutation = this.pending.get(operationId);
    
    if (!mutation) {
      console.warn(`[OptimisticUpdateManager] No pending mutation found for ID: ${operationId}`);
      return;
    }

    // Restore original data
    const rollbackData = this.snapshots.get(operationId);
    
    if (rollbackData) {
      // In real implementation, this would update React Query cache
      console.log(`[OptimisticUpdateManager] Reverting ${mutation.type} for ${mutation.entity}:`, rollbackData);
    }

    // Clean up
    this.pending.delete(operationId);
    this.snapshots.delete(operationId);

    // Emit revert event
    this.emitEvent('optimistic-revert', { operationId, mutation });
  }

  /**
   * Confirm an optimistic update (server acknowledged)
   * @param operationId - ID of the operation to confirm
   * @param serverData - Data returned from server
   */
  confirmOptimisticUpdate(operationId: string, serverData?: any): void {
    const mutation = this.pending.get(operationId);
    
    if (!mutation) {
      return;
    }

    mutation.status = 'confirmed';
    
    // Update with server data if provided (may include server-generated fields like timestamps, IDs)
    if (serverData) {
      console.log(`[OptimisticUpdateManager] Confirmed ${mutation.type} with server data:`, serverData);
    }

    // Clean up
    this.pending.delete(operationId);
    this.snapshots.delete(operationId);

    // Emit success event
    this.emitEvent('operation-success', { operation: mutation, serverData });
  }

  /**
   * Reject an optimistic update (server rejected)
   * @param operationId - ID of the operation to reject
   * @param error - Error message from server
   */
  rejectOptimisticUpdate(operationId: string, error: string): void {
    const mutation = this.pending.get(operationId);
    
    if (!mutation) {
      return;
    }

    mutation.status = 'rejected';
    
    // Automatically revert the change
    this.revertOptimisticUpdate(operationId);

    // Emit error event
    this.emitEvent('operation-error', { operation: mutation, message: error });
  }

  /**
   * Check if an operation is still pending
   * @param operationId - ID of the operation to check
   * @returns true if operation is pending
   */
  isPending(operationId: string): boolean {
    return this.pending.has(operationId);
  }

  /**
   * Get all pending operations
   * @returns Array of pending mutation IDs
   */
  getPendingOperations(): string[] {
    return Array.from(this.pending.keys());
  }

  /**
   * Get details of a specific pending operation
   * @param operationId - ID of the operation
   * @returns Mutation details or undefined
   */
  getPendingMutation(operationId: string): PendingMutation | undefined {
    return this.pending.get(operationId);
  }

  /**
   * Detect conflicts between optimistic update and server state
   * @param operationId - ID of the operation
   * @param serverData - Current server state
   * @returns Conflict details or null if no conflict
   */
  detectConflict(operationId: string, serverData: any): DataConflict | null {
    const mutation = this.pending.get(operationId);
    
    if (!mutation || !mutation.rollbackData) {
      return null;
    }

    // Simple version comparison (in production, use proper conflict detection)
    const hasConflict = JSON.stringify(mutation.rollbackData) !== JSON.stringify(serverData);

    if (hasConflict) {
      return {
        field: 'data',
        currentValue: mutation.patch,
        incomingValue: serverData,
        timestamp: new Date(mutation.timestamp)
      };
    }

    return null;
  }

  /**
   * Resolve a detected conflict
   * @param operationId - ID of the operation
   * @param resolution - How to resolve the conflict
   */
  resolveConflict(operationId: string, resolution: ConflictResolution): void {
    const mutation = this.pending.get(operationId);
    
    if (!mutation) {
      return;
    }

    switch (resolution.action) {
      case 'accept_current':
        // Keep optimistic update
        this.confirmOptimisticUpdate(operationId, mutation.patch);
        break;
      
      case 'accept_incoming':
        // Revert to server data
        this.revertOptimisticUpdate(operationId);
        break;
      
      case 'merge':
        // Merge both versions
        const merged = { ...mutation.rollbackData, ...mutation.patch, ...resolution.resolvedData };
        this.confirmOptimisticUpdate(operationId, merged);
        break;
      
      case 'manual':
        // User will resolve manually
        console.log(`[OptimisticUpdateManager] Manual conflict resolution required for ${operationId}`);
        break;
    }
  }

  /**
   * Clear all pending operations (useful on logout/cleanup)
   */
  clearAll(): void {
    this.pending.clear();
    this.snapshots.clear();
  }

  /**
   * Emit custom events for UI components to listen
   */
  private emitEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Subscribe to optimistic update events
   * @param eventName - Event to listen for
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on(eventName: string, handler: (detail: any) => void): () => void {
    const listener = (event: Event) => {
      if (event instanceof CustomEvent) {
        handler(event.detail);
      }
    };

    window.addEventListener(eventName, listener);

    return () => {
      window.removeEventListener(eventName, listener);
    };
  }
}

// Export singleton instance
export const optimisticUpdateManager = new OptimisticUpdateManager();

// Export class for testing
export { OptimisticUpdateManager };
