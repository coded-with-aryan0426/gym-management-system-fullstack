"use client";

import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import { Smartphone, Calendar, TrendingUp, CheckCircle, CreditCard } from 'lucide-react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';

export default function MemberAppPage() {
    return (
        <Box sx={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
            <Header />
            <Box sx={{ 
                paddingTop: '160px', 
                paddingBottom: '120px', 
                position: 'relative', 
                overflow: 'visible',
                background: 'radial-gradient(circle at 50% 50%, rgba(230, 57, 70, 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(67, 97, 238, 0.05) 0%, transparent 40%)'
            }}>
                {/* Background Decor */}
                <Box sx={{ 
                    position: 'absolute', top: '-10%', right: '-5%', width: '800px', height: '800px', 
                    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.08) 0%, transparent 70%)', 
                    filter: 'blur(120px)', zIndex: 0, 
                    animation: 'pulse 10s infinite alternate' 
                }} />
                
                <style jsx global>{`
                    @keyframes pulse {
                        0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
                        100% { transform: scale(1.2) translate(50px, -50px); opacity: 0.8; }
                    }
                `}</style>

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center" justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography sx={{ 
                                    fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', 
                                    letterSpacing: '3px', color: '#E63946', marginBottom: 3 
                                }}>
                                    Mobile Experience
                                </Typography>
                                <Typography variant="h1" sx={{ 
                                    fontSize: { xs: '48px', md: '64px' }, fontWeight: 900, 
                                    lineHeight: 1.1, marginBottom: 3,
                                    background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>
                                    Your Gym. <br />
                                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.4)', WebkitTextFillColor: 'rgba(255,255,255,0.4)' }}>In Their Pocket.</Box>
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '18px', color: 'rgba(255,255,255,0.6)', 
                                    lineHeight: 1.6, marginBottom: 6, maxWidth: 500 
                                }}>
                                    Give your members a world-class mobile app branded with your logo. Book classes, track progress, and pay bills in seconds.
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap' }}>
                                    <Box 
                                        component="a" 
                                        href="#" 
                                        sx={{ 
                                            display: 'inline-block',
                                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    >
                                        <img 
                                            src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1276550400&h=7e5b12da6893698d2745a3038a8d1323" 
                                            alt="Download on the App Store" 
                                            style={{ height: '52px', width: 'auto' }}
                                        />
                                    </Box>
                                    <Box 
                                        component="a" 
                                        href="#" 
                                        sx={{ 
                                            display: 'inline-block',
                                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    >
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                                            alt="Get it on Google Play" 
                                            style={{ height: '52px', width: 'auto' }}
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 6, borderTop: '1px solid rgba(255,255,255,0.05)', pt: 6 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>4.9/5</Typography>
                                        <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>App Store Rating</Typography>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>50k+</Typography>
                                        <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Active Users</Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                >
                                    <Box sx={{ 
                                        position: 'relative', width: 300, height: 600, background: '#111', 
                                        borderRadius: '44px', padding: '10px', 
                                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), inset 0 0 2px 1px rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.1)', zIndex: 2 
                                    }}>
                                        <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1a1a1a 0%, #000 100%)', borderRadius: '36px', overflow: 'hidden', position: 'relative' }}>
                                            <Box sx={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <Smartphone size={40} color="rgba(255,255,255,0.2)" />
                                                <Box sx={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', width: '80%' }} />
                                                <Box sx={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', width: '100%' }} />
                                                <Box sx={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', width: '40%' }} />
                                                
                                                <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
                                                    <Box sx={{ width: '30%', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
                                                    <Box sx={{ width: '30%', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Floating Cards */}
                                        <motion.div 
                                            style={{ position: 'absolute', top: '10%', right: '-60px', width: '160px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '16px', zIndex: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', pointerEvents: 'none' }}
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Box sx={{ width: 32, height: 32, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, background: 'rgba(67, 97, 238, 0.1)', color: '#4361EE' }}>
                                                <Calendar size={16} />
                                            </Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 0.5 }}>Class Booked</Typography>
                                            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Yoga Flow @ 8:00 AM</Typography>
                                        </motion.div>

                                        <motion.div 
                                            style={{ position: 'absolute', bottom: '20%', left: '-80px', width: '180px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '16px', zIndex: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', pointerEvents: 'none' }}
                                            animate={{ y: [0, 15, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        >
                                            <Box sx={{ width: 32, height: 32, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, background: 'rgba(230, 57, 70, 0.1)', color: '#E63946' }}>
                                                <TrendingUp size={16} />
                                            </Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 0.5 }}>New PR!</Typography>
                                            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Deadlift: 140kg</Typography>
                                        </motion.div>

                                        <motion.div 
                                            style={{ position: 'absolute', bottom: '5%', right: '-40px', width: '140px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '16px', zIndex: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', pointerEvents: 'none' }}
                                            animate={{ y: [0, -12, 0] }}
                                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        >
                                            <Box sx={{ width: 32, height: 32, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                                <CheckCircle size={16} />
                                            </Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 0.5 }}>Paid</Typography>
                                            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Monthly Membership</Typography>
                                        </motion.div>
                                    </Box>
                                </motion.div>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box sx={{ padding: '60px 0', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', height: '100%' }}
                            >
                                <Box sx={{ width: 48, height: 48, background: 'rgba(230, 57, 70, 0.1)', color: '#E63946', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <Calendar size={24} />
                                </Box>
                                <Typography sx={{ fontSize: '20px', fontWeight: 800, mb: 1 }}>Easy Booking</Typography>
                                <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                    One-tap class registration and personal training scheduling.
                                </Typography>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', height: '100%' }}
                            >
                                <Box sx={{ width: 48, height: 48, background: 'rgba(67, 97, 238, 0.1)', color: '#4361EE', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <CreditCard size={24} />
                                </Box>
                                <Typography sx={{ fontSize: '20px', fontWeight: 800, mb: 1 }}>Seamless Payments</Typography>
                                <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                    Manage memberships, buy credits, and pay invoices instantly.
                                </Typography>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', height: '100%' }}
                            >
                                <Box sx={{ width: 48, height: 48, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <TrendingUp size={24} />
                                </Box>
                                <Typography sx={{ fontSize: '20px', fontWeight: 800, mb: 1 }}>Progress Tracking</Typography>
                                <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                    Log workouts and track your personal bests over time.
                                </Typography>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
}
