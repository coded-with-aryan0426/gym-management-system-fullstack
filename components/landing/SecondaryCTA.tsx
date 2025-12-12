"use client";

import React from 'react';
import { Box, Typography, Button, Container, Avatar, AvatarGroup } from '@mui/material';
import { ArrowRight, Calendar, Lock, Zap, Target, Clock } from 'lucide-react';

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
                backgroundColor: 'var(--color-accent-blue)',
                paddingY: { xs: '64px', md: '120px' },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative' }}>
                {/* Avatar Stack */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
                    <AvatarGroup
                        max={6}
                        sx={{
                            justifyContent: 'center',
                            '& .MuiAvatar-root': {
                                width: 44,
                                height: 44,
                                border: '3px solid var(--color-accent-blue)',
                                marginLeft: '-12px',
                            },
                        }}
                    >
                        {avatars.map((avatar, index) => (
                            <Avatar key={index} src={avatar.src} alt={avatar.alt} />
                        ))}
                        <Avatar sx={{ backgroundColor: 'var(--color-white)', color: 'var(--color-accent-blue)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                            +2k
                        </Avatar>
                    </AvatarGroup>
                </Box>

                <Typography
                    sx={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: 3,
                    }}
                >
                    Gym owners joined this month
                </Typography>

                {/* Question Headline */}
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: '32px', md: '48px' },
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-white)',
                        marginBottom: 2,
                        lineHeight: 'var(--leading-tight)',
                    }}
                >
                    Ready to Stop Managing Chaos and Start Managing Growth?
                </Typography>

                {/* Supporting Copy */}
                <Typography
                    sx={{
                        fontSize: 'var(--text-lg)',
                        color: 'rgba(255,255,255,0.85)',
                        marginBottom: 5,
                        maxWidth: 560,
                        margin: '0 auto 40px',
                        lineHeight: 1.6
                    }}
                >
                    Join 5,000+ gyms across India who made the switch. Your members, trainers, and bank account will thank you.
                </Typography>

                {/* CTA Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        justifyContent: 'center',
                        marginBottom: 4,
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            height: 56,
                            paddingX: 4,
                            backgroundColor: 'var(--color-white)',
                            color: 'var(--color-accent-blue)',
                            fontSize: 'var(--text-base)',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                            '&:hover': {
                                backgroundColor: 'var(--color-gray-100)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                        endIcon={<ArrowRight size={20} />}
                        onClick={onSignupClick}
                    >
                        Yes, Transform My Gym
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        sx={{
                            height: 56,
                            paddingX: 4,
                            borderColor: 'rgba(255,255,255,0.4)',
                            color: 'var(--color-white)',
                            fontSize: 'var(--text-base)',
                            fontWeight: 500,
                            textTransform: 'none',
                            borderRadius: 'var(--radius-lg)',
                            '&:hover': {
                                borderColor: 'var(--color-white)',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            },
                        }}
                        startIcon={<Calendar size={20} />}
                    >
                        Book a Free Demo Call
                    </Button>
                </Box>

                {/* Objection Handler */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 3,
                    }}
                >
                    {objectionHandlers.map((item) => (
                        <Box
                            key={item.text}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <item.icon size={16} color="rgba(255,255,255,0.7)" />
                            <Typography
                                sx={{
                                    fontSize: 'var(--text-sm)',
                                    color: 'rgba(255,255,255,0.8)',
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
                        gap: 1,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(4px)',
                        paddingX: 3,
                        paddingY: 1.5,
                        borderRadius: 'var(--radius-full)',
                        marginTop: 4,
                    }}
                >
                    <Clock size={18} color="var(--color-white)" />
                    <Typography
                        sx={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: 'var(--color-white)',
                        }}
                    >
                        Special Offer: Get 3 months free when you start this week
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
