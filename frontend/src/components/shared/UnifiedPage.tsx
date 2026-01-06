import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/unified-design-system.css';

interface UnifiedPageProps {
    children: React.ReactNode;
    className?: string;
}

export const UnifiedPage: React.FC<UnifiedPageProps> = ({ children, className = '' }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`unified-page ${className}`}
        >
            {children}
        </motion.div>
    );
};
