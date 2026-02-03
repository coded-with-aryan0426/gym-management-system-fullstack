"use client";

import React from 'react';
import { Box, Typography, Button, Container, Avatar, AvatarGroup } from '@mui/material';
import { ArrowRight, Calendar, Lock, Zap, Target, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const GradientText = ({ children }: { children: React.ReactNode }) => (
    <Box
        component="span"
        sx={{
            background: 'var(--gradient-cta)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }}
    >
        {children}
    </Box>
);

const objectionHandlers = [
    { icon: Lock, text: 'No credit card required' },
    { icon: Zap, text: 'Setup in 15 minutes' },
    { icon: Target, text: 'Cancel anytime' },
];

const avatars = [
    { src: '/images/testimonial-1.jpg', alt: 'User 1' },
    { src: '/images/testimonial-2.jpg', alt: 'User 2' },
    { src: '/images/testimonial-3.jpg', alt: 'User 3' },
];

interface SecondaryCTAProps {
    onSignupClick: () => void;
}

export default function SecondaryCTA({ onSignupClick }: SecondaryCTAProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box
            sx={{
                backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
                paddingY: { xs: '48px', md: '80px' },
                position: 'relative',
                overflow: 'hidden',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'background-color 0.3s ease'
            }}
        >
            {/* Background Glow */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.05) 0%, transparent 70%)',
                    zIndex: 0,
                }}
            />

            <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Avatar Stack */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
                    <AvatarGroup
                        max={6}
                        sx={{
                            justifyContent: 'center',
                            '& .MuiAvatar-root': {
                                width: 48,
                                height: 48,
                                border: isDark ? '3px solid #0A0A0A' : '3px solid #F8FAFC',
                                marginLeft: '-12px',
                            },
                        }}
                    >
                        {avatars.map((avatar, index) => (
                            <Avatar key={index} src={avatar.src} alt={avatar.alt} />
                        ))}
                        <Avatar sx={{ backgroundColor: '#E63946', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                            +2k
                        </Avatar>
                    </AvatarGroup>
                </Box>

                <Typography
                    sx={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#E63946',
                        marginBottom: 3,
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}
                >
                    JOIN THE ELITE
                </Typography>

                {/* Question Headline */}
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: '36px', md: '56px' },
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        color: isDark ? 'white' : '#0F172A',
                        marginBottom: 3,
                        lineHeight: 1.1,
                        letterSpacing: '-1.5px'
                    }}
                >
                    Ready to Turn Your Gym Into a <GradientText>Machine</GradientText>?
                </Typography>

                {/* Supporting Copy */}
                <Typography
                    sx={{
                        fontSize: '18px',
                        color: isDark ? 'var(--color-gray-400)' : '#64748B',
                        marginBottom: 4,
                        maxWidth: 600,
                        margin: '0 auto 32px',
                        lineHeight: 1.6
                    }}
                >
                    Stop fighting fires. Start building an empire. Join 5,000+ gym owners who dominated their market with AthlonX.
                </Typography>

                {/* CTA Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2.5,
                        justifyContent: 'center',
                        marginBottom: 4,
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            height: 64,
                            paddingX: 5,
                            background: 'var(--gradient-cta)',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 800,
                            textTransform: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(230, 57, 70, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 15px 40px rgba(230, 57, 70, 0.5)',
                            },
                        }}
                        endIcon={<ArrowRight size={22} />}
                        onClick={onSignupClick}
                    >
                        Claim Your Free Trial
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        sx={{
                            height: 64,
                            paddingX: 5,
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            color: isDark ? 'white' : '#0F172A',
                            fontSize: '18px',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '16px',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                borderColor: isDark ? 'white' : '#0F172A',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                transform: 'translateY(-3px)',
                            },
                        }}
                        startIcon={<Calendar size={22} />}
                    >
                        Book Strategy Call
                    </Button>
                </Box>

                {/* Objection Handler */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 4,
                    }}
                >
                    {objectionHandlers.map((item) => (
                        <Box
                            key={item.text}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                            }}
                        >
                            <item.icon size={18} color="#E63946" />
                            <Typography
                                sx={{
                                    fontSize: '15px',
                                    color: isDark ? 'var(--color-gray-500)' : '#64748B',
                                    fontWeight: 500
                                }}
                            >
                                {item.text}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Urgency Element */}
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        backgroundColor: 'rgba(230, 57, 70, 0.1)',
                        border: '1px solid rgba(230, 57, 70, 0.2)',
                        paddingX: 3,
                        paddingY: 1.5,
                        borderRadius: '12px',
                        marginTop: 4,
                    }}
                >
                    <Clock size={18} color="#E63946" />
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#E63946',
                        }}
                    >
                        LIMITED TIME: Get 3 Months for the price of 1
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
