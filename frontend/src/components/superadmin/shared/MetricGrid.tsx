import React from 'react';
import './MetricGrid.css';

export interface MetricGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
    minCardWidth?: string;
    className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
    children,
    columns = 3,
    gap = 'md',
    minCardWidth = '240px',
    className = ''
}) => {
    const gapMap = {
        sm: 'var(--s-3)',
        md: 'var(--s-4)',
        lg: 'var(--s-6)'
    };

    return (
        <div
            className={`metric-grid metric-grid--${columns}-col metric-grid--gap-${gap} ${className}`}
            style={{
                gap: gapMap[gap],
                gridTemplateColumns: `repeat(auto-fit, minmax(min(${minCardWidth}, 100%), 1fr))`
            }}
        >
            {children}
        </div>
    );
};

export default MetricGrid;
