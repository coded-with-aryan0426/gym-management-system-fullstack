import { Box, Typography, Container, Grid, Button, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BoltIcon from '@mui/icons-material/Bolt';
import { useTheme } from '../../contexts/ThemeContext';
import './StaticPages.css';

const MotionBox = motion(Box);

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box className="static-page">
            <Header />
            
            {/* Background Energetic Accents */}
            <Box className="static-page__bg-accents">
                <Box className="static-page__glow-red" />
                <Box className="static-page__glow-orange" />
                <Box className="static-page__glow-cyan" />
            </Box>

            <main style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <Box className="static-page__hero">
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h1" className="static-page__title-energetic" sx={{ 
                                    fontSize: { xs: '32px', md: '48px' }, 
                                    mb: 2, 
                                    lineHeight: 1.1
                                }}>
                                    Built for the <br /> 
                                    <span style={{ color: '#E63946', WebkitTextFillColor: '#E63946' }}>Unstoppable.</span>
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: { xs: '16px', md: '18px' }, 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', 
                                    maxWidth: '700px', 
                                    mx: 'auto',
                                    lineHeight: 1.6,
                                    fontWeight: 500
                                }}>
                                    AthlonX isn't just a platform—it's high-octane fuel for your gym's engine. We stripped away the bloat to give you pure, unadulterated control.
                                </Typography>
                            </motion.div>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MotionBox
                                    whileHover={{ y: -5 }}
                                    className="static-page__card static-page__card--friction"
                                    sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}
                                >
                                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 3, opacity: 0.1 }}>
                                        <SpeedIcon sx={{ fontSize: '100px', color: '#00F5FF' }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 900, color: '#00F5FF' }}>The Friction</Typography>
                                    <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '17px', lineHeight: 1.7 }}>
                                        Legacy systems are slow, grey, and depressing. They suck the life out of your business with endless menus and broken workflows.
                                    </Typography>
                                </MotionBox>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MotionBox
                                    whileHover={{ y: -5 }}
                                    className="static-page__card static-page__card--fire"
                                    sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}
                                >
                                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 3, opacity: 0.1 }}>
                                        <FitnessCenterIcon sx={{ fontSize: '100px', color: '#E63946' }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 900, color: '#E63946' }}>The Fire</Typography>
                                    <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '17px', lineHeight: 1.7 }}>
                                        We engineered a command center that moves at the speed of thought. Bold, energetic, and lethal in its efficiency.
                                    </Typography>
                                </MotionBox>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* Bento Impact */}
                <Box sx={{ py: '100px' }}>
                    <Container maxWidth="lg">
                        <Box className="bento-grid">
                            <MotionBox
                                whileHover={{ scale: 1.01 }}
                                className="bento-item bento-item--large"
                            >
                                <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                                <Typography sx={{ color: '#FF9F1C', fontWeight: 900, mb: 2, fontSize: '14px', letterSpacing: '2px' }}>DATA-BACKED DOMINANCE</Typography>
                                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontSize: '32px', lineHeight: 1.2 }}>85% Admin <br />Reduction</Typography>
                                <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontSize: '15px', lineHeight: 1.5, maxWidth: '400px' }}>
                                    We didn't just save time; we eliminated the mundane. Our partners focus on what matters: the athletes.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#E63946', fontSize: '28px' }}>2.4k</Typography>
                                        <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Facilities</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#00F5FF', fontSize: '28px' }}>99.9%</Typography>
                                        <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Uptime</Typography>
                                    </Box>
                                </Box>
                            </MotionBox>

                            <MotionBox whileHover={{ scale: 1.01 }} className="bento-item bento-item--tall">
                                <Typography sx={{ fontSize: '18px', lineHeight: 1.6, color: isDark ? 'white' : '#0F172A', fontWeight: 600, fontStyle: 'italic', mb: 'auto' }}>
                                    "AthlonX is the pulse of our gym. The energy of the software matches the energy on our floor. It's fast, sharp, and undeniably powerful."
                                </Typography>
                                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#FF9F1C', width: 48, height: 48, fontWeight: 900, border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.1)' }}>MC</Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 900, fontSize: '16px', color: isDark ? 'white' : '#0F172A' }}>Marcus Chen</Typography>
                                        <Typography sx={{ color: '#FF9F1C', fontSize: '12px', fontWeight: 700 }}>CEO, IRONHAVEN GROUP</Typography>
                                    </Box>
                                </Box>
                            </MotionBox>

                            <MotionBox whileHover={{ scale: 1.02 }} className="bento-item bento-item--cyan" sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0, 245, 255, 0.1)', color: '#00F5FF', display: 'flex' }}>
                                    <SpeedIcon sx={{ fontSize: '32px' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 900, fontSize: '18px', color: isDark ? 'white' : '#0F172A' }}>Zero Friction</Typography>
                                    <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '13px' }}>Speed to action is our obsession.</Typography>
                                </Box>
                            </MotionBox>

                            <MotionBox whileHover={{ scale: 1.02 }} className="bento-item bento-item--red" sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(230, 57, 70, 0.1)', color: '#E63946', display: 'flex' }}>
                                    <GroupIcon sx={{ fontSize: '32px' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 900, fontSize: '18px', color: isDark ? 'white' : '#0F172A' }}>Legion Built</Typography>
                                    <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '13px' }}>The power of the community.</Typography>
                                </Box>
                            </MotionBox>
                        </Box>
                    </Container>
                </Box>

                {/* Timeline */}
                <Box sx={{ py: '100px' }}>
                    <Container maxWidth="md">
                        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 900, mb: 8, fontSize: '48px', color: isDark ? 'white' : '#0F172A' }}>
                            Our <span style={{ color: '#E63946' }}>Trajectory</span>
                        </Typography>
                        <Box className="timeline">
                            {[
                                { year: '2020', title: 'The Spark', desc: 'Born from a single terminal in a warehouse gym.', color: '#E63946' },
                                { year: '2022', title: 'Ignition', desc: 'Scaled to 500+ facilities with lightning-fast automation.', color: '#FF9F1C' },
                                { year: '2025', title: 'The Command', desc: 'Defining the gold standard for global gym operations.', color: '#00F5FF' }
                            ].map((item, index) => (
                                <Box key={index} className="timeline-item">
                                    <Box className="timeline-content">
                                        <Typography sx={{ color: item.color, fontWeight: 900, fontSize: '28px' }}>{item.year}</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: isDark ? 'white' : '#0F172A' }}>{item.title}</Typography>
                                        <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '16px' }}>{item.desc}</Typography>
                                    </Box>
                                    <Box className="timeline-dot" sx={{ bgcolor: item.color, boxShadow: `0 0 20px ${item.color}` }} />
                                </Box>
                            ))}
                        </Box>
                    </Container>
                </Box>

                {/* Founders */}
                <Box sx={{ py: '100px' }}>
                    <Container maxWidth="lg">
                        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 900, mb: 8, fontSize: '48px' }}>The Architects</Typography>
                        <Grid container spacing={4} justifyContent="center">
                            {[
                                { name: 'Alex Rivers', role: 'CTO & ARCHITECT', color: '#E63946', bio: 'Coding at the speed of sound. Former powerlifter.' },
                                { name: 'Sarah J. Thorne', role: 'PRODUCT CHIEF', color: '#00F5FF', bio: 'Ops veteran. Obsessed with user flow and friction removal.' }
                            ].map((founder, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                    <MotionBox
                                        whileHover={{ y: -10 }}
                                        className="founder-card"
                                        sx={{ '&:hover': { borderColor: founder.color } }}
                                    >
                                        <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 3, bgcolor: founder.color, fontSize: '32px', fontWeight: 900, boxShadow: `0 10px 30px ${founder.color}33` }}>
                                            {founder.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>{founder.name}</Typography>
                                        <Typography sx={{ color: founder.color, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '1px' }}>{founder.role}</Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6 }}>{founder.bio}</Typography>
                                    </MotionBox>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* CTA */}
                <Box sx={{ pb: '120px' }}>
                    <Container maxWidth="md">
                        <MotionBox 
                            whileHover={{ scale: 1.02 }}
                            className="cta-box-energetic"
                        >
                            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '28px', md: '36px' } }}>Unleash the Beast.</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '16px', maxWidth: '600px', mx: 'auto', fontWeight: 500 }}>
                                Don't settle for static. Get the energetic, high-performance command center your facility deserves.
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{ 
                                    background: 'white', 
                                    color: 'black',
                                    py: 1.5, 
                                    px: 4, 
                                    borderRadius: '12px',
                                    fontWeight: 900,
                                    fontSize: '16px',
                                    textTransform: 'none',
                                    '&:hover': { background: '#f0f0f0' }
                                }}
                            >
                                Join the Network
                            </Button>
                        </MotionBox>
                    </Container>
                </Box>
            </main>
            <Footer />
        </Box>
    );
}
