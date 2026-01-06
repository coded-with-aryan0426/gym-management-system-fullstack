"use client";

import React from 'react';
import { Box, Typography, Button, Container, Avatar, AvatarGroup } from '@mui/material';
import { ArrowRight, Calendar, Lock, Zap, Target, Clock } from 'lucide-react';

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
    return (
        <Box
            sx={{
                backgroundColor: '#0A0A0A',
                paddingY: { xs: '80px', md: '140px' },
                position: 'relative',
                overflow: 'hidden',
                borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
        >
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
                                border: '3px solid #0A0A0A',
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

                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: '36px', md: '56px' },
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: 3,
                        lineHeight: 1.1,
                        letterSpacing: '-1.5px'
                    }}
                >
                    Ready to Turn Your Gym Into a <GradientText>Machine</GradientText>?
                </Typography>

                <Typography
                    sx={{
                        fontSize: '18px',
                        color: 'var(--color-gray-400)',
                        marginBottom: 6,
                        maxWidth: 600,
                        margin: '0 auto 48px',
                        lineHeight: 1.6
                    }}
                >
                    Stop fighting fires. Start building an empire. Join 5,000+ gym owners who dominated their market with AthlonX.
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2.5,
                        justifyContent: 'center',
                        marginBottom: 6,
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
                            borderColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '16px',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                transform: 'translateY(-3px)',
                            },
                        }}
                        startIcon={<Calendar size={22} />}
                    >
                        Book Strategy Call
                    </Button>
                </Box>

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
                                    color: 'var(--color-gray-500)',
                                    fontWeight: 500
                                }}
                            >
                                {item.text}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
