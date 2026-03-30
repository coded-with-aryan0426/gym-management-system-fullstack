/**
 * IndexedDB Store - Local-First Data Storage
 * Stage 3.5: Local-First Architecture
 * 
 * Client-side database for immediate data access and offline capability.
 * Makes client the primary source of truth, server is eventual sync point.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AthlonDBSchema extends DBSchema {
  members: {
    key: number;
    value: any;
    indexes: { 'tenantId': number; 'updatedAt': number };
  };
  trainers: {
    key: number;
    value: any;
    indexes: { 'tenantId': number; 'updatedAt': number };
  };
  classes: {
    key: number;
    value: any;
    indexes: { 'tenantId': number; 'updatedAt': number };
  };
  syncQueue: {
    key: string;
    value: PendingSyncOperation;
    indexes: { 'status': string; 'createdAt': number };
  };
  metadata: {
    key: string;
    value: any;
  };
}

interface PendingSyncOperation {
  id: string;
  entityType: string;
  entityId?: number;
  operation: 'create' | 'update' | 'delete';
  data: any;
  tenantId: number;
  status: 'pending' | 'syncing' | 'failed';
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

class IndexedDBStore {
  private db: IDBPDatabase<AthlonDBSchema> | null = null;
  private readonly DB_NAME = 'AthlonX';
  private readonly DB_VERSION = 1;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<AthlonDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Members store
        if (!db.objectStoreNames.contains('members')) {
          const memberStore = db.createObjectStore('members', { keyPath: 'id' });
          memberStore.createIndex('tenantId', 'tenantId');
          memberStore.createIndex('updatedAt', 'updatedAt');
        }

        // Trainers store
        if (!db.objectStoreNames.contains('trainers')) {
          const trainerStore = db.createObjectStore('trainers', { keyPath: 'id' });
          trainerStore.createIndex('tenantId', 'tenantId');
          trainerStore.createIndex('updatedAt', 'updatedAt');
        }

        // Classes store
        if (!db.objectStoreNames.contains('classes')) {
          const classStore = db.createObjectStore('classes', { keyPath: 'id' });
          classStore.createIndex('tenantId', 'tenantId');
          classStore.createIndex('updatedAt', 'updatedAt');
        }

        // Sync queue for offline operations
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status');
          syncStore.createIndex('createdAt', 'createdAt');
        }

        // Metadata store for sync state
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });

    console.log('[IndexedDBStore] Initialized');
  }

  /**
   * Get entity by ID (instant, from local DB)
   */
  async get(storeName: 'members' | 'trainers' | 'classes', id: number): Promise<any | null> {
    if (!this.db) await this.init();
    return await this.db!.get(storeName, id);
  }

  /**
   * Get all entities of a type (instant, from local DB)
   */
  async getAll(storeName: 'members' | 'trainers' | 'classes', tenantId?: number): Promise<any[]> {
    if (!this.db) await this.init();
    
    if (tenantId) {
      return await this.db!.getAllFromIndex(storeName, 'tenantId', tenantId);
    }
    
    return await this.db!.getAll(storeName);
  }

  /**
   * Save entity to local DB (instant write)
   */
  async put(storeName: 'members' | 'trainers' | 'classes', entity: any): Promise<void> {
    if (!this.db) await this.init();
    entity.updatedAt = Date.now();
    await this.db!.put(storeName, entity);
  }

  /**
   * Delete entity from local DB
   */
  async delete(storeName: 'members' | 'trainers' | 'classes', id: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete(storeName, id);
  }

  /**
   * Batch put for bulk updates
   */
  async putMany(storeName: 'members' | 'trainers' | 'classes', entities: any[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(storeName, 'readwrite');
    
    await Promise.all([
      ...entities.map(entity => {
        entity.updatedAt = Date.now();
        return tx.store.put(entity);
      }),
      tx.done,
    ]);
  }

  /**
   * Add operation to sync queue (for offline support)
   */
  async queueSync(operation: Omit<PendingSyncOperation, 'id' | 'createdAt' | 'retryCount' | 'status'>): Promise<string> {
    if (!this.db) await this.init();
    
    const syncOp: PendingSyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    await this.db!.put('syncQueue', syncOp);
    return syncOp.id;
  }

  /**
   * Get pending sync operations
   */
  async getPendingSyncOps(): Promise<PendingSyncOperation[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('syncQueue', 'status', 'pending');
  }

  /**
   * Mark sync operation as complete
   */
  async completeSyncOp(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('syncQueue', id);
  }

  /**
   * Mark sync operation as failed
   */
  async failSyncOp(id: string, error: string): Promise<void> {
    if (!this.db) await this.init();
    const op = await this.db!.get('syncQueue', id);
    if (op) {
      op.status = 'failed';
      op.retryCount++;
      op.lastError = error;
      await this.db!.put('syncQueue', op);
    }
  }

  /**
   * Get metadata (last sync time, etc.)
   */
  async getMetadata(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    const result = await this.db!.get('metadata', key);
    return result?.value || null;
  }

  /**
   * Set metadata
   */
  async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('metadata', { key, value });
  }

  /**
   * Clear all data (useful for logout)
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    await Promise.all([
      this.db!.clear('members'),
      this.db!.clear('trainers'),
      this.db!.clear('classes'),
      this.db!.clear('syncQueue'),
      this.db!.clear('metadata'),
    ]);
    console.log('[IndexedDBStore] Cleared all data');
  }

  /**
   * Get database size estimate
   */
  async getSize(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }
}

// Export singleton instance
export const indexedDBStore = new IndexedDBStore();

// Initialize on import
indexedDBStore.init().catch(error => {
  console.error('[IndexedDBStore] Failed to initialize:', error);
});
