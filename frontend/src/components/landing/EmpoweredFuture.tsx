"use client";

import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import {
    Network,
    Brain,
    Zap,
    Heart,
    Users as People,
    TrendingUp as Growth,
    ArrowUpRight,
    Search,
    Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const features = [
    {
        title: "Everything in One Place",
        icon: Network,
        benefit: "No more app-switching. All your gym data unified in one intelligent system.",
        delay: 0.1,
        position: 'top-left'
    },
    {
        title: "Real-Time Intelligence",
        icon: Brain,
        benefit: "Make decisions based on live data, not week-old reports. Know your numbers instantly.",
        delay: 0.2,
        position: 'top-right'
    },
    {
        title: "Automated Everything",
        icon: Zap,
        benefit: "Payments, reminders, renewals - all handled automatically while you focus on members.",
        delay: 0.3,
        position: 'center-left'
    },
    {
        title: "Delighted Members",
        icon: Heart,
        benefit: "Self-service portal and seamless experience that keeps them coming back for more.",
        delay: 0.4,
        position: 'center-right'
    },
    {
        title: "Empowered Staff",
        icon: People,
        benefit: "Give your team the tools to excel. Track performance and manage schedules effortlessly.",
        delay: 0.5,
        position: 'bottom-left'
    },
    {
        title: "Business Growth",
        icon: Growth,
        benefit: "Average 40% revenue increase in first year. Reduce admin time by 75% reliably.",
        delay: 0.6,
        position: 'bottom-right'
    }
];

export default function EmpoweredFuture() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box
            sx={{
                backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
                paddingY: { xs: '48px', md: '72px' },
                position: 'relative',
                overflow: 'hidden',
                transition: 'background-color 0.3s ease'
            }}
        >
            {/* Ambient Background Effects */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.05) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: 0
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', marginBottom: { xs: 4, md: 6 } }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '32px', md: '48px' },
                                fontWeight: 900,
                                color: isDark ? 'white' : '#0F172A',
                                marginBottom: 2,
                                fontFamily: 'var(--font-heading)',
                                letterSpacing: '-1px',
                                lineHeight: 1.1
                            }}
                        >
                            Welcome to Your <Box component="span" sx={{ color: '#E63946' }}>New Reality</Box>
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: '15px', md: '17px' },
                                color: isDark ? 'var(--color-gray-400)' : '#64748B',
                                maxWidth: '600px',
                                margin: '0 auto',
                                fontWeight: 400
                            }}
                        >
                            One powerful platform. Complete control. Unprecedented growth.
                        </Typography>
                    </motion.div>
                </Box>

                {/* Main Visual Content */}
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    {/* Feature Cards Left */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {features.slice(0, 3).map((feature) => (
                                <FeatureCard key={feature.title} {...feature} align="right" isDark={isDark} />
                            ))}
                        </Box>
                    </Grid>

                    {/* Central Dashboard Mockup */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        >
<Box
                                            sx={{
                                                position: 'relative',
                                                perspective: '1000px',
                                                padding: '2px',
                                                background: isDark 
                                                    ? 'linear-gradient(135deg, rgba(230, 57, 70, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%)'
                                                    : 'linear-gradient(135deg, rgba(230, 57, 70, 0.3) 0%, rgba(0, 0, 0, 0.05) 100%)',
                                                borderRadius: '24px',
                                                boxShadow: isDark 
                                                    ? '0 40px 100px rgba(0,0,0,0.8), 0 0 40px rgba(230, 57, 70, 0.2)'
                                                    : '0 20px 60px rgba(0,0,0,0.15), 0 0 20px rgba(230, 57, 70, 0.1)'
                                            }}
                                        >
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                                                    borderRadius: '22px',
                                                    overflow: 'hidden',
                                                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)'
                                                }}
                                            >
                                                {/* Mock Dashboard UI */}
                                                <Box sx={{ p: 3 }}>
                                                    {/* Dashboard Header */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                                        <Box>
                                                            <Typography sx={{ color: isDark ? 'white' : '#0F172A', fontWeight: 700, fontSize: '16px' }}>Command Center</Typography>
                                                            <Typography sx={{ color: isDark ? 'var(--color-gray-500)' : '#64748B', fontSize: '11px' }}>Real-time Business Intelligence</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Box sx={{ p: 0.75, borderRadius: '6px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}><Search size={14} color={isDark ? "#666" : "#999"} /></Box>
                                                            <Box sx={{ p: 0.75, borderRadius: '6px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}><Bell size={14} color="#E63946" /></Box>
                                                        </Box>
                                                    </Box>

                                                    {/* Dashboard Stats */}
                                                    <Grid container spacing={1.5}>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(230, 57, 70, 0.05)', border: '1px solid rgba(230, 57, 70, 0.1)' }}>
                                                                <Typography sx={{ color: isDark ? 'var(--color-gray-400)' : '#64748B', fontSize: '10px', fontWeight: 600, mb: 0.5 }}>ACTIVE MEMBERS</Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                                                    <Typography sx={{ color: isDark ? 'white' : '#0F172A', fontSize: '22px', fontWeight: 800 }}>1,284</Typography>
                                                                    <Typography sx={{ color: '#06D6A0', fontSize: '11px', fontWeight: 700, mb: 0.5 }}>+12%</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                                                                <Typography sx={{ color: isDark ? 'var(--color-gray-400)' : '#64748B', fontSize: '10px', fontWeight: 600, mb: 0.5 }}>TODAY'S REVENUE</Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                                                    <Typography sx={{ color: isDark ? 'white' : '#0F172A', fontSize: '22px', fontWeight: 800 }}>₹42,850</Typography>
                                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#06D6A0', mb: 1 }} />
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    {/* Representative Graph */}
                                                    <Box sx={{ mt: 2.5, height: '100px', position: 'relative' }}>
                                                        <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                                                            <motion.path
                                                                d="M0,80 Q50,90 100,50 T200,30 T300,60 T400,20"
                                                                fill="none"
                                                                stroke="#E63946"
                                                                strokeWidth="3"
                                                                initial={{ pathLength: 0 }}
                                                                whileInView={{ pathLength: 1 }}
                                                                transition={{ duration: 1.5, delay: 0.8 }}
                                                            />
                                                            <Box component="rect" width="100%" height="100%" fill="url(#grad1)" style={{ opacity: 0.1 }} />
                                                        </svg>
                                                    </Box>

                                                    {/* Bottom Action Item */}
                                                    <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                                                        <Box sx={{ flex: 1, height: '6px', borderRadius: '3px', bgcolor: 'rgba(230, 57, 70, 0.2)' }} />
                                                        <Box sx={{ flex: 2, height: '6px', borderRadius: '3px', bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Box>
                        </motion.div>
                    </Grid>

                    {/* Feature Cards Right */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {features.slice(3, 6).map((feature) => (
                                <FeatureCard key={feature.title} {...feature} align="left" isDark={isDark} />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

interface FeatureCardProps {
    title: string;
    icon: React.ElementType;
    benefit: string;
    delay: number;
    align?: 'left' | 'right';
    isDark?: boolean;
}

function FeatureCard({ title, icon: Icon, benefit, delay, align = 'left', isDark = true }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: align === 'left' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6 }}
            whileHover={{ y: -5 }}
        >
            <Box
                sx={{
                    textAlign: align,
                    display: 'flex',
                    flexDirection: align === 'right' ? 'row-reverse' : 'row',
                    gap: 2.5,
                    p: 3,
                    borderRadius: '24px',
                    backgroundColor: isDark ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                        backgroundColor: isDark ? 'rgba(230, 57, 70, 0.05)' : 'rgba(230, 57, 70, 0.05)',
                        borderColor: 'rgba(230, 57, 70, 0.3)',
                        '& .icon-circle': {
                            backgroundColor: '#E63946',
                            color: 'white',
                            transform: 'rotate(10deg)'
                        }
                    }
                }}
            >
                <Box
                    className="icon-circle"
                    sx={{
                        flexShrink: 0,
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E63946',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <Icon size={24} />
                </Box>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: isDark ? 'white' : '#0F172A',
                            mb: 0.5,
                            fontFamily: 'var(--font-heading)'
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: isDark ? 'var(--color-gray-500)' : '#64748B', lineHeight: 1.5 }}>
                        {benefit}
                    </Typography>
                </Box>
            </Box>
        </motion.div>
    );
}
