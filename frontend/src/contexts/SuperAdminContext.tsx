import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSuperAdminSSE, type SSEEvent } from '../services/useSuperAdminSSE';
import { superAdminApi } from '../services/superAdminApi';
import { showToast } from '../utils/showToast';
import type { ReactNode } from 'react';

interface SuperAdminAlertBadge {
  criticalErrors: number;
  securityAlerts: number;
  newGyms: number;
}

interface SuperAdminContextValue {
  isSuperAdmin: boolean;
  isConnected: boolean;
  alerts: SuperAdminAlertBadge;
  lastEvent: SSEEvent | null;
  refreshAlerts: () => void;
  clearAlerts: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextValue | null>(null);

export function useSuperAdminContext() {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdminContext must be used within SuperAdminProvider');
  }
  return context;
}

export interface SuperAdminProviderProps {
  children: ReactNode;
}

export function SuperAdminProvider({ children }: SuperAdminProviderProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [alerts, setAlerts] = useState<SuperAdminAlertBadge>({
    criticalErrors: 0,
    securityAlerts: 0,
    newGyms: 0
  });
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  useEffect(() => {
    setIsSuperAdmin(superAdminApi.isAuthenticated());
  }, []);

  const handleCriticalError = useCallback((event: SSEEvent) => {
    setAlerts(prev => ({ ...prev, criticalErrors: prev.criticalErrors + 1 }));
    showToast(
      `Critical Error: ${event.data?.message || 'System error detected'}`,
      'error',
      { duration: 8000 }
    );
  }, []);

  const handleSecurityAlert = useCallback((event: SSEEvent) => {
    setAlerts(prev => ({ ...prev, securityAlerts: prev.securityAlerts + 1 }));
    showToast(
      `Security Alert: ${event.data?.description || 'Security event detected'}`,
      'error',
      { duration: 8000 }
    );
  }, []);

  const handleNewGym = useCallback((event: SSEEvent) => {
    setAlerts(prev => ({ ...prev, newGyms: prev.newGyms + 1 }));
    showToast(
      `New Gym Registration: ${event.data?.name || 'Unknown'}`,
      'info',
      { duration: 5000 }
    );
  }, []);

  const handleSystemWarning = useCallback((event: SSEEvent) => {
    showToast(
      `System Warning: ${event.data?.message || 'Warning detected'}`,
      'error',
      { duration: 6000 }
    );
  }, []);

  const { isConnected, reconnect } = useSuperAdminSSE({
    enabled: isSuperAdmin,
    onCriticalError: handleCriticalError,
    onSecurityAlert: handleSecurityAlert,
    onNewGym: handleNewGym,
    onSystemWarning: handleSystemWarning,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5
  });

  const refreshAlerts = useCallback(() => {
    setAlerts({
      criticalErrors: 0,
      securityAlerts: 0,
      newGyms: 0
    });
  }, []);

  const clearAlerts = useCallback(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  const value: SuperAdminContextValue = {
    isSuperAdmin,
    isConnected,
    alerts,
    lastEvent,
    refreshAlerts,
    clearAlerts
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export default SuperAdminProvider;
