import React from 'react';
import './SharedComponents.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
    return (
        <div className="page-header">
            <div className="page-header__content">
                <h1 className="page-header__title">{title}</h1>
                {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
            </div>
            {actions && (
                <div className="page-header__actions">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
