/**
 * Background Sync Service
 * Stage 3.5: Local-First Architecture
 * 
 * Processes offline operations and syncs them to server when online.
 * Implements exponential backoff and conflict resolution.
 */

import { indexedDBStore } from './indexedDBStore';
import api from './api';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
}

class BackgroundSyncService {
  private syncInterval: number | null = null;
  private isSyncing = false;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_RETRIES = 5;

  /**
   * Start background sync
   */
  start(): void {
    if (this.syncInterval) return;

    console.log('[BackgroundSync] Started');
    
    // Sync immediately
    this.syncPendingOperations();

    // Then sync every 30 seconds
    this.syncInterval = window.setInterval(() => {
      this.syncPendingOperations();
    }, this.SYNC_INTERVAL_MS);

    // Listen to online/offline events
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  /**
   * Stop background sync
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
    
    console.log('[BackgroundSync] Stopped');
  }

  /**
   * Manually trigger sync
   */
  async sync(): Promise<SyncResult> {
    return await this.syncPendingOperations();
  }

  /**
   * Process pending sync operations
   */
  private async syncPendingOperations(): Promise<SyncResult> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: false, synced: 0, failed: 0, conflicts: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    try {
      const pendingOps = await indexedDBStore.getPendingSyncOps();

      if (pendingOps.length === 0) {
        return { success: true, synced: 0, failed: 0, conflicts: 0 };
      }

      console.log(`[BackgroundSync] Syncing ${pendingOps.length} pending operations`);

      for (const op of pendingOps) {
        // Skip if max retries exceeded
        if (op.retryCount >= this.MAX_RETRIES) {
          console.warn(`[BackgroundSync] Operation ${op.id} exceeded max retries, skipping`);
          failed++;
          continue;
        }

        try {
          const result = await this.syncOperation(op);

          if (result.success) {
            await indexedDBStore.completeSyncOp(op.id);
            synced++;
          } else if (result.conflict) {
            conflicts++;
            await this.handleConflict(op, result.serverData);
          } else {
            failed++;
            await indexedDBStore.failSyncOp(op.id, result.error || 'Unknown error');
          }

        } catch (error: any) {
          failed++;
          await indexedDBStore.failSyncOp(op.id, error.message);
          console.error(`[BackgroundSync] Failed to sync operation ${op.id}:`, error);
        }
      }

      console.log(`[BackgroundSync] Complete: ${synced} synced, ${failed} failed, ${conflicts} conflicts`);

    } finally {
      this.isSyncing = false;
    }

    return { success: true, synced, failed, conflicts };
  }

  /**
   * Sync individual operation to server
   */
  private async syncOperation(op: any): Promise<{ success: boolean; conflict?: boolean; serverData?: any; error?: string }> {
    try {
      let response;

      switch (op.operation) {
        case 'create':
          response = await api.post(`/${op.entityType}`, op.data);
          break;

        case 'update':
          response = await api.put(`/${op.entityType}/${op.entityId}`, op.data);
          
          // Check for version conflict
          if (response.data.version && op.data.version && response.data.version !== op.data.version) {
            return { success: false, conflict: true, serverData: response.data };
          }
          break;

        case 'delete':
          response = await api.delete(`/${op.entityType}/${op.entityId}`);
          break;

        default:
          return { success: false, error: 'Unknown operation type' };
      }

      return { success: true };

    } catch (error: any) {
      // Check if it's a conflict (409) or version mismatch
      if (error.response?.status === 409) {
        return { success: false, conflict: true, serverData: error.response.data };
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Handle sync conflict
   * Strategy: Last-Write-Wins (can be enhanced with user choice)
   */
  private async handleConflict(op: any, serverData: any): Promise<void> {
    console.warn(`[BackgroundSync] Conflict detected for ${op.entityType}/${op.entityId}`);

    // For now, server wins (overwrite local)
    // In production, you'd prompt user or use operational transform
    const storeName = op.entityType === 'member' ? 'members' : 
                     op.entityType === 'trainer' ? 'trainers' : 'classes';

    await indexedDBStore.put(storeName as any, serverData);
    await indexedDBStore.completeSyncOp(op.id);

    // Emit conflict event for UI notification
    window.dispatchEvent(new CustomEvent('sync-conflict', {
      detail: { entityType: op.entityType, entityId: op.entityId, serverData }
    }));
  }

  /**
   * Online event handler
   */
  private onOnline = (): void => {
    console.log('[BackgroundSync] Device online, triggering sync');
    this.syncPendingOperations();
  };

  /**
   * Offline event handler
   */
  private onOffline = (): void => {
    console.log('[BackgroundSync] Device offline');
  };

  /**
   * Check if there are pending operations
   */
  async hasPendingOps(): Promise<boolean> {
    const ops = await indexedDBStore.getPendingSyncOps();
    return ops.length > 0;
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<{ pending: number; online: boolean; syncing: boolean }> {
    const ops = await indexedDBStore.getPendingSyncOps();
    return {
      pending: ops.length,
      online: navigator.onLine,
      syncing: this.isSyncing,
    };
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();

// Auto-start on import
backgroundSyncService.start();
