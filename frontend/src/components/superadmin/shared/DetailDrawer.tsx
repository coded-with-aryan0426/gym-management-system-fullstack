import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './DetailDrawer.css';

export interface DetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    width?: string;
    footer?: React.ReactNode;
    className?: string;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    width = '480px',
    footer,
    className = ''
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="detail-drawer__backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Drawer */}
                    <motion.div
                        className={`detail-drawer ${className}`}
                        style={{ width }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="detail-drawer__header">
                            <div className="detail-drawer__header-content">
                                <h2 className="detail-drawer__title">{title}</h2>
                                {subtitle && (
                                    <p className="detail-drawer__subtitle">{subtitle}</p>
                                )}
                            </div>
                            <button
                                className="detail-drawer__close"
                                onClick={onClose}
                                type="button"
                                aria-label="Close drawer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="detail-drawer__content">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="detail-drawer__footer">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DetailDrawer;
