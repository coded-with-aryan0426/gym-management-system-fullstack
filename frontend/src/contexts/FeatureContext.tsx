import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import type { FeatureFlag } from '../types/feature.types';

interface FeatureContextType {
  features: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  refetchFeatures: () => Promise<void>;
  // Local feature toggles (stored in localStorage)
  localFeatures: Record<string, boolean>;
  toggleLocalFeature: (key: string) => void;
  isChatEnabled: () => boolean;
}

const FeatureContext = createContext<FeatureContextType>({
  features: {},
  isLoading: true,
  error: null,
  refetchFeatures: async () => {},
  localFeatures: {},
  toggleLocalFeature: () => {},
  isChatEnabled: () => true,
});

const CACHE_KEY = 'features';
const LOCAL_FEATURES_KEY = 'local-features';
const CHAT_FEATURE_KEY = 'chat-enabled';
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

  // Initialize local features from localStorage
  const [localFeatures, setLocalFeatures] = useState<Record<string, boolean>>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_FEATURES_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      // Default: chat enabled
      return { [CHAT_FEATURE_KEY]: true };
    } catch {
      return { [CHAT_FEATURE_KEY]: true };
    }
  });

  const toggleLocalFeature = useCallback((key: string) => {
    setLocalFeatures(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(LOCAL_FEATURES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isChatEnabled = useCallback(() => {
    return localFeatures[CHAT_FEATURE_KEY] !== false;
  }, [localFeatures]);

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
    <FeatureContext.Provider value={{ features, isLoading, error, refetchFeatures, localFeatures, toggleLocalFeature, isChatEnabled }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatureContext = () => useContext(FeatureContext);

export default FeatureContext;
