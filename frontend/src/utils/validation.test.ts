import { describe, it, expect } from 'vitest';
import {
    validateIndianPhone,
    validateIFSC,
    validateDOB,
    validateAccountNumber,
    formatCurrency,
    maskAccountNumber
} from './validation';

describe('validateIndianPhone', () => {
    it('accepts empty string (optional field)', () => {
        const result = validateIndianPhone('');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('');
    });

    it('validates 10-digit numbers starting with 6-9', () => {
        expect(validateIndianPhone('9876543210').valid).toBe(true);
        expect(validateIndianPhone('9876543210').normalized).toBe('+919876543210');
    });

    it('validates numbers with +91 prefix', () => {
        expect(validateIndianPhone('+919876543210').valid).toBe(true);
        expect(validateIndianPhone('+919876543210').normalized).toBe('+919876543210');
    });

    it('strips spaces and dashes', () => {
        const result = validateIndianPhone('98765-43210');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('+919876543210');
    });

    it('rejects short numbers', () => {
        const result = validateIndianPhone('98765');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('10-digit');
    });

    it('rejects numbers starting with 0-5', () => {
        const result = validateIndianPhone('5876543210');
        expect(result.valid).toBe(false);
    });
});

describe('validateIFSC', () => {
    it('accepts empty string (optional field)', () => {
        expect(validateIFSC('').valid).toBe(true);
    });

    it('validates correct IFSC format', () => {
        expect(validateIFSC('HDFC0001234').valid).toBe(true);
        expect(validateIFSC('SBIN0MAIN01').valid).toBe(true);
    });

    it('rejects IFSC without 0 in 5th position', () => {
        const result = validateIFSC('HDFC1001234');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('5th character');
    });

    it('rejects short IFSC', () => {
        const result = validateIFSC('HDFC000');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('11 characters');
    });

    it('rejects IFSC starting with numbers', () => {
        const result = validateIFSC('1234ABCDEFG');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('start with 4 letters');
    });
});

describe('validateDOB', () => {
    it('accepts empty string (optional field)', () => {
        expect(validateDOB('').valid).toBe(true);
    });

    it('validates age between 16 and 100', () => {
        // Person born 30 years ago
        const thirtyYearsAgo = new Date();
        thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
        const result = validateDOB(thirtyYearsAgo.toISOString().split('T')[0]);
        expect(result.valid).toBe(true);
        expect(result.age).toBe(30);
    });

    it('rejects age under 16', () => {
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        const result = validateDOB(tenYearsAgo.toISOString().split('T')[0]);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('16 years');
    });

    it('rejects invalid date strings', () => {
        const result = validateDOB('not-a-date');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid date');
    });
});

describe('validateAccountNumber', () => {
    it('accepts empty string (optional field)', () => {
        expect(validateAccountNumber('').valid).toBe(true);
    });

    it('validates 9-18 digit account numbers', () => {
        expect(validateAccountNumber('123456789').valid).toBe(true);
        expect(validateAccountNumber('123456789012345678').valid).toBe(true);
    });

    it('rejects too short account numbers', () => {
        const result = validateAccountNumber('12345678');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('9-18 digits');
    });

    it('rejects non-numeric characters', () => {
        const result = validateAccountNumber('12345ABCD');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('only digits');
    });
});

describe('formatCurrency', () => {
    it('formats with Indian rupee symbol and separators', () => {
        expect(formatCurrency(48500)).toBe('₹48,500');
        expect(formatCurrency(150000)).toBe('₹1,50,000');
    });

    it('handles zero', () => {
        expect(formatCurrency(0)).toBe('₹0');
    });

    it('handles NaN', () => {
        expect(formatCurrency(NaN)).toBe('₹0');
    });
});

describe('maskAccountNumber', () => {
    it('shows only last 4 digits', () => {
        expect(maskAccountNumber('1234567890123456')).toBe('••••••••••••3456');
    });

    it('handles short account numbers', () => {
        expect(maskAccountNumber('123')).toBe('123');
    });

    it('handles empty string', () => {
        expect(maskAccountNumber('')).toBe('');
    });
});
