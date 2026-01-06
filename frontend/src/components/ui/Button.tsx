import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    children,
    disabled,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`btn btn--${variant} btn--${size} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn__spinner" />
            ) : icon ? (
                <span className="btn__icon">{icon}</span>
            ) : null}
            <span className="btn__text">{children}</span>
        </button>
    );
};

export default Button;
