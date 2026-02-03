"use client";

import React from 'react';
import { Box, Typography, Card, Chip, Grid, Container } from '@mui/material';
import { FileText, Grid as GridIcon, PhoneOff, AlertCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const problems = [
    {
        id: 1,
        target: 'Paper Chaos',
        icon: FileText,
        iconBg: 'rgba(230, 57, 70, 0.1)',
        iconColor: '#E63946',
        headline: 'Lost in Paper Mountains',
        agitation: 'Remember spending hours updating member registers by hand? Missing payment records? Lost contact information when that notebook disappeared?',
        stat: 'Average 8 hours/week wasted on manual entry'
    },
    {
        id: 2,
        target: 'Excel Hell',
        icon: GridIcon,
        iconBg: 'rgba(230, 57, 70, 0.1)',
        iconColor: '#E63946',
        headline: 'Excel Nightmares',
        agitation: 'Crashed spreadsheets right before month-end reports. Formula errors in billing calculations. Unable to access data when away from the office.',
        stat: '73% of gym owners report billing errors'
    },
    {
        id: 3,
        target: 'Member Disconnect',
        icon: PhoneOff,
        iconBg: 'rgba(230, 57, 70, 0.1)',
        iconColor: '#E63946',
        headline: 'Chasing Payments',
        agitation: 'Manually calling members about renewals. Forgetting to follow up with leads. No way to track who attended classes or used the facilities.',
        stat: 'Average 30% revenue loss from missed renewals'
    },
];

export default function Problem() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const containerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <Box
            ref={containerRef}
            sx={{
                backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
                paddingY: { xs: '60px', sm: '80px', md: '100px', lg: '120px' },
                paddingX: { xs: '16px', sm: '24px', md: '0' },
                position: 'relative',
                overflow: 'hidden',
                transition: 'background-color 0.3s ease'
            }}
        >
            {/* Background Glow */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.05) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', marginBottom: { xs: 6, md: 8, lg: 10 } }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Typography
                            sx={{
                                fontSize: '14px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                color: '#E63946',
                                marginBottom: 2,
                            }}
                        >
                            The Days of Struggle
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '36px', md: '56px' },
                                fontWeight: 800,
                                fontFamily: 'var(--font-heading)',
                                color: isDark ? 'white' : '#0F172A',
                                maxWidth: 800,
                                margin: '0 auto',
                                lineHeight: 1.1,
                                letterSpacing: '-1px'
                            }}
                        >
                            Remember These Days? <Box component="span" sx={{ color: '#E63946' }}>Chaotic.</Box>
                        </Typography>
                    </motion.div>
                </Box>

                {/* Cards Container with Vertical Line */}
                <Box sx={{ position: 'relative' }}>
                    {/* Animated Vertical Line (Desktop) */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: 'rgba(255,255,255,0.05)',
                            display: { xs: 'none', md: 'block' },
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <motion.div
                            style={{
                                height,
                                width: '100%',
                                background: 'linear-gradient(to bottom, #E63946, #FF495C, #C1121F)',
                                originY: 0
                            }}
                        />
                    </Box>

                    <Grid container spacing={6}>
                        {problems.map((item, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={item.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2, duration: 0.8 }}
                                >
                                    <Card
                                        sx={{
                                            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                                            borderLeft: '4px solid #E63946',
                                            borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
                                            borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
                                            borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
                                            borderRadius: '16px',
                                            padding: 4,
                                            height: '100%',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                                            '&:hover': {
                                                backgroundColor: isDark ? '#222222' : '#F8FAFC',
                                                transform: 'translateY(-8px)',
                                                boxShadow: isDark 
                                                    ? '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(230, 57, 70, 0.1)'
                                                    : '0 20px 40px rgba(0,0,0,0.1), 0 0 20px rgba(230, 57, 70, 0.05)',
                                                '& .icon-glow': {
                                                    boxShadow: '0 0 30px rgba(230, 57, 70, 0.4)',
                                                }
                                            },
                                        }}
                                    >
                                        {/* Icon Container */}
                                        <Box
                                            className="icon-glow"
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: '12px',
                                                backgroundColor: item.iconBg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 3,
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <item.icon size={32} color={item.iconColor} />
                                        </Box>

                                        {/* Headline */}
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontSize: '24px',
                                                fontWeight: 700,
                                                fontFamily: 'var(--font-heading)',
                                                color: isDark ? 'white' : '#0F172A',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {item.headline}
                                        </Typography>

                                        {/* Agitation Text */}
                                        <Typography
                                            sx={{
                                                fontSize: '16px',
                                                lineHeight: 1.6,
                                                color: isDark ? 'var(--color-gray-300)' : '#475569',
                                                marginBottom: 4,
                                            }}
                                        >
                                            {item.agitation}
                                        </Typography>

                                        {/* Pain point stat badge */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#E63946',
                                                backgroundColor: 'rgba(230, 57, 70, 0.1)',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(230, 57, 70, 0.2)',
                                                width: 'fit-content'
                                            }}
                                        >
                                            <AlertCircle size={14} />
                                            {item.stat}
                                        </Box>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Transition Statement */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    <Box
                        sx={{
                            maxWidth: 800,
                            margin: '96px auto 0',
                            padding: 6,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            borderLeft: '4px solid #E63946',
                            borderRadius: '0 24px 24px 0',
                            textAlign: 'center'
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '20px',
                                fontStyle: 'italic',
                                color: isDark ? 'var(--color-gray-300)' : '#475569',
                                lineHeight: 1.8,
                                fontWeight: 400
                            }}
                        >
                            "I built AthlonX because I was tired of using 5 different softwares just to keep my gym open. I wanted one dashboard that told me the truth about my business."
                            <Box component="span" sx={{ display: 'block', marginTop: 3, fontStyle: 'normal', fontWeight: 700, color: isDark ? 'white' : '#0F172A', fontSize: '18px', letterSpacing: '0.5px' }}>
                                — ARYAN, FOUNDER OF ATHLONX
                            </Box>
                        </Typography>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
}
