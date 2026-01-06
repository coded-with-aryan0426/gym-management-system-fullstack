import { Box, Typography, Container, Button, Grid } from '@mui/material';
import { Smartphone, Download, Calendar, CreditCard, TrendingUp, CheckCircle, Apple, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import './StaticPages.css';

export default function MemberAppPage() {
    return (
        <Box className="static-page">
            <Header />
            <Box className="static-page__hero static-page__hero--member-app">
                {/* Background Decor */}
                <Box className="static-page__glow--1" />
                <Box className="static-page__glow--2" />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center" justifyContent="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography className="static-page__eyebrow">
                                    Mobile Experience
                                </Typography>
                                <Typography variant="h1" className="static-page__title static-page__title--gradient">
                                    Your Gym. <br />
                                    <span className="static-page__title--muted">In Their Pocket.</span>
                                </Typography>
                                <Typography className="static-page__subtitle">
                                    Give your members a world-class mobile app branded with your logo. Book classes, track progress, and pay bills in seconds.
                                </Typography>

                                <Box className="app-buttons" sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap' }}>
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

                                <Box className="stats-row">
                                    <Box className="stat-item">
                                        <Typography className="stat-item__number">4.9/5</Typography>
                                        <Typography className="stat-item__label">App Store Rating</Typography>
                                    </Box>
                                    <Box className="stat-item">
                                        <Typography className="stat-item__number">50k+</Typography>
                                        <Typography className="stat-item__label">Active Users</Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box className="phone-mockup-container">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                >
                                    <Box className="phone-mockup">
                                        <Box className="phone-mockup__screen">
                                            <Box className="phone-mockup__content">
                                                <Smartphone size={40} color="rgba(255,255,255,0.2)" />
                                                <Box className="phone-mockup__ui-item" sx={{ width: '80%' }} />
                                                <Box className="phone-mockup__ui-item" sx={{ width: '100%' }} />
                                                <Box className="phone-mockup__ui-item" sx={{ width: '40%' }} />
                                                
                                                <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
                                                    <Box className="phone-mockup__ui-item" sx={{ width: '30%', height: '60px' }} />
                                                    <Box className="phone-mockup__ui-item" sx={{ width: '30%', height: '60px' }} />
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Floating Cards */}
                                        <motion.div 
                                            className="floating-card floating-card--1"
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Box className="floating-card__icon" sx={{ background: 'rgba(67, 97, 238, 0.1)', color: '#4361EE' }}>
                                                <Calendar size={16} />
                                            </Box>
                                            <Typography className="floating-card__title">Class Booked</Typography>
                                            <Typography className="floating-card__desc">Yoga Flow @ 8:00 AM</Typography>
                                        </motion.div>

                                        <motion.div 
                                            className="floating-card floating-card--2"
                                            animate={{ y: [0, 15, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        >
                                            <Box className="floating-card__icon" sx={{ background: 'rgba(230, 57, 70, 0.1)', color: '#E63946' }}>
                                                <TrendingUp size={16} />
                                            </Box>
                                            <Typography className="floating-card__title">New PR!</Typography>
                                            <Typography className="floating-card__desc">Deadlift: 140kg</Typography>
                                        </motion.div>

                                        <motion.div 
                                            className="floating-card floating-card--3"
                                            animate={{ y: [0, -12, 0] }}
                                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        >
                                            <Box className="floating-card__icon" sx={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                                <CheckCircle size={16} />
                                            </Box>
                                            <Typography className="floating-card__title">Paid</Typography>
                                            <Typography className="floating-card__desc">Monthly Membership</Typography>
                                        </motion.div>
                                    </Box>
                                </motion.div>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box className="static-page__features">
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <motion.div 
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Box className="feature-card__icon">
                                    <Calendar size={32} />
                                </Box>
                                <Typography className="feature-card__title">Easy Booking</Typography>
                                <Typography className="feature-card__text">
                                    One-tap class registration and personal training scheduling.
                                </Typography>
                            </motion.div>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <motion.div 
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <Box className="feature-card__icon" sx={{ background: 'rgba(67, 97, 238, 0.1)', color: '#4361EE' }}>
                                    <CreditCard size={32} />
                                </Box>
                                <Typography className="feature-card__title">Seamless Payments</Typography>
                                <Typography className="feature-card__text">
                                    Manage memberships, buy credits, and pay invoices instantly.
                                </Typography>
                            </motion.div>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <motion.div 
                                className="feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <Box className="feature-card__icon" sx={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                    <TrendingUp size={32} />
                                </Box>
                                <Typography className="feature-card__title">Progress Tracking</Typography>
                                <Typography className="feature-card__text">
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
