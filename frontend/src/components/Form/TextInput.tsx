import React, { useState, useEffect } from 'react';
import './Form.css';

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  error?: string;
  required?: boolean;
  validatePhone?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

// Indian phone number regex: +91 followed by 10 digits, or just 10 digits starting with 6-9
const PHONE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error: externalError,
  required,
  validatePhone = false,
  onValidationChange,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (validatePhone && type === 'tel' && touched && value) {
      const isValid = PHONE_REGEX.test(value.replace(/\s/g, ''));
      if (!isValid) {
        setInternalError('Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)');
      } else {
        setInternalError(null);
      }
      onValidationChange?.(isValid);
    } else if (!value && touched && required) {
      setInternalError(`${label} is required`);
      onValidationChange?.(false);
    } else {
      setInternalError(null);
      onValidationChange?.(true);
    }
  }, [value, validatePhone, type, touched, required, label, onValidationChange]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const displayError = externalError || internalError;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={name}>
        {label} {required && <span className="form-field__required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-field__input ${displayError ? 'form-field__input--error' : ''}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || (type === 'tel' && validatePhone ? 'e.g., +91 9876543210' : undefined)}
      />
      {displayError && <span className="form-field__error">{displayError}</span>}
    </div>
  );
};

export default TextInput;
