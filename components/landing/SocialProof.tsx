"use client";

import React from 'react';
import { Box, Typography, Card, Chip, Grid, Container, Avatar } from '@mui/material';
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
                backgroundColor: 'var(--color-white)',
                paddingY: { xs: '80px', md: '120px' },
            }}
        >
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', marginBottom: 8 }}>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 'var(--tracking-wide)',
                            color: 'var(--color-accent-blue)',
                            marginBottom: 2,
                        }}
                    >
                        Don't Just Take Our Word For It
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '32px', md: '48px' },
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--color-gray-900)',
                        }}
                    >
                        Trusted by the Best in the Business
                    </Typography>
                </Box>

                {/* Testimonials Grid */}
                <Grid container spacing={4}>
                    {testimonials.map((testimonial) => (
                        <Grid size={{ xs: 12, md: 4 }} key={testimonial.id}>
                            <Card
                                sx={{
                                    backgroundColor: 'var(--color-gray-50)',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    boxShadow: 'none',
                                }}
                            >
                                {/* Quote Icon */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 24,
                                        right: 24,
                                        opacity: 0.1,
                                    }}
                                >
                                    <Quote size={48} color="var(--color-primary-900)" />
                                </Box>

                                {/* Star Rating */}
                                <Box sx={{ display: 'flex', gap: 0.5, marginBottom: 3 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={18} fill="#F59E0B" color="#F59E0B" />
                                    ))}
                                </Box>

                                {/* Quote Text */}
                                <Typography
                                    sx={{
                                        fontSize: 'var(--text-base)',
                                        fontWeight: 400,
                                        lineHeight: 'var(--leading-relaxed)',
                                        color: 'var(--color-gray-700)',
                                        marginBottom: 3,
                                        flex: 1,
                                    }}
                                >
                                    "{testimonial.quote}"
                                </Typography>

                                {/* Metric Highlight */}
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '8px 16px',
                                        marginBottom: 3,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        alignSelf: 'flex-start',
                                    }}
                                >
                                    <testimonial.metricIcon size={16} color="var(--color-success)" />
                                    <Typography
                                        sx={{
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 600,
                                            color: 'var(--color-success)',
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
                                        sx={{ width: 56, height: 56 }}
                                    />
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--text-base)',
                                                fontWeight: 600,
                                                color: 'var(--color-gray-900)',
                                            }}
                                        >
                                            {testimonial.name}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--color-gray-500)',
                                            }}
                                        >
                                            {testimonial.role}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--color-gray-400)',
                                            }}
                                        >
                                            {testimonial.location}
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
                        gap: { xs: 3, md: 6 },
                        marginTop: 8,
                    }}
                >
                    {/* Rating Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={20} fill="#F59E0B" color="#F59E0B" />
                            ))}
                        </Box>
                        <Typography sx={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-gray-700)' }}>
                            4.9/5 from 2,847 reviews
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
