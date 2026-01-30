import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
    size?: number;
    color?: string;
    showText?: boolean;
}

export const Logo = ({ size = 32, color = "#E63946", showText = true }: LogoProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
        {/* SVG Icon */}
        <Box
            sx={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Dynamic A Shape */}
                <path
                    d="M16 2L4 26H10L16 14L22 26H28L16 2Z"
                    fill="url(#logo-gradient)"
                />
                {/* Crossing Line for 'X' effect */}
                <path
                    d="M8 20L24 20"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(230, 57, 70, 0.5))' }}
                />
                <defs>
                    <linearGradient id="logo-gradient" x1="16" y1="2" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor={color} />
                        <stop offset="1" stopColor="#FF4d6D" />
                    </linearGradient>
                </defs>
            </svg>
        </Box>

        {/* Text */}
        {showText && (
            <Typography
                sx={{
                    fontSize: Math.max(14, size * 0.65),
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                AthlonX
            </Typography>
        )}
    </Box>
);
