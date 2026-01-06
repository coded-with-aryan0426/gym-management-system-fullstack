"use client";

import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { Layers, PieChart, Users, Puzzle } from 'lucide-react';

const presentProblems = [
    {
        id: 1,
        title: "Juggling 5 different apps",
        description: "Billing, scheduling, member tracking, staff management, and communication - none of them talk to each other.",
        quote: "I spend 2 hours daily just moving data between systems",
        author: "Rajesh, Mumbai",
        icon: Layers
    },
    {
        id: 2,
        title: "No clear picture of business health",
        description: "You don't know your churn rate, your most profitable class, or your actual revenue until the end of the month.",
        quote: "By the time I see the numbers, it's too late to fix anything",
        author: "Priya, Delhi",
        icon: PieChart
    },
    {
        id: 3,
        title: "Member experience suffering",
        description: "Disconnected systems lead to missed appointments, payment errors, and slow responses.",
        quote: "My members get frustrated when I can't quickly answer their questions",
        author: "Arun, Bangalore",
        icon: Users
    }
];

export default function PresentStruggle() {
    return (
        <Box
            sx={{
                backgroundColor: '#0F0F0F',
                paddingY: { xs: '80px', md: '120px' },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={8} alignItems="center">
                    {/* Left Side: Timeline */}
                    <Grid item xs={12} md={6}>
                        <Box>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '32px', md: '48px' },
                                    fontWeight: 800,
                                    color: 'white',
                                    marginBottom: 3,
                                    lineHeight: 1.2
                                }}
                            >
                                Most Gym Owners Are Still <Box component="span" sx={{ color: '#E63946' }}>Fighting These Battles</Box>
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '18px',
                                    color: 'var(--color-gray-400)',
                                    marginBottom: 6,
                                    maxWidth: '500px'
                                }}
                            >
                                Even with some digital tools, the struggle remains real. Disconnected systems create a ceiling for your growth.
                            </Typography>
                        </Box>

                        <Box sx={{ position: 'relative', pl: 4 }}>
                            {/* Vertical Line */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 10,
                                    bottom: 10,
                                    width: '2px',
                                    background: 'rgba(230, 57, 70, 0.2)'
                                }}
                            />

                            {/* Timeline Items */}
                            {presentProblems.map((item) => (
                                <Box key={item.id} sx={{ marginBottom: 6, position: 'relative' }}>
                                    {/* Dot */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: -36,
                                            top: 8,
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: '#E63946',
                                            zIndex: 2
                                        }}
                                    />

                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                                            <item.icon size={20} color="#E63946" />
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontSize: '20px',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ color: 'var(--color-gray-400)', marginBottom: 2, fontSize: '15px' }}>
                                            {item.description}
                                        </Typography>
                                        <Box
                                            sx={{
                                                padding: '12px 20px',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                borderRadius: '12px',
                                                borderLeft: '2px solid #E63946'
                                            }}
                                        >
                                            <Typography sx={{ color: 'var(--color-gray-300)', fontSize: '14px', fontStyle: 'italic' }}>
                                                "{item.quote}"
                                            </Typography>
                                            <Typography sx={{ color: '#E63946', fontSize: '12px', fontWeight: 700, marginTop: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                — {item.author}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right Side: Visual */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                position: 'relative',
                                height: { xs: '300px', md: '500px' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                           <Puzzle size={200} color="rgba(230, 57, 70, 0.1)" />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
