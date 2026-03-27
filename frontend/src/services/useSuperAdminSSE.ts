import { useEffect, useRef, useCallback, useState } from 'react';
import { superAdminApi } from './superAdminApi';

export interface SSEEvent {
  type: 'CRITICAL_ERROR' | 'NEW_GYM' | 'SECURITY_ALERT' | 'SYSTEM_WARNING' | 'FEEDBACK' | 'HEARTBEAT';
  data: Record<string, any>;
  timestamp: string;
}

export interface UseSuperAdminSSEOptions {
  enabled?: boolean;
  onError?: (event: SSEEvent) => void;
  onCriticalError?: (event: SSEEvent) => void;
  onNewGym?: (event: SSEEvent) => void;
  onSecurityAlert?: (event: SSEEvent) => void;
  onSystemWarning?: (event: SSEEvent) => void;
  onFeedback?: (event: SSEEvent) => void;
  heartbeatInterval?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const DEFAULT_RECONNECT_INTERVAL = 5000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_HEARTBEAT_INTERVAL = 30000;

export function useSuperAdminSSE(options: UseSuperAdminSSEOptions = {}) {
  const {
    enabled = true,
    onError,
    onCriticalError,
    onNewGym,
    onSecurityAlert,
    onSystemWarning,
    onFeedback,
    heartbeatInterval = DEFAULT_HEARTBEAT_INTERVAL,
    reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const token = superAdminApi.getToken();
    if (!token) {
      console.warn('SuperAdmin SSE: No token available');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/superadmin/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      startHeartbeat();
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        setLastEvent(data);
        handleEvent(data);
      } catch (err) {
        console.error('SuperAdmin SSE: Failed to parse event data', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      attemptReconnect();
    };

    eventSource.addEventListener('critical_error', (event) => {
      const data: SSEEvent = JSON.parse((event as MessageEvent).data);
      setLastEvent(data);
      onCriticalError?.(data);
    });

    eventSource.addEventListener('security_alert', (event) => {
      const data: SSEEvent = JSON.parse((event as MessageEvent).data);
      setLastEvent(data);
      onSecurityAlert?.(data);
    });

    eventSource.addEventListener('system_warning', (event) => {
      const data: SSEEvent = JSON.parse((event as MessageEvent).data);
      setLastEvent(data);
      onSystemWarning?.(data);
    });

    eventSource.addEventListener('new_gym', (event) => {
      const data: SSEEvent = JSON.parse((event as MessageEvent).data);
      setLastEvent(data);
      onNewGym?.(data);
    });

    eventSource.addEventListener('feedback', (event) => {
      const data: SSEEvent = JSON.parse((event as MessageEvent).data);
      setLastEvent(data);
      onFeedback?.(data);
    });

    eventSource.addEventListener('error', () => {
      // SSE error event doesn't have data payload - connection errors are handled by onerror
    });

    eventSource.addEventListener('heartbeat', () => {
      // Heartbeat received - connection is alive
    });
  }, [onError, onCriticalError, onNewGym, onSecurityAlert, onSystemWarning, onFeedback]);

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'CRITICAL_ERROR':
        onCriticalError?.(event);
        break;
      case 'SECURITY_ALERT':
        onSecurityAlert?.(event);
        break;
      case 'SYSTEM_WARNING':
        onSystemWarning?.(event);
        break;
      case 'NEW_GYM':
        onNewGym?.(event);
        break;
      case 'FEEDBACK':
        onFeedback?.(event);
        break;
      case 'HEARTBEAT':
        // No-op for heartbeat
        break;
    }
  }, [onCriticalError, onSecurityAlert, onSystemWarning, onNewGym, onFeedback]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    heartbeatTimeoutRef.current = setTimeout(() => {
      if (eventSourceRef.current?.readyState === EventSource.OPEN) {
        // Send heartbeat acknowledgment
        heartbeatTimeoutRef.current = setTimeout(startHeartbeat, heartbeatInterval);
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('SuperAdmin SSE: Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 30000);
    setReconnectAttempts((prev) => prev + 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    setIsConnected(false);
    setReconnectAttempts(0);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    reconnectAttempts,
    reconnect: connect,
    disconnect,
  };
}
