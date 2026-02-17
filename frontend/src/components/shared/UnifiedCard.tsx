import React from 'react';
import { motion } from 'framer-motion';

interface UnifiedCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
    delay?: number;
    style?: React.CSSProperties;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
    children,
    className = '',
    onClick,
    hover = true,
    delay = 0,
    style
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={hover ? { y: -4, backgroundColor: 'var(--bg-glass-hover)' } : {}}
            className={`glass-card ${className}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
        >
            {children}
        </motion.div>
    );
};
