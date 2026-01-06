import React from 'react';
import './SharedComponents.css';

interface ContentCardProps {
    title?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children: React.ReactNode;
    padded?: boolean; // If true, adds padding to body. If false, body flush (good for tables)
    className?: string; // Allow extending classes
}

const ContentCard: React.FC<ContentCardProps> = ({
    title,
    action,
    children,
    padded = true,
    className = ''
}) => {
    return (
        <div className={`content-card ${className}`}>
            {title && (
                <div className="content-card__header">
                    <h3 className="content-card__title">{title}</h3>
                    {action && (
                        <button
                            className="content-card__action"
                            onClick={action.onClick}
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            )}
            <div className={`content-card__body ${padded ? 'content-card__body--padded' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default ContentCard;
