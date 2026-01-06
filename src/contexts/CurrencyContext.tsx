import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>(() => {
        return (localStorage.getItem('currency') as Currency) || 'INR';
    });

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const formatPrice = (amount: number) => {
        // Simple conversion simulation (optional, or just 1:1)
        // For now, we assume 1:1 value but different symbol, or we can add rates.
        // User asked "change the whole currency shown", implies display format.

        // Rates relative to INR (Approx)
        const rates: Record<Currency, number> = {
            INR: 1,
            USD: 0.012,
            EUR: 0.011
        };

        const convertedAmount = amount * (currency === 'INR' ? 1 : rates[currency]);

        // Format
        return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(currency === 'INR' ? amount : convertedAmount * 83);
        // Wait, if I convert amount * rate, I get USD.
        // If I have hardcoded 2999 INR, in USD it is ~36.
        // Logic: Input 'amount' is always in BASE CURRENCY (INR)?
        // Yes, usually DB stores in base.
        // So formatPrice takes INR and converts.

        // If I pass 2999 (INR):
        // INR -> 2999
        // USD -> 2999 * 0.012 = 36
        // EUR -> 2999 * 0.011 = 33
        // This is better.

        // However, if I pass 0, it behaves correctly.

        const rate = currency === 'INR' ? 1 : (currency === 'USD' ? 0.012 : 0.011);
        const value = amount * rate;

        return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
    return context;
};
