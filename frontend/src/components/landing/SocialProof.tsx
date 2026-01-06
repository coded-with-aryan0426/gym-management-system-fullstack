"use client";

import React from 'react';
import { Box, Typography, Card, Grid, Container, Avatar } from '@mui/material';
import { Quote, Star, TrendingUp, Clock, Award } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        rating: 5,
        quote: 'We went from losing ₹3,50,000/month in missed payments to 98.7% collection rate. Added 847 new members in 6 months because onboarding is finally seamless. This paid for itself in week one.',
        metric: '₹3,50,000 → ₹0 payment leakage',
        metricIcon: TrendingUp,
        name: 'Rahul Sharma',
        role: 'Owner, Iron Temple Fitness (3 locations)',
        location: 'Mumbai, Maharashtra',
        avatar: '/images/testimonial-1.jpg',
    },
    {
        id: 2,
        rating: 5,
        quote: "I was spending 3 hours a day on admin. Now it's 15 minutes. My no-show rate dropped from 23% to 4%. I added 12 new clients because I finally had time to actually TRAIN. My income went up 67%.",
        metric: '3 hours → 15 minutes daily admin',
        metricIcon: Clock,
        name: 'Priya Patel',
        role: 'Head Trainer, FitLife Studios',
        location: 'Bangalore, Karnataka',
        avatar: '/images/testimonial-2.jpg',
    },
    {
        id: 3,
        rating: 5,
        quote: "I can book classes, track my PRs, message my trainer, and pay my membership all in one app with UPI. I've been to 6 gyms before this — none of them made it this easy to stay consistent. Down 15kg and still going.",
        metric: '15 kg lost, 2 years consistent',
        metricIcon: Award,
        name: 'Arjun Reddy',
        role: 'Member for 2 years',
        location: 'Hyderabad, Telangana',
        avatar: '/images/testimonial-3.jpg',
    },
];

export default function SocialProof() {
    return (
        <Box
            sx={{
                backgroundColor: '#0A0A0A',
                paddingY: { xs: '80px', md: '120px' },
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
        >
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', marginBottom: 8 }}>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: '#E63946',
                            marginBottom: 2,
                        }}
                    >
                        THE PROOF
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '36px', md: '56px' },
                            fontWeight: 900,
                            fontFamily: 'var(--font-heading)',
                            color: 'white',
                            lineHeight: 1.1,
                            letterSpacing: '-1px'
                        }}
                    >
                        Trusted by High-Performance Gyms
                    </Typography>
                </Box>

                {/* Testimonials Grid */}
                <Grid container spacing={4}>
                    {testimonials.map((testimonial) => (
                        <Grid size={{ xs: 12, md: 4 }} key={testimonial.id}>
                            <Card
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '24px',
                                    padding: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'rgba(230, 57, 70, 0.3)',
                                        transform: 'translateY(-10px)',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                    }
                                }}
                            >
                                {/* Quote Icon */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 24,
                                        right: 24,
                                        opacity: 0.05,
                                    }}
                                >
                                    <Quote size={48} color="#E63946" />
                                </Box>

                                {/* Star Rating */}
                                <Box sx={{ display: 'flex', gap: 0.5, marginBottom: 3 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={16} fill="#E63946" color="#E63946" />
                                    ))}
                                </Box>

                                {/* Quote Text */}
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 400,
                                        lineHeight: 1.6,
                                        color: 'var(--color-gray-400)',
                                        marginBottom: 4,
                                        flex: 1,
                                        fontStyle: 'italic'
                                    }}
                                >
                                    "{testimonial.quote}"
                                </Typography>

                                {/* Metric Highlight */}
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(230, 57, 70, 0.1)',
                                        borderRadius: '8px',
                                        padding: '10px 16px',
                                        marginBottom: 4,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        alignSelf: 'flex-start',
                                        border: '1px solid rgba(230, 57, 70, 0.2)'
                                    }}
                                >
                                    <testimonial.metricIcon size={16} color="#E63946" />
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: '#E63946',
                                        }}
                                    >
                                        {testimonial.metric}
                                    </Typography>
                                </Box>

                                {/* Author Info */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        sx={{ width: 56, height: 56, border: '2px solid rgba(230, 57, 70, 0.3)' }}
                                    />
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                color: 'white',
                                            }}
                                        >
                                            {testimonial.name}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                color: 'var(--color-gray-500)',
                                                fontWeight: 500
                                            }}
                                        >
                                            {testimonial.role}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Trust Badges */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginTop: 10,
                        padding: 4,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={20} fill="#E63946" color="#E63946" />
                            ))}
                        </Box>
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>
                            4.9/5 Average Rating across 2,847 gyms
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
