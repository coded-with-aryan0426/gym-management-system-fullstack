/**
 * useDeltaSync Hook - Stage 3 & 4: Real-Time Sync Layer + Offline Recovery
 * Stage 6: Feature flag integration for gradual rollout
 *
 * React hook for connecting to and using the delta sync service.
 * Automatically connects on mount and disconnects on unmount.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureContext } from '../contexts/FeatureContext';
import { deltaSyncService, DeltaEvent } from '../services/deltaSyncService';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'offline';

// Feature flag key for delta sync
const DELTA_SYNC_FEATURE = 'delta-sync-enabled';

interface UseDeltaSyncOptions {
    /** Whether to auto-connect on mount (default: true) */
    autoConnect?: boolean;
    /** Entity types to listen for (default: all) */
    entityTypes?: string[];
    /** Callback when a delta event is received */
    onDelta?: (event: DeltaEvent) => void;
    /** Callback when connection status changes */
    onStatusChange?: (status: ConnectionStatus) => void;
    /** Force enable regardless of feature flag (for testing) */
    forceEnable?: boolean;
}

interface UseDeltaSyncReturn {
    /** Whether currently connected to WebSocket */
    isConnected: boolean;
    /** Current connection status */
    connectionStatus: ConnectionStatus;
    /** Whether in offline mode */
    isOffline: boolean;
    /** Whether delta sync is enabled by feature flag */
    isEnabled: boolean;
    /** Manually connect to delta sync */
    connect: () => void;
    /** Manually disconnect from delta sync */
    disconnect: () => void;
    /** Register a handler for specific entity type */
    onEntityDelta: (entityType: string, handler: (event: DeltaEvent) => void) => () => void;
}

/**
 * Hook for real-time delta synchronization
 */
export function useDeltaSync(options: UseDeltaSyncOptions = {}): UseDeltaSyncReturn {
    const { autoConnect = true, entityTypes, onDelta, onStatusChange, forceEnable = false } = options;
    const { user, token } = useAuth();
    const { features, localFeatures } = useFeatureContext();
    const unsubscribesRef = useRef<(() => void)[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
        deltaSyncService.getConnectionStatus()
    );

    // Check if delta sync is enabled via feature flags
    const isEnabled = forceEnable || 
        features[DELTA_SYNC_FEATURE] === true || 
        localFeatures[DELTA_SYNC_FEATURE] === true;

    // Connect to delta sync
    const connect = useCallback(() => {
        if (!token || !user?.gymId) {
            console.warn('[useDeltaSync] Cannot connect: missing token or gymId');
            return;
        }

        deltaSyncService.connect(token, user.gymId);
    }, [token, user?.gymId]);

    // Disconnect from delta sync
    const disconnect = useCallback(() => {
        deltaSyncService.disconnect();
    }, []);

    // Register handler for specific entity type
    const onEntityDelta = useCallback((entityType: string, handler: (event: DeltaEvent) => void) => {
        return deltaSyncService.onDelta(entityType, handler);
    }, []);

    // Subscribe to connection status changes
    useEffect(() => {
        const unsub = deltaSyncService.onStatusChange((status) => {
            setConnectionStatus(status);
            onStatusChange?.(status);
        });
        return unsub;
    }, [onStatusChange]);

    // Auto-connect on mount (only if feature is enabled)
    useEffect(() => {
        if (!isEnabled) {
            console.log('[useDeltaSync] Delta sync disabled by feature flag');
            return;
        }

        if (autoConnect && token && user?.gymId) {
            connect();
        }

        return () => {
            // Clean up subscriptions on unmount
            unsubscribesRef.current.forEach(unsub => unsub());
            unsubscribesRef.current = [];
        };
    }, [autoConnect, token, user?.gymId, connect, isEnabled]);

    // Register global delta handler if provided (only if enabled)
    useEffect(() => {
        if (!onDelta || !isEnabled) return;

        const types = entityTypes || ['member', 'trainer', 'class', 'membership', 'equipment', 'attendance'];
        const unsubscribes: (() => void)[] = [];

        for (const type of types) {
            const unsub = deltaSyncService.onDelta(type, onDelta);
            unsubscribes.push(unsub);
        }

        unsubscribesRef.current = unsubscribes;

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [entityTypes, onDelta, isEnabled]);

    return {
        isConnected: isEnabled && connectionStatus === 'connected',
        connectionStatus,
        isOffline: connectionStatus === 'offline',
        isEnabled,
        connect,
        disconnect,
        onEntityDelta,
    };
}

/**
 * Hook for subscribing to a specific entity type's deltas
 */
export function useEntityDelta(
    entityType: string,
    handler: (event: DeltaEvent) => void
): void {
    useEffect(() => {
        const unsubscribe = deltaSyncService.onDelta(entityType, handler);
        return unsubscribe;
    }, [entityType, handler]);
}

/**
 * Hook for monitoring connection status only
 */
export function useConnectionStatus(): ConnectionStatus {
    const [status, setStatus] = useState<ConnectionStatus>(
        deltaSyncService.getConnectionStatus()
    );

    useEffect(() => {
        return deltaSyncService.onStatusChange(setStatus);
    }, []);

    return status;
}

export default useDeltaSync;
