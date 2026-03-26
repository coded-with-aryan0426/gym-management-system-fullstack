import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import './ToggleSwitch.css';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = 'md',
  label,
  className = ''
}) => {
  const handleToggle = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  const sizeClass = `toggle-switch--${size}`;
  const stateClass = checked ? 'toggle-switch--on' : 'toggle-switch--off';

  return (
    <div className={`toggle-switch-wrapper ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled || loading}
        className={`toggle-switch ${sizeClass} ${stateClass} ${disabled ? 'toggle-switch--disabled' : ''}`}
        onClick={handleToggle}
      >
        <motion.div
          className="toggle-switch__track"
          animate={{
            backgroundColor: checked ? 'var(--toggle-on, #10B981)' : 'var(--toggle-off, #374151)'
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="toggle-switch__thumb"
            animate={{
              x: checked ? (size === 'sm' ? 14 : size === 'lg' ? 26 : 18) : 2,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}
          >
            {loading && (
              <Loader2 size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} className="toggle-switch__spinner" />
            )}
          </motion.div>
        </motion.div>
      </button>
      {label && <span className="toggle-switch__label">{label}</span>}
    </div>
  );
};

export default ToggleSwitch;
