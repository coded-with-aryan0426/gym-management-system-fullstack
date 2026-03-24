import { useState, useEffect } from 'react';
import {
  detectUserLocation,
  getUserCurrencyPreference,
  setUserCurrencyPreference,
  type Currency,
  type GeoLocation,
} from '../utils/geo.utils';

interface UseGeoLocationResult {
  location: GeoLocation | null;
  currency: Currency;
  isLoading: boolean;
  setCurrency: (currency: Currency) => void;
}

export function useGeoLocation(): UseGeoLocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = getUserCurrencyPreference();
    return saved || 'INR';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const detected = await detectUserLocation();
        setLocation(detected);

        const saved = getUserCurrencyPreference();
        if (!saved) {
          setCurrencyState(detected.currency);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setUserCurrencyPreference(newCurrency);
    setCurrencyState(newCurrency);
  };

  return {
    location,
    currency,
    isLoading,
    setCurrency,
  };
}

export default useGeoLocation;