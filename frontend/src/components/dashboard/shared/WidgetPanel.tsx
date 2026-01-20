import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface WidgetPanelProps {
    title: string;
    icon: LucideIcon;
    onAction?: () => void;
    actionLabel?: string;
    className?: string;
    children: React.ReactNode;
    variants?: any;
}

const WidgetPanel: React.FC<WidgetPanelProps> = ({
    title,
    icon: Icon,
    onAction,
    actionLabel = "View All",
    className = "",
    children,
    variants
}) => {
    return (
        <motion.div
            className={`dash-section ${className}`}
            variants={variants}
            initial="hidden"
            animate="visible"
        >
            <div className="dash-section__header">
                <div className="dash-section__title">
                    <Icon size={18} />
                    <h2>{title}</h2>
                </div>
                {onAction && (
                    <button className="dash-section__link" onClick={onAction}>
                        {actionLabel} <ArrowRight size={14} />
                    </button>
                )}
            </div>
            <div className="dash-section__content">
                {children}
            </div>
        </motion.div>
    );
};

export default WidgetPanel;
