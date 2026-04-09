import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoProps {
    size?: number;
    showText?: boolean;
    className?: string;
}

export const Logo = ({ size = 32, showText = true, className = "" }: LogoProps) => {
    const { resolvedTheme } = useTheme();
    const logoSrc = showText ? '/images/logo.png' : '/images/Top logo.png';

    return (
        <Box 
            className={`logo-container ${className}`}
            sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: size,
                maxWidth: '100%',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
            }}
        >
            <img 
                src={logoSrc} 
                alt={showText ? "AthlonX Logo" : "AthlonX Icon"} 
                style={{ 
                    height: '100%',
                    width: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    transition: 'all 0.3s ease'
                }} 
            />
        </Box>
    );
};

