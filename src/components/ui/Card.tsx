import React from 'react';
import './Card.css';

interface CardProps {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    action,
    children,
    className = '',
    noPadding = false,
}) => {
    return (
        <div className={`card ${className}`}>
            {(title || action) && (
                <div className="card__header">
                    <div className="card__header-text">
                        {title && <h3 className="card__title">{title}</h3>}
                        {subtitle && <p className="card__subtitle">{subtitle}</p>}
                    </div>
                    {action && <div className="card__action">{action}</div>}
                </div>
            )}
            <div className={`card__body ${noPadding ? 'card__body--no-padding' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;
