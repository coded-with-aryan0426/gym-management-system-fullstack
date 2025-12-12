// Optimistic Update Manager for Enhanced User Action Modals

import type { 
  OptimisticUpdateManager, 
  CRUDOperation, 
  DataConflict, 
  ConflictResolution 
} from '../types/modalEnhancement';

interface PendingOperation {
  operation: CRUDOperation;
  originalData?: any;
  timestamp: Date;
  retryCount: number;
}

export class OptimisticUpdateService implements OptimisticUpdateManager {
  private pendingOperations: Map<string, PendingOperation> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000;

  applyOptimisticUpdate(operation: CRUDOperation): void {
    console.log('[OptimisticUpdateService] Applying optimistic update:', operation);

    // Store the operation for potential rollback
    this.pendingOperations.set(operation.id, {
      operation,
      timestamp: new Date(),
      retryCount: 0
    });

    // Apply the update immediately to the UI state
    this.updateUIState(operation);

    // Schedule background sync with server
    this.scheduleServerSync(operation);
  }

  revertOptimisticUpdate(operationId: string): void {
    const pendingOp = this.pendingOperations.get(operationId);
    if (!pendingOp) {
      console.warn('[OptimisticUpdateService] No pending operation found for ID:', operationId);
      return;
    }

    console.log('[OptimisticUpdateService] Reverting optimistic update:', operationId);

    // Create a reverse operation
    const reverseOperation: CRUDOperation = {
      id: `reverse_${operationId}`,
      type: this.getReverseOperationType(pendingOp.operation.type),
      entity: pendingOp.operation.entity,
      data: pendingOp.originalData || pendingOp.operation.data,
      optimistic: true,
      timestamp: new Date()
    };

    // Apply the reverse operation
    this.updateUIState(reverseOperation);

    // Remove from pending operations
    this.pendingOperations.delete(operationId);
  }

  confirmOptimisticUpdate(operationId: string): void {
    const pendingOp = this.pendingOperations.get(operationId);
    if (!pendingOp) {
      console.warn('[OptimisticUpdateService] No pending operation found for ID:', operationId);
      return;
    }

    console.log('[OptimisticUpdateService] Confirming optimistic update:', operationId);

    // Remove from pending operations as it's now confirmed
    this.pendingOperations.delete(operationId);

    // Trigger success feedback
    this.triggerSuccessFeedback(pendingOp.operation);
  }

  handleConflict(conflict: DataConflict): ConflictResolution {
    console.log('[OptimisticUpdateService] Handling conflict:', conflict);

    // For simple conflicts, try automatic resolution
    if (this.canAutoResolve(conflict)) {
      return this.autoResolveConflict(conflict);
    }

    // For complex conflicts, require manual resolution
    return {
      action: 'manual',
      resolvedData: undefined
    };
  }

  private updateUIState(operation: CRUDOperation): void {
    // Dispatch a custom event that UI components can listen to
    const event = new CustomEvent('optimistic-update', {
      detail: operation
    });
    window.dispatchEvent(event);
  }

  private async scheduleServerSync(operation: CRUDOperation): Promise<void> {
    try {
      // Simulate server sync (replace with actual API call)
      await this.syncWithServer(operation);
      this.confirmOptimisticUpdate(operation.id);
    } catch (error) {
      console.error('[OptimisticUpdateService] Server sync failed:', error);
      await this.handleSyncFailure(operation);
    }
  }

  private async syncWithServer(operation: CRUDOperation): Promise<void> {
    // This would be replaced with actual API calls
    const endpoint = this.getApiEndpoint(operation);
    const method = this.getHttpMethod(operation.type);

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: operation.type !== 'delete' ? JSON.stringify(operation.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Server sync failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async handleSyncFailure(operation: CRUDOperation): Promise<void> {
    const pendingOp = this.pendingOperations.get(operation.id);
    if (!pendingOp) return;

    pendingOp.retryCount++;

    if (pendingOp.retryCount <= this.maxRetries) {
      // Schedule retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, pendingOp.retryCount - 1);
      setTimeout(() => {
        this.scheduleServerSync(operation);
      }, delay);
    } else {
      // Max retries reached, revert the optimistic update
      console.error('[OptimisticUpdateService] Max retries reached, reverting update');
      this.revertOptimisticUpdate(operation.id);
      this.triggerErrorFeedback(operation, 'Operation failed after multiple attempts');
    }
  }

  private canAutoResolve(conflict: DataConflict): boolean {
    // Simple heuristics for auto-resolution
    switch (conflict.type) {
      case 'stale_data':
        return true; // Can usually auto-resolve by accepting incoming data
      case 'concurrent_modification':
        return conflict.field !== 'critical_field'; // Avoid auto-resolving critical fields
      case 'relationship_conflict':
        return false; // Always require manual resolution
      default:
        return false;
    }
  }

  private autoResolveConflict(conflict: DataConflict): ConflictResolution {
    switch (conflict.type) {
      case 'stale_data':
        return {
          action: 'accept_incoming',
          resolvedData: conflict.incomingValue
        };
      case 'concurrent_modification':
        // Simple merge strategy - prefer incoming for non-critical fields
        return {
          action: 'merge',
          resolvedData: {
            ...conflict.currentValue,
            [conflict.field]: conflict.incomingValue
          }
        };
      default:
        return {
          action: 'manual'
        };
    }
  }

  private getReverseOperationType(type: CRUDOperation['type']): CRUDOperation['type'] {
    switch (type) {
      case 'create':
        return 'delete';
      case 'delete':
        return 'create';
      case 'update':
        return 'update'; // Update is its own reverse with original data
      default:
        return type;
    }
  }

  private getApiEndpoint(operation: CRUDOperation): string {
    const baseUrl = '/api';
    switch (operation.entity) {
      case 'user':
        return `${baseUrl}/users`;
      case 'relationship':
        return `${baseUrl}/relationships`;
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }

  private getHttpMethod(operationType: CRUDOperation['type']): string {
    switch (operationType) {
      case 'create':
        return 'POST';
      case 'update':
        return 'PUT';
      case 'delete':
        return 'DELETE';
      default:
        return 'GET';
    }
  }

  private triggerSuccessFeedback(operation: CRUDOperation): void {
    const event = new CustomEvent('operation-success', {
      detail: { operation, message: 'Operation completed successfully' }
    });
    window.dispatchEvent(event);
  }

  private triggerErrorFeedback(operation: CRUDOperation, message: string): void {
    const event = new CustomEvent('operation-error', {
      detail: { operation, message }
    });
    window.dispatchEvent(event);
  }

  // Cleanup method
  clearPendingOperations(): void {
    this.pendingOperations.clear();
  }

  // Get pending operations (for debugging/monitoring)
  getPendingOperations(): PendingOperation[] {
    return Array.from(this.pendingOperations.values());
  }
}

// Singleton instance
export const optimisticUpdateManager = new OptimisticUpdateService();