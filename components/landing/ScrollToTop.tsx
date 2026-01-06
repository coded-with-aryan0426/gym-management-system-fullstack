"use client";

import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: 1000,
                    }}
                >
                    <IconButton
                        onClick={scrollToTop}
                        sx={{
                            width: 52,
                            height: 52,
                            background: 'var(--gradient-cta)',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(230, 57, 70, 0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(230, 57, 70, 0.5)',
                            },
                            '&:active': {
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        <ArrowUp size={24} />
                    </IconButton>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
