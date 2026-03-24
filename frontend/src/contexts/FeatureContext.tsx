import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import type { FeatureFlag } from '../types/feature.types';

interface FeatureContextType {
  features: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  refetchFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType>({
  features: {},
  isLoading: true,
  error: null,
  refetchFeatures: async () => {},
});

const CACHE_KEY = 'features';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchFeatures = useCallback(async () => {
    try {
      const response = await apiClient.get<FeatureFlag[]>('/features/all');
      const featureMap = response.data.reduce<Record<string, boolean>>((acc, flag) => {
        acc[flag.featureKey] = flag.enabled;
        return acc;
      }, {});
      setFeatures(featureMap);
      setError(null);
      localStorage.setItem(CACHE_KEY, JSON.stringify(featureMap));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch features';
      setError(message);
      console.warn('Feature flags fetch failed, using cached values:', message);
      // On failure, restore from cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) setFeatures(JSON.parse(cached));
      } catch {
        // ignore cache parse errors
      }
    }
  }, []);

  useEffect(() => {
    refetchFeatures().finally(() => setIsLoading(false));
    const interval = setInterval(refetchFeatures, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetchFeatures]);

  return (
    <FeatureContext.Provider value={{ features, isLoading, error, refetchFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatureContext = () => useContext(FeatureContext);

export default FeatureContext;
