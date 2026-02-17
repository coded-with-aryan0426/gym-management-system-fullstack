// Real-Time Data Hook for Enhanced User Action Modals

import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedApi } from '../services/enhancedApi';
import type { User } from '../types/user';
import type { RealTimeUserData, Relationship } from '../types/modalEnhancement';

interface UseRealTimeDataOptions {
  userId: number;
  enabled?: boolean;
  onUserUpdate?: (user: User) => void;
  onRelationshipUpdate?: (relationships: Relationship[]) => void;
  onError?: (error: Error) => void;
}

interface UseRealTimeDataReturn {
  userData: RealTimeUserData | null;
  isLoading: boolean;
  isConnected: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRealTimeData({
  userId,
  enabled = true,
  onUserUpdate,
  onRelationshipUpdate,
  onError
}: UseRealTimeDataOptions): UseRealTimeDataReturn {
  const [userData, setUserData] = useState<RealTimeUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([]);

  const refetch = useCallback(async () => {
    if (!enabled || !userId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await enhancedApi.getRealTimeUserData(userId);
      setUserData(data);
      setIsConnected(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user data');
      setError(error);
      setIsConnected(false);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, enabled, onError]);

  useEffect(() => {
    if (!enabled || !userId) {
      setIsLoading(false);
      return;
    }

    // Initial data fetch
    refetch();

    // Set up polling for "real-time" updates (every 30 seconds)
    const pollInterval = setInterval(() => {
      refetch();
    }, 30000);

    subscriptionsRef.current = [{ unsubscribe: () => clearInterval(pollInterval) }];

    // Since we're using polling instead of WebSocket, we'll consider it "connected" if we can fetch data
    // Connection status is already set in the refetch function

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [userId, enabled, refetch, onUserUpdate, onRelationshipUpdate]);

  return {
    userData,
    isLoading,
    isConnected,
    error,
    refetch
  };
}