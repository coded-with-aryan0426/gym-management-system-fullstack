"use client";

import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Network, Brain, Zap, Heart, Users as People, TrendingUp as Growth, Search, Bell } from 'lucide-react';

const features = [
    {
        title: "Everything in One Place",
        icon: Network,
        benefit: "No more app-switching. All your gym data unified in one intelligent system.",
        position: 'top-left'
    },
    {
        title: "Real-Time Intelligence",
        icon: Brain,
        benefit: "Make decisions based on live data, not week-old reports. Know your numbers instantly.",
        position: 'top-right'
    },
    {
        title: "Automated Everything",
        icon: Zap,
        benefit: "Payments, reminders, renewals - all handled automatically while you focus on members.",
        position: 'center-left'
    },
    {
        title: "Delighted Members",
        icon: Heart,
        benefit: "Self-service portal and seamless experience that keeps them coming back for more.",
        position: 'center-right'
    },
    {
        title: "Empowered Staff",
        icon: People,
        benefit: "Give your team the tools to excel. Track performance and manage schedules effortlessly.",
        position: 'bottom-left'
    },
    {
        title: "Business Growth",
        icon: Growth,
        benefit: "Average 40% revenue increase in first year. Reduce admin time by 75% reliably.",
        position: 'bottom-right'
    }
];

export default function EmpoweredFuture() {
    return (
        <Box
            sx={{
                backgroundColor: '#0A0A0A',
                paddingY: { xs: '80px', md: '120px' },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', marginBottom: 8 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '36px', md: '56px' },
                            fontWeight: 800,
                            color: 'white',
                            marginBottom: 3,
                            lineHeight: 1.1
                        }}
                    >
                        Welcome to Your <Box component="span" sx={{ color: '#E63946' }}>New Reality</Box>
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '18px',
                            color: 'var(--color-gray-400)',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}
                    >
                        One powerful platform. Complete control. Unprecedented growth.
                    </Typography>
                </Box>

                {/* Main Visual Content */}
                <Grid container spacing={4} alignItems="center">
                    {/* Feature Cards Left */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {features.slice(0, 3).map((feature) => (
                                <FeatureCard key={feature.title} {...feature} />
                            ))}
                        </Box>
                    </Grid>

                    {/* Central Dashboard Mockup */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                backgroundColor: '#1A1A1A',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: 3
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                <Typography sx={{ color: 'white', fontWeight: 700 }}>Dashboard</Typography>
                                <Bell size={18} color="#E63946" />
                            </Box>
                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(230, 57, 70, 0.1)', mb: 2 }}>
                                <Typography sx={{ color: 'var(--color-gray-400)', fontSize: '10px' }}>REVENUE</Typography>
                                <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>₹42,850</Typography>
                            </Box>
                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)' }}>
                                <Typography sx={{ color: 'var(--color-gray-400)', fontSize: '10px' }}>MEMBERS</Typography>
                                <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>1,284</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Feature Cards Right */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {features.slice(3, 6).map((feature) => (
                                <FeatureCard key={feature.title} {...feature} />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

function FeatureCard({ title, icon: Icon, benefit }: { title: string; icon: any; benefit: string }) {
    return (
        <Box
            sx={{
                p: 3,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'rgba(230, 57, 70, 0.05)',
                    borderColor: 'rgba(230, 57, 70, 0.2)',
                }
            }}
        >
            <Box sx={{ color: '#E63946', mb: 2 }}>
                <Icon size={24} />
            </Box>
            <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 700, color: 'white', mb: 1 }}>
                {title}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
                {benefit}
            </Typography>
        </Box>
    );
}
