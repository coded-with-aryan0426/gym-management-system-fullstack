"use client";

import React from 'react';
import { Box, Typography, Card, Grid, Container } from '@mui/material';
import { FileText, Grid as GridIcon, PhoneOff, AlertCircle } from 'lucide-react';

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
    return (
        <Box
            sx={{
                backgroundColor: '#0A0A0A',
                paddingY: { xs: '60px', md: '120px' },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', marginBottom: 8 }}>
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
                            color: 'white',
                            maxWidth: 800,
                            margin: '0 auto',
                            lineHeight: 1.1,
                        }}
                    >
                        Remember These Days? <Box component="span" sx={{ color: '#E63946' }}>Chaotic.</Box>
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {problems.map((item) => (
                        <Grid item xs={12} md={4} key={item.id}>
                            <Card
                                sx={{
                                    backgroundColor: '#1A1A1A',
                                    borderLeft: '4px solid #E63946',
                                    borderRadius: '16px',
                                    padding: 4,
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#222222',
                                        transform: 'translateY(-5px)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '12px',
                                        backgroundColor: item.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 3,
                                    }}
                                >
                                    <item.icon size={28} color={item.iconColor} />
                                </Box>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: 'white',
                                        marginBottom: 2,
                                    }}
                                >
                                    {item.headline}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: '15px',
                                        lineHeight: 1.6,
                                        color: 'var(--color-gray-400)',
                                        marginBottom: 4,
                                    }}
                                >
                                    {item.agitation}
                                </Typography>

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
                                        width: 'fit-content'
                                    }}
                                >
                                    <AlertCircle size={14} />
                                    {item.stat}
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box
                    sx={{
                        maxWidth: 800,
                        margin: '80px auto 0',
                        padding: 4,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderLeft: '4px solid #E63946',
                        borderRadius: '0 16px 16px 0',
                        textAlign: 'center'
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontStyle: 'italic',
                            color: 'var(--color-gray-300)',
                            lineHeight: 1.8,
                        }}
                    >
                        "I built AthlonX because I was tired of using 5 different softwares just to keep my gym open. I wanted one dashboard that told me the truth about my business."
                        <Box component="span" sx={{ display: 'block', marginTop: 2, fontStyle: 'normal', fontWeight: 700, color: 'white' }}>
                            — ARYAN, FOUNDER OF ATHLONX
                        </Box>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
