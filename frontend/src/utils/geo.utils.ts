export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR';

export interface GeoLocation {
  country: string;
  countryCode: string;
  currency: Currency;
  region: string;
}

const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  // India - Primary Market
  IN: 'INR',

  // United States
  US: 'USD',

  // United Kingdom
  GB: 'GBP',
  UK: 'GBP',

  // European Union
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  SE: 'EUR',
  DK: 'EUR',
  NO: 'EUR',
  CH: 'EUR',
  PL: 'EUR',
  CZ: 'EUR',
  HU: 'EUR',
  RO: 'EUR',
  BG: 'EUR',
  HR: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  LT: 'EUR',
  LV: 'EUR',
  EE: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  CY: 'EUR',

  // Other Countries (Default to USD)
  CA: 'USD',
  AU: 'USD',
  NZ: 'USD',
  SG: 'USD',
  HK: 'USD',
  JP: 'USD',
  KR: 'USD',
  MX: 'USD',
  BR: 'USD',
  AR: 'USD',
  CL: 'USD',
  CO: 'USD',
  PE: 'USD',
  ZA: 'USD',
  AE: 'USD',
  SA: 'USD',
  QA: 'USD',
  KW: 'USD',
  BH: 'USD',
  OM: 'USD',
  JO: 'USD',
  LB: 'USD',
  EG: 'USD',
  NG: 'USD',
  KE: 'USD',
  TH: 'USD',
  MY: 'USD',
  ID: 'USD',
  PH: 'USD',
  VN: 'USD',
  PK: 'USD',
  BD: 'USD',
  LK: 'USD',
  NP: 'USD',
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
};

const LOCALLY_STORAGE_KEY = 'user_currency_preference';

let cachedGeoLocation: GeoLocation | null = null;

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency];
}

export function getCurrencyForCountry(countryCode: string): Currency {
  const normalizedCode = countryCode.toUpperCase();
  return COUNTRY_CURRENCY_MAP[normalizedCode] || 'USD';
}

export async function detectUserLocation(): Promise<GeoLocation> {
  if (cachedGeoLocation) {
    return cachedGeoLocation;
  }

  const savedPreference = localStorage.getItem(LOCALLY_STORAGE_KEY);
  if (savedPreference) {
    const currency = savedPreference as Currency;
    if (['INR', 'USD', 'GBP', 'EUR'].includes(currency)) {
      cachedGeoLocation = {
        country: 'Saved',
        countryCode: '',
        currency,
        region: 'user-preference',
      };
      return cachedGeoLocation;
    }
  }

  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('GeoIP API failed');
    }

    const data = await response.json();

    const currency = getCurrencyForCountry(data.country_code || data.countryCode || 'US');

    cachedGeoLocation = {
      country: data.country_name || data.country || 'Unknown',
      countryCode: data.country_code || data.countryCode || 'US',
      currency,
      region: data.region || data.continent || 'Unknown',
    };

    return cachedGeoLocation;
  } catch (error) {
    console.warn('Failed to detect location, defaulting to USD:', error);
    cachedGeoLocation = {
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
      region: 'North America',
    };
    return cachedGeoLocation;
  }
}

export function setUserCurrencyPreference(currency: Currency): void {
  localStorage.setItem(LOCALLY_STORAGE_KEY, currency);
  cachedGeoLocation = {
    country: 'Saved',
    countryCode: '',
    currency,
    region: 'user-preference',
  };
}

export function getUserCurrencyPreference(): Currency | null {
  const saved = localStorage.getItem(LOCALLY_STORAGE_KEY);
  if (saved && ['INR', 'USD', 'GBP', 'EUR'].includes(saved)) {
    return saved as Currency;
  }
  return null;
}

export function clearCachedLocation(): void {
  cachedGeoLocation = null;
}

export const REGION_FLAGS: Record<string, string> = {
  IN: '🇮🇳',
  US: '🇺🇸',
  GB: '🇬🇧',
  EUR: '🇪🇺',
  DEFAULT: '🌍',
};

export function getRegionFlag(countryCode: string): string {
  if (countryCode === 'IN') return REGION_FLAGS.IN;
  if (countryCode === 'US') return REGION_FLAGS.US;
  if (countryCode === 'GB') return REGION_FLAGS.GB;
  if (Object.values(REGION_FLAGS.EUR).includes(countryCode as any)) return REGION_FLAGS.EUR;
  return REGION_FLAGS.DEFAULT;
}

export interface ExchangeRates {
  INR: number;
  USD: number;
  GBP: number;
  EUR: number;
}

export const EXCHANGE_RATES: ExchangeRates = {
  INR: 1,
  USD: 83.5,
  GBP: 105.2,
  EUR: 91.8,
};

export function convertPrice(
  priceInINR: number,
  targetCurrency: Currency
): number {
  if (targetCurrency === 'INR') {
    return priceInINR;
  }
  return Math.round(priceInINR / EXCHANGE_RATES[targetCurrency]);
}

export function formatPrice(
  price: number,
  currency: Currency,
  showSymbol: boolean = true
): string {
  const symbol = showSymbol ? getCurrencySymbol(currency) : '';
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${symbol}${formatted}`;
}

export function formatPriceRange(
  minINR: number,
  maxINR: number,
  currency: Currency
): string {
  const min = convertPrice(minINR, currency);
  const max = convertPrice(maxINR, currency);
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
}