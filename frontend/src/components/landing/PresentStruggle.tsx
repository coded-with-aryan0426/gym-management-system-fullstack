"use client";

import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { Layers, PieChart, Users, Puzzle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
    const containerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const pathLength = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

    return (
        <Box
            ref={containerRef}
            sx={{
                backgroundColor: '#0A0A0A',
                paddingY: { xs: '80px', md: '140px' },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={8} alignItems="center">
                    {/* Left Side: Timeline */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '32px', md: '48px' },
                                    fontWeight: 800,
                                    color: 'white',
                                    marginBottom: 3,
                                    fontFamily: 'var(--font-heading)',
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
                        </motion.div>

                        <Box sx={{ position: 'relative', pl: 4 }}>
                            {/* Vertical Line */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 10,
                                    bottom: 10,
                                    width: '2px',
                                    background: 'rgba(230, 57, 70, 0.1)'
                                }}
                            >
                                <motion.div
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        background: '#E63946',
                                        scaleY: pathLength,
                                        originY: 0
                                    }}
                                />
                            </Box>

                            {/* Timeline Items */}
                            {presentProblems.map((item, index) => (
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
                                            boxShadow: '0 0 10px rgba(230, 57, 70, 0.8)',
                                            zIndex: 2
                                        }}
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                                            <item.icon size={20} color="#E63946" />
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontSize: '20px',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    fontFamily: 'var(--font-heading)'
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
                                                borderLeft: '2px inset #E63946'
                                            }}
                                        >
                                            <Typography sx={{ color: 'var(--color-gray-300)', fontSize: '14px', fontStyle: 'italic' }}>
                                                "{item.quote}"
                                            </Typography>
                                            <Typography sx={{ color: '#E63946', fontSize: '12px', fontWeight: 700, marginTop: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                — {item.author}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right Side: Puzzle Animation */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            sx={{
                                position: 'relative',
                                height: { xs: '300px', md: '500px' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Abstract Puzzle Visualization */}
                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {/* Puzzle Pieces */}
                                {[
                                    { color: '#E63946', top: '10%', left: '10%', rotate: -15, delay: 0 },
                                    { color: '#C1121F', top: '20%', right: '15%', rotate: 20, delay: 0.2 },
                                    { color: '#FF495C', bottom: '25%', left: '20%', rotate: -10, delay: 0.4 },
                                    { color: '#991B1B', bottom: '15%', right: '25%', rotate: 15, delay: 0.6 },
                                    { color: '#E63946', top: '50%', left: '50%', rotate: 0, delay: 0.8, center: true }
                                ].map((piece, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            opacity: 0,
                                            x: piece.center ? 0 : (i % 2 === 0 ? -100 : 100),
                                            y: piece.center ? 0 : (i < 2 ? -100 : 100),
                                            rotate: piece.rotate
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            x: piece.center ? 0 : (i % 2 === 0 ? -20 : 20),
                                            y: piece.center ? 0 : (i < 2 ? -20 : 20),
                                            rotate: piece.rotate
                                        }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 1.5,
                                            delay: piece.delay,
                                            type: 'spring',
                                            stiffness: 50
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: piece.top,
                                            left: piece.left,
                                            right: piece.right,
                                            bottom: piece.bottom,
                                            width: piece.center ? '120px' : '80px',
                                            height: piece.center ? '120px' : '80px',
                                            backgroundColor: piece.color,
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            zIndex: piece.center ? 10 : 5,
                                            border: '2px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <Puzzle size={piece.center ? 48 : 32} color="white" />
                                    </motion.div>
                                ))}

                                {/* Connecting Lines/Glow */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 0.5 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.5, duration: 1 }}
                                    style={{
                                        position: 'absolute',
                                        width: '300px',
                                        height: '300px',
                                        background: 'radial-gradient(circle, rgba(230, 57, 70, 0.2) 0%, transparent 70%)',
                                        zIndex: 1
                                    }}
                                />
                            </motion.div>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
