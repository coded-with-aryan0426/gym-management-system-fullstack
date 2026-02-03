import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (otp: string) => void;
    disabled?: boolean;
}

const getColors = (isDark: boolean) => ({
    bgSecondary: isDark ? "#1A1A1A" : "#FFFFFF",
    borderPrimary: isDark ? "#1F2937" : "#E2E8F0",
    textPrimary: isDark ? "#F9FAFB" : "#0F172A",
    emerald: "#10B981",
    crimson: "#DC2626",
});

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, disabled = false }) => {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const colors = getColors(isDark);

    // Focus on first input only if value is empty when component mounts
    useEffect(() => {
        if (value === '' && !disabled && inputs.current[0]) {
            inputs.current[0].focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = value.split('');
        newOtp[index] = val.substring(val.length - 1);
        const combinedOtp = newOtp.join('');

        onChange(combinedOtp);

        // Focus next input
        if (val && index < length - 1 && inputs.current[index + 1]) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !value[index] && index > 0 && inputs.current[index - 1]) {
            // Move back if empty and backspace pressed
            inputs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputs.current[index - 1]?.focus();
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputs.current[index + 1]?.focus();
            e.preventDefault();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
        if (!/^\d+$/.test(pastedData)) return; // Only numbers

        onChange(pastedData);

        // Focus the last filled input
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputs.current[focusIndex]?.focus();
    };

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { if (el) inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    style={{
                        width: '52px',
                        height: '60px',
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${value[i] ? colors.crimson : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '12px',
                        color: colors.textPrimary,
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = colors.crimson;
                        e.target.style.boxShadow = `0 0 0 3px rgba(220, 38, 38, 0.12)`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = value[i] ? colors.crimson : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
                        e.target.style.boxShadow = 'none';
                    }}
                />
            ))}
        </div>
    );
};

export default OtpInput;
