import { Box, Typography, Container, Grid, Button, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Users,
    Calendar,
    CreditCard,
    BarChart3,
    Dumbbell,
    Bell,
    Shield,
    Smartphone,
    Clock,
    Target,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Zap,
    Heart,
    Award
} from 'lucide-react';
import './StaticPages.css';

const MotionBox = motion(Box);

// Core features that the application actually provides
const coreFeatures = [
    {
        icon: Users,
        title: 'Member Management',
        description: 'Complete member profiles with attendance tracking, membership status, payment history, and personal progress notes.',
        color: '#E63946'
    },
    {
        icon: Dumbbell,
        title: 'Trainer Dashboard',
        description: 'Dedicated portal for trainers to manage their clients, schedule sessions, track progress, and communicate with members.',
        color: '#FF9F1C'
    },
    {
        icon: Calendar,
        title: 'Class Scheduling',
        description: 'Create and manage group classes, handle bookings, set capacity limits, and send automated reminders.',
        color: '#00F5FF'
    },
    {
        icon: CreditCard,
        title: 'Payment Processing',
        description: 'Automated billing, membership renewals, payment tracking, and financial reporting all in one place.',
        color: '#10B981'
    },
    {
        icon: BarChart3,
        title: 'Analytics & Reports',
        description: 'Real-time insights on revenue, member retention, class attendance, and business performance metrics.',
        color: '#8B5CF6'
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        description: 'Automated alerts for membership expiry, payment due, class reminders, and custom announcements.',
        color: '#F59E0B'
    }
];

// User types and their benefits
const userRoles = [
    {
        role: 'Gym Owners',
        icon: Target,
        benefits: [
            'Complete business overview dashboard',
            'Revenue and expense tracking',
            'Staff management and scheduling',
            'Member retention analytics',
            'Multi-location support'
        ],
        color: '#E63946'
    },
    {
        role: 'Trainers',
        icon: Award,
        benefits: [
            'Personal client management',
            'Session scheduling and tracking',
            'Progress notes and workout plans',
            'Direct messaging with members',
            'Performance reports'
        ],
        color: '#FF9F1C'
    },
    {
        role: 'Members',
        icon: Heart,
        benefits: [
            'Book classes and PT sessions',
            'Track workout progress',
            'View membership details',
            'Communicate with trainers',
            'Access workout history'
        ],
        color: '#00F5FF'
    }
];

// Real statistics about the platform
const platformStats = [
    { value: '15 min', label: 'Average Setup Time', icon: Clock },
    { value: '99.9%', label: 'Platform Uptime', icon: Shield },
    { value: '24/7', label: 'System Availability', icon: Zap },
    { value: '50%', label: 'Admin Time Saved', icon: TrendingUp }
];

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { openAuthModal } = useAuthModal();

    return (
        <Box className="static-page">
            <Header />
            
            {/* Background Accents */}
            <Box className="static-page__bg-accents">
                <Box className="static-page__glow-red" />
                <Box className="static-page__glow-orange" />
                <Box className="static-page__glow-cyan" />
            </Box>

            <main style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <Box className="static-page__hero" sx={{ pt: { xs: '120px', md: '140px' }, pb: { xs: '60px', md: '80px' } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Chip 
                                    label="Gym Management Software" 
                                    sx={{ 
                                        mb: 3, 
                                        bgcolor: 'rgba(230, 57, 70, 0.1)', 
                                        color: '#E63946',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        border: '1px solid rgba(230, 57, 70, 0.3)'
                                    }} 
                                />
                                <Typography 
                                    variant="h1" 
                                    sx={{ 
                                        fontSize: { xs: '36px', md: '56px' }, 
                                        fontWeight: 900,
                                        lineHeight: 1.1,
                                        mb: 3,
                                        color: isDark ? 'white' : '#0F172A'
                                    }}
                                >
                                    The Complete Platform for{' '}
                                    <Box component="span" sx={{ color: '#E63946' }}>
                                        Modern Gyms
                                    </Box>
                                </Typography>
                                <Typography 
                                    sx={{ 
                                        fontSize: { xs: '16px', md: '20px' }, 
                                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', 
                                        maxWidth: '800px', 
                                        mx: 'auto',
                                        lineHeight: 1.7,
                                        fontWeight: 400
                                    }}
                                >
                                    AthlonX brings together member management, trainer coordination, class scheduling, 
                                    and payment processing into one unified platform designed specifically for fitness businesses.
                                </Typography>
                            </motion.div>
                        </Box>

                        {/* Stats Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Grid container spacing={2} sx={{ mb: 8 }}>
                                {platformStats.map((stat, index) => (
                                    <Grid size={{ xs: 6, md: 3 }} key={index}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: '16px',
                                                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                textAlign: 'center',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    borderColor: '#E63946'
                                                }
                                            }}
                                        >
                                            <stat.icon size={24} color="#E63946" style={{ marginBottom: 8 }} />
                                            <Typography sx={{ fontSize: '28px', fontWeight: 900, color: isDark ? 'white' : '#0F172A' }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography sx={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Container>
                </Box>

                {/* Core Features Section */}
                <Box sx={{ py: { xs: '60px', md: '100px' } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography 
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '42px' }, 
                                    fontWeight: 900,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Everything You Need to{' '}
                                <Box component="span" sx={{ color: '#E63946' }}>Run Your Gym</Box>
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '18px', 
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                maxWidth: '600px',
                                mx: 'auto'
                            }}>
                                Six core modules working together to streamline every aspect of your fitness business.
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {coreFeatures.map((feature, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                    <MotionBox
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -8 }}
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            borderRadius: '24px',
                                            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                            transition: 'all 0.3s ease',
                                            cursor: 'default',
                                            '&:hover': {
                                                borderColor: feature.color,
                                                background: isDark 
                                                    ? `rgba(255,255,255,0.04)` 
                                                    : `rgba(0,0,0,0.03)`
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 3,
                                                background: `${feature.color}15`,
                                                color: feature.color
                                            }}
                                        >
                                            <feature.icon size={28} />
                                        </Box>
                                        <Typography sx={{ 
                                            fontSize: '20px', 
                                            fontWeight: 700, 
                                            mb: 1.5,
                                            color: isDark ? 'white' : '#0F172A'
                                        }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '15px', 
                                            lineHeight: 1.7,
                                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                                        }}>
                                            {feature.description}
                                        </Typography>
                                    </MotionBox>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* User Roles Section */}
                <Box sx={{ py: { xs: '60px', md: '100px' }, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography 
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '42px' }, 
                                    fontWeight: 900,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Built for{' '}
                                <Box component="span" sx={{ color: '#FF9F1C' }}>Everyone</Box>
                                {' '}in Your Gym
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '18px', 
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                maxWidth: '600px',
                                mx: 'auto'
                            }}>
                                Dedicated dashboards and features tailored for each user type.
                            </Typography>
                        </Box>

                        <Grid container spacing={4}>
                            {userRoles.map((role, index) => (
                                <Grid size={{ xs: 12, md: 4 }} key={index}>
                                    <MotionBox
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.15 }}
                                        viewport={{ once: true }}
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            borderRadius: '24px',
                                            background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: role.color,
                                                transform: 'translateY(-4px)'
                                            }
                                        }}
                                    >
                                        {/* Accent gradient */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: role.color
                                            }}
                                        />
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: `${role.color}15`,
                                                    color: role.color
                                                }}
                                            >
                                                <role.icon size={24} />
                                            </Box>
                                            <Typography sx={{ 
                                                fontSize: '22px', 
                                                fontWeight: 800,
                                                color: isDark ? 'white' : '#0F172A'
                                            }}>
                                                {role.role}
                                            </Typography>
                                        </Box>

                                        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                                            {role.benefits.map((benefit, i) => (
                                                <Box 
                                                    component="li" 
                                                    key={i}
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'flex-start', 
                                                        gap: 1.5,
                                                        mb: 2,
                                                        '&:last-child': { mb: 0 }
                                                    }}
                                                >
                                                    <CheckCircle size={18} color={role.color} style={{ flexShrink: 0, marginTop: 2 }} />
                                                    <Typography sx={{ 
                                                        fontSize: '15px',
                                                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                                        lineHeight: 1.5
                                                    }}>
                                                        {benefit}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </MotionBox>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>

                {/* How It Works Section */}
                <Box sx={{ py: { xs: '60px', md: '100px' } }}>
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography 
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '42px' }, 
                                    fontWeight: 900,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Get Started in{' '}
                                <Box component="span" sx={{ color: '#00F5FF' }}>3 Simple Steps</Box>
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {[
                                { 
                                    step: '01', 
                                    title: 'Create Your Account', 
                                    desc: 'Sign up with your gym details. Our onboarding wizard guides you through the initial setup.',
                                    color: '#E63946'
                                },
                                { 
                                    step: '02', 
                                    title: 'Add Your Team & Members', 
                                    desc: 'Import existing member data or start fresh. Invite trainers and staff to their dedicated portals.',
                                    color: '#FF9F1C'
                                },
                                { 
                                    step: '03', 
                                    title: 'Start Managing', 
                                    desc: 'Begin scheduling classes, tracking payments, and monitoring your gym\'s performance from day one.',
                                    color: '#00F5FF'
                                }
                            ].map((item, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 4,
                                        p: 4,
                                        borderRadius: '20px',
                                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: item.color
                                        }
                                    }}
                                >
                                    <Typography sx={{ 
                                        fontSize: '48px', 
                                        fontWeight: 900, 
                                        color: item.color,
                                        lineHeight: 1,
                                        opacity: 0.8
                                    }}>
                                        {item.step}
                                    </Typography>
                                    <Box>
                                        <Typography sx={{ 
                                            fontSize: '22px', 
                                            fontWeight: 700, 
                                            mb: 1,
                                            color: isDark ? 'white' : '#0F172A'
                                        }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ 
                                            fontSize: '16px',
                                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                            lineHeight: 1.7
                                        }}>
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </MotionBox>
                            ))}
                        </Box>
                    </Container>
                </Box>

                {/* Tech Stack / Trust Section */}
                <Box sx={{ py: { xs: '60px', md: '80px' }, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontSize: { xs: '24px', md: '32px' }, 
                                        fontWeight: 900,
                                        mb: 3,
                                        color: isDark ? 'white' : '#0F172A'
                                    }}
                                >
                                    Built with Modern Technology
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '16px',
                                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.8,
                                    mb: 3
                                }}>
                                    AthlonX is built on a robust, scalable architecture designed for reliability and speed. 
                                    Your data is secured with industry-standard encryption, and our cloud infrastructure 
                                    ensures you can access your gym management tools from anywhere.
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Cloud Hosted'].map((tech) => (
                                        <Chip 
                                            key={tech}
                                            label={tech}
                                            size="small"
                                            sx={{
                                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                                fontWeight: 500,
                                                fontSize: '13px'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: 2 
                                }}>
                                    {[
                                        { icon: Shield, label: 'Secure Data', desc: 'End-to-end encryption' },
                                        { icon: Smartphone, label: 'Responsive', desc: 'Works on all devices' },
                                        { icon: Zap, label: 'Fast', desc: 'Optimized performance' },
                                        { icon: Clock, label: 'Reliable', desc: '99.9% uptime SLA' }
                                    ].map((item, i) => (
                                        <Box 
                                            key={i}
                                            sx={{
                                                p: 3,
                                                borderRadius: '16px',
                                                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                textAlign: 'center'
                                            }}
                                        >
                                            <item.icon size={28} color="#E63946" style={{ marginBottom: 8 }} />
                                            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: isDark ? 'white' : '#0F172A' }}>
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                                {item.desc}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* CTA Section */}
                <Box sx={{ py: { xs: '60px', md: '100px' } }}>
                    <Container maxWidth="md">
                        <MotionBox 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            sx={{
                                p: { xs: 4, md: 6 },
                                borderRadius: '32px',
                                background: 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(255,159,28,0.1) 50%, rgba(0,245,255,0.05) 100%)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Typography 
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '40px' }, 
                                    fontWeight: 900,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Ready to Transform Your Gym?
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '18px',
                                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                mb: 4,
                                maxWidth: '500px',
                                mx: 'auto'
                            }}>
                                Join gym owners who have streamlined their operations with AthlonX. Start your free trial today.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => openAuthModal('signup')}
                                    endIcon={<ArrowRight size={20} />}
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #E63946 0%, #FF495C 100%)',
                                        py: 1.5, 
                                        px: 4, 
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)',
                                        '&:hover': { 
                                            boxShadow: '0 8px 30px rgba(230, 57, 70, 0.4)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    Start Free Trial
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large"
                                    href="/contact"
                                    sx={{ 
                                        py: 1.5, 
                                        px: 4, 
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        textTransform: 'none',
                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                                        color: isDark ? 'white' : '#0F172A',
                                        '&:hover': { 
                                            borderColor: '#E63946',
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                >
                                    Contact Sales
                                </Button>
                            </Box>
                        </MotionBox>
                    </Container>
                </Box>
            </main>
            <Footer />
        </Box>
    );
}
