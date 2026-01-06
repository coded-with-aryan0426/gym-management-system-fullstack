import React from 'react';
import './Form.css';

interface ToggleProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, name, checked, onChange }) => {
  return (
    <div className="form-toggle">
      <label className="form-toggle__label">
        <span className="form-toggle__switch">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="form-toggle__slider"></span>
        </span>
        {label}
      </label>
    </div>
  );
};

export default Toggle;
