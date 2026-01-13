/**
 * Validation utilities for Trainer Profile forms
 * Includes phone, IFSC, DOB validation and formatting helpers
 */

// Indian phone validation - accepts 10 digits or +91 prefix
export interface PhoneValidationResult {
    valid: boolean;
    normalized: string;
    error?: string;
}

export function validateIndianPhone(phone: string): PhoneValidationResult {
    if (!phone || phone.trim() === '') {
        return { valid: true, normalized: '' }; // Empty is valid (optional field)
    }

    // Remove spaces, dashes, parentheses
    const cleaned = phone.replace(/[\s\-()]/g, '');

    // Pattern: optional +91, then 10 digits starting with 6-9
    const fullPattern = /^\+91[6-9]\d{9}$/;
    const shortPattern = /^[6-9]\d{9}$/;

    if (fullPattern.test(cleaned)) {
        return { valid: true, normalized: cleaned };
    }

    if (shortPattern.test(cleaned)) {
        return { valid: true, normalized: `+91${cleaned}` };
    }

    // Check if it looks like a phone but invalid
    if (/^\+?91/.test(cleaned) && cleaned.length !== 13) {
        return {
            valid: false,
            normalized: cleaned,
            error: 'Enter 10 digits after +91'
        };
    }

    if (/^\d+$/.test(cleaned) && cleaned.length !== 10) {
        return {
            valid: false,
            normalized: cleaned,
            error: 'Enter a 10-digit Indian mobile number'
        };
    }

    return {
        valid: false,
        normalized: cleaned,
        error: 'Enter a valid Indian mobile number (10 digits or +91 prefix)'
    };
}

// IFSC validation - 4 letters + 0 + 6 alphanumeric
export interface IFSCValidationResult {
    valid: boolean;
    error?: string;
}

export function validateIFSC(ifsc: string): IFSCValidationResult {
    if (!ifsc || ifsc.trim() === '') {
        return { valid: true }; // Empty is valid (optional field)
    }

    const cleaned = ifsc.trim().toUpperCase();

    // IFSC format: 4 letters + 0 + 6 alphanumeric
    const pattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!pattern.test(cleaned)) {
        if (cleaned.length !== 11) {
            return { valid: false, error: 'IFSC must be 11 characters' };
        }
        if (!/^[A-Z]{4}/.test(cleaned)) {
            return { valid: false, error: 'IFSC must start with 4 letters' };
        }
        if (cleaned[4] !== '0') {
            return { valid: false, error: 'IFSC 5th character must be 0' };
        }
        return { valid: false, error: 'Invalid IFSC format' };
    }

    return { valid: true };
}

// DOB validation - age between 16 and 100
export interface DOBValidationResult {
    valid: boolean;
    age: number;
    error?: string;
}

export function validateDOB(dob: string): DOBValidationResult {
    if (!dob || dob.trim() === '') {
        return { valid: true, age: 0 }; // Empty is valid (optional field)
    }

    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
        return { valid: false, age: 0, error: 'Invalid date format' };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 16) {
        return { valid: false, age, error: 'Must be at least 16 years old' };
    }

    if (age > 100) {
        return { valid: false, age, error: 'Please enter a valid date of birth' };
    }

    return { valid: true, age };
}

// Format currency with Indian locale (₹)
export function formatCurrency(amount: number): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Mask account number showing only last 4 digits
export function maskAccountNumber(accountNo: string): string {
    if (!accountNo || accountNo.length < 4) {
        return accountNo || '';
    }

    const lastFour = accountNo.slice(-4);
    const masked = '•'.repeat(accountNo.length - 4);
    return masked + lastFour;
}

// Account number validation - 9 to 18 digits
export interface AccountValidationResult {
    valid: boolean;
    error?: string;
}

export function validateAccountNumber(accountNo: string): AccountValidationResult {
    if (!accountNo || accountNo.trim() === '') {
        return { valid: true }; // Empty is valid (optional field)
    }

    const cleaned = accountNo.replace(/\s/g, '');

    if (!/^\d+$/.test(cleaned)) {
        return { valid: false, error: 'Account number must contain only digits' };
    }

    if (cleaned.length < 9 || cleaned.length > 18) {
        return { valid: false, error: 'Account number must be 9-18 digits' };
    }

    return { valid: true };
}

// Gender options
export const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
    { value: 'Other', label: 'Other' }
] as const;

// Blood type options
export const BLOOD_TYPE_OPTIONS = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
] as const;

// Common Indian languages for multi-select
export const LANGUAGE_OPTIONS = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
    'Gujarati', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese',
    'Maithili', 'Santali', 'Kashmiri', 'Nepali', 'Sindhi', 'Konkani',
    'Dogri', 'Manipuri', 'Bodo', 'Sanskrit', 'Bhojpuri', 'Rajasthani',
    'Chhattisgarhi', 'Magahi', 'Haryanvi', 'Marwari', 'Tulu', 'Kodava',
    'Mizo', 'Khasi', 'Garo', 'Nagamese', 'Kokborok', 'Lepcha', 'Limbu',
    'French', 'Spanish', 'German', 'Portuguese', 'Arabic', 'Mandarin',
    'Japanese', 'Korean', 'Russian', 'Italian', 'Dutch', 'Swedish'
] as const;
