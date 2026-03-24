import { useContext } from 'react';
import FeatureContext from '../contexts/FeatureContext';

/**
 * Returns whether a given feature flag is enabled.
 * Falls back to `false` if the flag is not found or context is unavailable.
 */
export const useFeature = (featureKey: string): boolean => {
  const { features } = useContext(FeatureContext);
  return features[featureKey] ?? false;
};
