import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface BirthDatePickerProps {
  value: string;
  onChange: (date: string, age: number | null) => void;
  onBlur?: () => void;
  error?: string;
  warning?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  minAge?: number;
  maxAge?: number;
  userType?: 'MEMBER' | 'TRAINER' | 'STAFF';
}

export const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  value,
  onChange,
  onBlur,
  error,
  warning,
  disabled = false,
  label = 'Date of Birth',
  required = false,
  minAge = 10,
  maxAge = 100,
  userType = 'MEMBER'
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const calculateAge = useCallback((dob: string): number | null => {
    if (!dob) return null;

    const birth = new Date(dob);
    const today = new Date();

    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }, []);

  useEffect(() => {
    if (!value) {
      setCalculatedAge(null);
      setLocalError(null);
      return;
    }

    const age = calculateAge(value);

    if (age === null) {
      setLocalError('Invalid date');
      setCalculatedAge(null);
      return;
    }

    setCalculatedAge(age);

    // User type specific validation
    if (userType === 'TRAINER' && age < 18) {
      setLocalError('Trainers must be at least 18 years old');
    } else if (userType === 'MEMBER' && age < 16) {
      setLocalError('Minimum age of 16 years required for membership');
    } else if (age < minAge) {
      setLocalError(`Minimum age of ${minAge} years required`);
    } else if (age > maxAge) {
      setLocalError(`Age must be less than ${maxAge} years`);
    } else {
      setLocalError(null);
    }
  }, [value, minAge, maxAge, userType, calculateAge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const age = calculateAge(newDate);
    onChange(newDate, age);
  };

  const getMaxDate = (): string => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - minAge);
    return today.toISOString().split('T')[0];
  };

  const getMinDate = (): string => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - maxAge);
    return today.toISOString().split('T')[0];
  };

  const displayError = error || localError;

  return (
    <div className="birth-date-picker">
      {label && (
        <label className="birth-date-picker__label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="birth-date-picker__input-wrapper">
        <Calendar size={16} className="birth-date-picker__icon" />
        <input
          type="date"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          max={getMaxDate()}
          min={getMinDate()}
          className={`birth-date-picker__input ${displayError ? 'error' : ''} ${warning ? 'warning' : ''}`}
        />
      </div>

      {calculatedAge !== null && !displayError && (
        <div className="birth-date-picker__age-display">
          <span className="age-label">Age:</span>
          <span className="age-value">{calculatedAge} years</span>
          {calculatedAge < 18 && userType === 'MEMBER' && (
            <span className="age-warning">Parental consent required</span>
          )}
        </div>
      )}

      {displayError && (
        <div className="birth-date-picker__error">
          <AlertCircle size={12} />
          {displayError}
        </div>
      )}

      {warning && !displayError && (
        <div className="birth-date-picker__warning">
          <AlertCircle size={12} />
          {warning}
        </div>
      )}
    </div>
  );
};
