/**
 * Delta Sync Service - Stage 3 & 4: Real-Time Sync Layer + Offline Recovery
 *
 * Handles WebSocket subscription to delta events and applies
 * incremental updates to React Query cache without full refetch.
 * 
 * Stage 4 additions:
 * - Checkpoint management for sequence tracking
 * - Event replay on reconnect
 * - Polling fallback when WebSocket unavailable
 * - Offline mode detection and cached data display
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { queryClient } from './queryClient';
import api from './api';

export interface DeltaEvent {
    eventId: string;
    entityType: string;
    entityId: number;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: unknown;
    tenantId: number;
    actorId: number;
    timestamp: string;
    sequenceNumber: number;
    version?: number;
}

type DeltaHandler = (event: DeltaEvent) => void;
type ConnectionStatusHandler = (status: 'connected' | 'disconnected' | 'reconnecting' | 'offline') => void;

// Local storage key for checkpoints
const CHECKPOINT_KEY = 'delta_sync_checkpoints';
const OFFLINE_QUEUE_KEY = 'delta_sync_offline_queue';

class DeltaSyncService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private handlers: Map<string, DeltaHandler[]> = new Map();
    private statusHandlers: ConnectionStatusHandler[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private isConnecting = false;
    private lastSequence: Map<string, number> = new Map(); // Per entity type
    private processedEvents: Set<string> = new Set(); // For idempotency
    private readonly maxProcessedEvents = 1000; // Prevent memory leak

    // Stage 4: Offline recovery
    private pollingInterval: ReturnType<typeof setInterval> | null = null;
    private isOffline = false;
    private tenantId: number | null = null;
    private token: string | null = null;
    private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' | 'offline' = 'disconnected';

    constructor() {
        // Load checkpoints from localStorage
        this.loadCheckpoints();

        // Listen for online/offline events
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());
        }
    }

    /**
     * Connect to the WebSocket server
     */
    connect(token: string, tenantId: number): void {
        if (this.isConnecting || this.client?.connected) {
            return;
        }

        // Store credentials for reconnection
        this.token = token;
        this.tenantId = tenantId;
        this.isConnecting = true;
        this.setConnectionStatus('reconnecting');

        this.client = new Client({
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                if (import.meta.env.DEV) {
                    console.log('[DeltaSync]', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                console.log('[DeltaSync] Connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.setConnectionStatus('connected');
                this.stopPollingFallback();

                // Subscribe to entity-specific delta topics
                this.subscribeToEntityDeltas(tenantId);

                // Request missed events since last checkpoint
                this.requestMissedEvents(tenantId);
            },
            onDisconnect: () => {
                console.log('[DeltaSync] Disconnected');
                this.isConnecting = false;
                this.setConnectionStatus('disconnected');

                // Start polling fallback
                this.startPollingFallback();
            },
            onStompError: (frame) => {
                console.error('[DeltaSync] STOMP error', frame);
                this.scheduleReconnect(token, tenantId);
            },
        });

        this.client.activate();
    }

    /**
     * Subscribe to delta topics for all entity types
     */
    private subscribeToEntityDeltas(tenantId: number): void {
        const entityTypes = ['member', 'trainer', 'class', 'membership', 'equipment', 'attendance'];

        for (const entityType of entityTypes) {
            const topic = `/topic/delta/${tenantId}/${entityType}`;

            if (this.subscriptions.has(topic)) {
                continue; // Already subscribed
            }

            const subscription = this.client?.subscribe(topic, (message: IMessage) => {
                this.handleDeltaMessage(message, entityType);
            });

            if (subscription) {
                this.subscriptions.set(topic, subscription);
                console.log(`[DeltaSync] Subscribed to ${topic}`);
            }
        }
    }

    /**
     * Handle incoming delta message
     */
    private handleDeltaMessage(message: IMessage, entityType: string): void {
        try {
            const event: DeltaEvent = JSON.parse(message.body);

            // Idempotency check
            if (this.processedEvents.has(event.eventId)) {
                console.log(`[DeltaSync] Skipping duplicate event ${event.eventId}`);
                return;
            }

            // Sequence check (detect gaps)
            const lastSeq = this.lastSequence.get(entityType) || 0;
            if (event.sequenceNumber > lastSeq + 1 && lastSeq > 0) {
                console.warn(`[DeltaSync] Sequence gap detected for ${entityType}: expected ${lastSeq + 1}, got ${event.sequenceNumber}`);
                // Could trigger a full refetch here for consistency
            }
            this.lastSequence.set(entityType, event.sequenceNumber);

            // Mark as processed
            this.processedEvents.add(event.eventId);
            if (this.processedEvents.size > this.maxProcessedEvents) {
                // Remove oldest entries
                const iterator = this.processedEvents.values();
                for (let i = 0; i < 100; i++) {
                    this.processedEvents.delete(iterator.next().value);
                }
            }

            // Apply to cache
            this.applyCacheUpdate(event);

            // Notify custom handlers
            const handlers = this.handlers.get(entityType) || [];
            handlers.forEach(handler => handler(event));

        } catch (error) {
            console.error('[DeltaSync] Failed to process delta message:', error);
        }
    }

    /**
     * Apply delta event to React Query cache
     */
    private applyCacheUpdate(event: DeltaEvent): void {
        const { entityType, entityId, operation, payload } = event;

        // Map entity types to query key patterns
        const queryKeyMap: Record<string, string[]> = {
            member: ['members'],
            trainer: ['trainers'],
            class: ['classes'],
            membership: ['memberships'],
            equipment: ['equipment'],
            attendance: ['attendance'],
        };

        const baseKey = queryKeyMap[entityType];
        if (!baseKey) {
            console.warn(`[DeltaSync] Unknown entity type: ${entityType}`);
            return;
        }

        switch (operation) {
            case 'CREATE':
                this.handleCreate(baseKey, entityId, payload);
                break;
            case 'UPDATE':
                this.handleUpdate(baseKey, entityId, payload);
                break;
            case 'DELETE':
                this.handleDelete(baseKey, entityId);
                break;
        }

        console.log(`[DeltaSync] Applied ${operation} for ${entityType}:${entityId}`);
    }

    /**
     * Handle CREATE operation - add to list caches
     */
    private handleCreate(baseKey: string[], entityId: number, payload: unknown): void {
        // Update list queries by adding the new item
        queryClient.setQueriesData(
            { queryKey: baseKey, exact: false },
            (oldData: unknown) => {
                if (!oldData) return oldData;

                // Handle paginated responses
                if (this.isPaginatedResponse(oldData)) {
                    return {
                        ...oldData,
                        content: [payload, ...(oldData as any).content],
                        totalElements: ((oldData as any).totalElements || 0) + 1,
                    };
                }

                // Handle array responses
                if (Array.isArray(oldData)) {
                    return [payload, ...oldData];
                }

                return oldData;
            }
        );

        // Also set the individual entity cache
        queryClient.setQueryData([...baseKey, entityId], payload);
    }

    /**
     * Handle UPDATE operation - update in all caches
     */
    private handleUpdate(baseKey: string[], entityId: number, payload: unknown): void {
        // Update the individual entity cache
        queryClient.setQueryData([...baseKey, entityId], (oldData: unknown) => {
            if (!oldData) return payload;
            return { ...oldData as object, ...payload as object };
        });

        // Update in list caches
        queryClient.setQueriesData(
            { queryKey: baseKey, exact: false },
            (oldData: unknown) => {
                if (!oldData) return oldData;

                // Handle paginated responses
                if (this.isPaginatedResponse(oldData)) {
                    return {
                        ...oldData,
                        content: (oldData as any).content.map((item: any) =>
                            item.id === entityId ? { ...item, ...payload as object } : item
                        ),
                    };
                }

                // Handle array responses
                if (Array.isArray(oldData)) {
                    return oldData.map((item: any) =>
                        item.id === entityId ? { ...item, ...payload as object } : item
                    );
                }

                return oldData;
            }
        );
    }

    /**
     * Handle DELETE operation - remove from all caches
     */
    private handleDelete(baseKey: string[], entityId: number): void {
        // Remove from individual entity cache
        queryClient.removeQueries({ queryKey: [...baseKey, entityId] });

        // Remove from list caches
        queryClient.setQueriesData(
            { queryKey: baseKey, exact: false },
            (oldData: unknown) => {
                if (!oldData) return oldData;

                // Handle paginated responses
                if (this.isPaginatedResponse(oldData)) {
                    return {
                        ...oldData,
                        content: (oldData as any).content.filter((item: any) => item.id !== entityId),
                        totalElements: Math.max(0, ((oldData as any).totalElements || 0) - 1),
                    };
                }

                // Handle array responses
                if (Array.isArray(oldData)) {
                    return oldData.filter((item: any) => item.id !== entityId);
                }

                return oldData;
            }
        );
    }

    /**
     * Check if response is a Spring Data Page response
     */
    private isPaginatedResponse(data: unknown): boolean {
        return (
            data !== null &&
            typeof data === 'object' &&
            'content' in data &&
            Array.isArray((data as any).content)
        );
    }

    /**
     * Register a custom handler for a specific entity type
     */
    onDelta(entityType: string, handler: DeltaHandler): () => void {
        const handlers = this.handlers.get(entityType) || [];
        handlers.push(handler);
        this.handlers.set(entityType, handlers);

        // Return unsubscribe function
        return () => {
            const current = this.handlers.get(entityType) || [];
            this.handlers.set(entityType, current.filter(h => h !== handler));
        };
    }

    /**
     * Schedule reconnection with exponential backoff
     */
    private scheduleReconnect(token: string, tenantId: number): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[DeltaSync] Max reconnection attempts reached');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        console.log(`[DeltaSync] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect(token, tenantId);
        }, delay);
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions.clear();
        this.handlers.clear();
        this.stopPollingFallback();
        this.client?.deactivate();
        this.client = null;
        this.isConnecting = false;
        this.setConnectionStatus('disconnected');
        this.saveCheckpoints(); // Persist checkpoints before disconnect
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.client?.connected ?? false;
    }

    /**
     * Get last known sequence number for an entity type
     */
    getLastSequence(entityType: string): number {
        return this.lastSequence.get(entityType) || 0;
    }

    /**
     * Get current connection status
     */
    getConnectionStatus(): typeof this.connectionStatus {
        return this.connectionStatus;
    }

    /**
     * Register a status change handler
     */
    onStatusChange(handler: ConnectionStatusHandler): () => void {
        this.statusHandlers.push(handler);
        // Immediately notify of current status
        handler(this.connectionStatus);
        return () => {
            this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
        };
    }

    // ==================== Stage 4: Offline Recovery ====================

    /**
     * Set connection status and notify handlers
     */
    private setConnectionStatus(status: typeof this.connectionStatus): void {
        if (this.connectionStatus !== status) {
            this.connectionStatus = status;
            this.statusHandlers.forEach(handler => handler(status));
            console.log(`[DeltaSync] Status changed to: ${status}`);
        }
    }

    /**
     * Handle browser going online
     */
    private handleOnline(): void {
        console.log('[DeltaSync] Browser online - attempting reconnect');
        this.isOffline = false;
        if (this.token && this.tenantId) {
            this.connect(this.token, this.tenantId);
        }
    }

    /**
     * Handle browser going offline
     */
    private handleOffline(): void {
        console.log('[DeltaSync] Browser offline');
        this.isOffline = true;
        this.setConnectionStatus('offline');
        this.stopPollingFallback();
    }

    /**
     * Load checkpoints from localStorage
     */
    private loadCheckpoints(): void {
        try {
            const saved = localStorage.getItem(CHECKPOINT_KEY);
            if (saved) {
                const checkpoints = JSON.parse(saved) as Record<string, number>;
                Object.entries(checkpoints).forEach(([key, value]) => {
                    this.lastSequence.set(key, value);
                });
                console.log('[DeltaSync] Loaded checkpoints:', checkpoints);
            }
        } catch (error) {
            console.error('[DeltaSync] Failed to load checkpoints:', error);
        }
    }

    /**
     * Save checkpoints to localStorage
     */
    private saveCheckpoints(): void {
        try {
            const checkpoints: Record<string, number> = {};
            this.lastSequence.forEach((value, key) => {
                checkpoints[key] = value;
            });
            localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoints));
        } catch (error) {
            console.error('[DeltaSync] Failed to save checkpoints:', error);
        }
    }

    /**
     * Request missed events since last checkpoint (placeholder for backend endpoint)
     */
    private async requestMissedEvents(tenantId: number): Promise<void> {
        // This would call a backend endpoint to get missed events
        // For now, we just log and do a soft refresh of stale queries
        console.log('[DeltaSync] Checking for missed events...');

        // Find the oldest checkpoint
        let oldestSequence = Infinity;
        this.lastSequence.forEach((seq) => {
            if (seq < oldestSequence) oldestSequence = seq;
        });

        if (oldestSequence === Infinity || oldestSequence === 0) {
            // No checkpoints - assume fresh start
            return;
        }

        // In a full implementation, we'd call:
        // const missedEvents = await api.getDeltaEventsSince(tenantId, oldestSequence);
        // missedEvents.forEach(event => this.handleDeltaMessage(event));

        // For now, invalidate stale queries to trigger refetch
        const entityTypes = ['member', 'trainer', 'class', 'membership', 'equipment', 'attendance'];
        for (const type of entityTypes) {
            const key = `${tenantId}_${type}`;
            const lastSeq = this.lastSequence.get(key) || 0;
            if (lastSeq > 0) {
                // Mark queries as stale to trigger background refetch
                queryClient.invalidateQueries({
                    queryKey: [type + 's'], // members, trainers, etc.
                    refetchType: 'active',
                });
            }
        }
    }

    /**
     * Start polling fallback when WebSocket is unavailable
     */
    private startPollingFallback(): void {
        if (this.pollingInterval || this.isOffline) {
            return;
        }

        console.log('[DeltaSync] Starting polling fallback');

        // Poll every 30 seconds
        this.pollingInterval = setInterval(() => {
            if (!this.isOffline) {
                this.pollForUpdates();
            }
        }, 30000);

        // Immediate first poll
        this.pollForUpdates();
    }

    /**
     * Stop polling fallback
     */
    private stopPollingFallback(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('[DeltaSync] Stopped polling fallback');
        }
    }

    /**
     * Poll for updates (fallback when WebSocket unavailable)
     */
    private async pollForUpdates(): Promise<void> {
        try {
            // Invalidate active queries to trigger refetch
            // This is a simple fallback - full implementation would check for changes first
            await queryClient.invalidateQueries({
                refetchType: 'active',
            });
            console.log('[DeltaSync] Polling update completed');
        } catch (error) {
            console.error('[DeltaSync] Polling failed:', error);
        }
    }

    /**
     * Check if currently in offline mode
     */
    isOfflineMode(): boolean {
        return this.isOffline;
    }
}

// Singleton instance
export const deltaSyncService = new DeltaSyncService();

export default deltaSyncService;
