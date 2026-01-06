import React from 'react';
import { motion } from 'framer-motion';

interface UnifiedCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
    delay?: number;
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({ 
    children, 
    className = '', 
    onClick, 
    hover = true,
    delay = 0 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={hover ? { y: -4, backgroundColor: 'var(--bg-glass-hover)' } : {}}
            className={`glass-card ${className}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {children}
        </motion.div>
    );
};
