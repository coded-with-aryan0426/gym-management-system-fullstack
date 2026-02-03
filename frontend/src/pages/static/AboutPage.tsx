import { Box, Typography, Container, Button, Chip } from '@mui/material';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
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
    Clock,
    Target,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Zap,
    AlertTriangle,
    XCircle,
    ChevronDown,
    Sparkles,
    Building2,
    Rocket
} from 'lucide-react';
import './StaticPages.css';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

// Counter animation hook
function useCounter(end: number, duration: number = 2000, inView: boolean) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        if (!inView) return;
        
        let startTime: number;
        let animationFrame: number;
        
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };
        
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, inView]);
    
    return count;
}

// Stat counter component
function AnimatedStat({ value, suffix = '', label, icon: Icon }: { value: number; suffix?: string; label: string; icon: any }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const count = useCounter(value, 2000, isInView);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
        <MotionBox
            ref={ref}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            sx={{
                textAlign: 'center',
                p: 3,
            }}
        >
            <Icon size={28} color="#DC2626" style={{ marginBottom: 12 }} />
            <Typography sx={{ 
                fontSize: { xs: '36px', md: '48px' }, 
                fontWeight: 900, 
                color: '#DC2626',
                lineHeight: 1
            }}>
                {count}{suffix}
            </Typography>
            <Typography sx={{ 
                fontSize: '14px', 
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                fontWeight: 500,
                mt: 1
            }}>
                {label}
            </Typography>
        </MotionBox>
    );
}

// Section wrapper with scroll progress
function StorySection({ children, id }: { children: React.ReactNode; id: string }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);
    
    return (
        <MotionBox
            ref={ref}
            id={id}
            style={{ opacity, y }}
            sx={{ py: { xs: 8, md: 12 } }}
        >
            {children}
        </MotionBox>
    );
}

// Pain point card
function PainPoint({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
        <MotionBox
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay }}
            viewport={{ once: true }}
            sx={{
                display: 'flex',
                gap: 3,
                p: 3,
                borderRadius: '16px',
                background: isDark ? 'rgba(220, 38, 38, 0.05)' : 'rgba(220, 38, 38, 0.03)',
                border: `1px solid ${isDark ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.15)'}`,
                mb: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: '#DC2626',
                    transform: 'translateX(8px)'
                }
            }}
        >
            <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(220, 38, 38, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={24} color="#DC2626" />
            </Box>
            <Box>
                <Typography sx={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: isDark ? 'white' : '#0F172A',
                    mb: 0.5
                }}>
                    {title}
                </Typography>
                <Typography sx={{ 
                    fontSize: '14px', 
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    lineHeight: 1.6
                }}>
                    {description}
                </Typography>
            </Box>
        </MotionBox>
    );
}

// Solution feature card
function SolutionFeature({ icon: Icon, title, description, color, delay }: { icon: any; title: string; description: string; color: string; delay: number }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
        <MotionBox
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            sx={{
                p: 3,
                borderRadius: '20px',
                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                transition: 'all 0.3s ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    borderColor: color,
                    boxShadow: `0 20px 40px ${color}20`
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: color,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease'
                },
                '&:hover::before': {
                    transform: 'scaleX(1)'
                }
            }}
        >
            <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
            }}>
                <Icon size={24} color={color} />
            </Box>
            <Typography sx={{ 
                fontSize: '17px', 
                fontWeight: 700, 
                color: isDark ? 'white' : '#0F172A',
                mb: 1
            }}>
                {title}
            </Typography>
            <Typography sx={{ 
                fontSize: '14px', 
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                lineHeight: 1.6
            }}>
                {description}
            </Typography>
        </MotionBox>
    );
}

// Timeline step
function TimelineStep({ step, title, description, isLast, delay }: { step: number; title: string; description: string; isLast: boolean; delay: number }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    
    return (
        <MotionBox
            ref={ref}
            initial={{ opacity: 0, x: step % 2 === 0 ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay }}
            sx={{
                display: 'flex',
                gap: 3,
                position: 'relative',
                pb: isLast ? 0 : 4,
                '&::before': !isLast ? {
                    content: '""',
                    position: 'absolute',
                    left: 23,
                    top: 48,
                    bottom: 0,
                    width: 2,
                    background: `linear-gradient(to bottom, #DC2626, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'})`
                } : {}
            }}
        >
            <MotionBox
                animate={isInView ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, delay: delay + 0.3 }}
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
                    zIndex: 1
                }}
            >
                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '18px' }}>
                    {step}
                </Typography>
            </MotionBox>
            <Box sx={{ flex: 1, pt: 0.5 }}>
                <Typography sx={{ 
                    fontSize: '20px', 
                    fontWeight: 700, 
                    color: isDark ? 'white' : '#0F172A',
                    mb: 1
                }}>
                    {title}
                </Typography>
                <Typography sx={{ 
                    fontSize: '15px', 
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    lineHeight: 1.7
                }}>
                    {description}
                </Typography>
            </Box>
        </MotionBox>
    );
}

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { openAuthModal } = useAuthModal();
    const containerRef = useRef(null);
    
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    
    // Parallax values for hero
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
    const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);

    const painPoints = [
        { icon: XCircle, title: "Scattered Systems", description: "Member data in spreadsheets, payments in another app, schedules on paper—nothing talks to each other." },
        { icon: Clock, title: "Time-Consuming Admin", description: "Hours wasted on manual data entry, chasing payments, and coordinating schedules between staff." },
        { icon: AlertTriangle, title: "Missed Revenue", description: "Expired memberships slip through, no-shows go untracked, and renewal opportunities are lost." },
        { icon: Users, title: "Poor Member Experience", description: "Members can't easily book classes, check their progress, or manage their memberships online." }
    ];

    const solutions = [
        { icon: Users, title: "Unified Member Hub", description: "All member data, history, and interactions in one searchable dashboard.", color: "#DC2626" },
        { icon: Dumbbell, title: "Trainer Portal", description: "Dedicated workspace for trainers to manage clients and sessions.", color: "#F97316" },
        { icon: Calendar, title: "Smart Scheduling", description: "Automated class bookings with capacity limits and waitlists.", color: "#10B981" },
        { icon: CreditCard, title: "Payment Automation", description: "Recurring billing, renewal reminders, and financial tracking.", color: "#8B5CF6" },
        { icon: BarChart3, title: "Live Analytics", description: "Real-time insights on revenue, retention, and performance.", color: "#06B6D4" },
        { icon: Bell, title: "Auto Notifications", description: "Triggered alerts for expiry, payments, and class reminders.", color: "#F59E0B" }
    ];

    const timelineSteps = [
        { title: "Create Your Account", description: "Sign up takes 2 minutes. Enter your gym details and you're in. No credit card required to start." },
        { title: "Configure Your Gym", description: "Set up membership plans, class schedules, and staff access. Import existing member data with our migration tools." },
        { title: "Invite Your Team", description: "Add trainers and staff with role-based access. Each gets their own dashboard tailored to their responsibilities." },
        { title: "Go Live", description: "Start managing members, processing payments, and tracking everything from day one. Full support included." }
    ];

    return (
        <Box 
            ref={containerRef}
            sx={{ 
                minHeight: '100vh',
                background: isDark ? '#0A0A0A' : '#F8FAFC',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Progress Bar */}
            <MotionBox
                style={{ scaleX }}
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
                    transformOrigin: 'left',
                    zIndex: 9999
                }}
            />
            
            <Header />
            
            {/* Background Effects */}
            <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '-10%',
                    width: '50vw',
                    height: '50vw',
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '-10%',
                    width: '40vw',
                    height: '40vw',
                    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }} />
            </Box>

            <main style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section with Parallax */}
                <MotionBox
                    ref={heroRef}
                    style={{ y: heroY, opacity: heroOpacity }}
                    sx={{ 
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pt: { xs: 10, md: 0 },
                        position: 'relative'
                    }}
                >
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
                            <MotionBox
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Chip 
                                    icon={<Sparkles size={14} />}
                                    label="Gym Management Reimagined" 
                                    sx={{ 
                                        mb: 3, 
                                        bgcolor: 'rgba(220, 38, 38, 0.1)', 
                                        color: '#DC2626',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        border: '1px solid rgba(220, 38, 38, 0.3)',
                                        '& .MuiChip-icon': { color: '#DC2626' }
                                    }} 
                                />
                            </MotionBox>
                            
                            <MotionTypography
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                variant="h1" 
                                sx={{ 
                                    fontSize: { xs: '40px', sm: '56px', md: '72px' }, 
                                    fontWeight: 900,
                                    lineHeight: 1.05,
                                    mb: 3,
                                    color: isDark ? 'white' : '#0F172A',
                                    letterSpacing: '-0.03em'
                                }}
                            >
                                We Build Software That{' '}
                                <Box 
                                    component="span" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #DC2626 0%, #F97316 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Runs Gyms
                                </Box>
                            </MotionTypography>
                            
                            <MotionTypography
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                sx={{ 
                                    fontSize: { xs: '16px', md: '20px' }, 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', 
                                    maxWidth: 700, 
                                    mx: 'auto',
                                    lineHeight: 1.7,
                                    mb: 4
                                }}
                            >
                                AthlonX is the all-in-one platform for fitness businesses. Member management, 
                                trainer coordination, payments, and analytics—unified in a single powerful system.
                            </MotionTypography>
                            
                            <MotionBox
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}
                            >
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => openAuthModal('signup')}
                                    endIcon={<ArrowRight size={18} />}
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                                        py: 1.5, 
                                        px: 4, 
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
                                        '&:hover': { 
                                            boxShadow: '0 8px 30px rgba(220, 38, 38, 0.5)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    Start Free Trial
                                </Button>
                            </MotionBox>
                        </Box>
                    </Container>
                    
                    {/* Scroll indicator */}
                    <MotionBox
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        sx={{
                            position: 'absolute',
                            bottom: 40,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Typography sx={{ 
                            fontSize: '12px', 
                            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}>
                            Scroll to explore
                        </Typography>
                        <ChevronDown size={20} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} />
                    </MotionBox>
                </MotionBox>

                {/* The Problem Section */}
                <StorySection id="problem">
                    <Container maxWidth="lg">
                        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
                            <MotionTypography
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                sx={{ 
                                    fontSize: '13px', 
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 2
                                }}
                            >
                                The Problem
                            </MotionTypography>
                            <MotionTypography
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '40px' }, 
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Running a gym shouldn't feel like{' '}
                                <Box component="span" sx={{ color: '#DC2626' }}>juggling chaos</Box>
                            </MotionTypography>
                            <MotionTypography
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                viewport={{ once: true }}
                                sx={{ 
                                    fontSize: '17px', 
                                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.7
                                }}
                            >
                                Most gym owners spend more time on administration than growing their business. 
                                Disconnected tools, manual processes, and scattered data create friction at every step.
                            </MotionTypography>
                        </Box>
                        
                        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                            {painPoints.map((point, index) => (
                                <PainPoint key={index} {...point} delay={index * 0.1} />
                            ))}
                        </Box>
                    </Container>
                </StorySection>

                {/* The Solution Section */}
                <StorySection id="solution">
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <MotionTypography
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                sx={{ 
                                    fontSize: '13px', 
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 2
                                }}
                            >
                                Our Solution
                            </MotionTypography>
                            <MotionTypography
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '40px' }, 
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                One platform.{' '}
                                <Box component="span" sx={{ color: '#DC2626' }}>Everything connected.</Box>
                            </MotionTypography>
                            <MotionTypography
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                viewport={{ once: true }}
                                sx={{ 
                                    fontSize: '17px', 
                                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                    maxWidth: 600,
                                    mx: 'auto',
                                    lineHeight: 1.7
                                }}
                            >
                                AthlonX unifies every aspect of gym management into a single, 
                                intelligent system that works together seamlessly.
                            </MotionTypography>
                        </Box>
                        
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 3
                        }}>
                            {solutions.map((solution, index) => (
                                <SolutionFeature key={index} {...solution} delay={index * 0.1} />
                            ))}
                        </Box>
                    </Container>
                </StorySection>

                {/* Stats Section */}
                <Box sx={{ py: { xs: 6, md: 10 }, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 2
                        }}>
                            <AnimatedStat value={15} suffix=" min" label="Average Setup" icon={Clock} />
                            <AnimatedStat value={50} suffix="%" label="Time Saved" icon={TrendingUp} />
                            <AnimatedStat value={99} suffix="%" label="Uptime" icon={Shield} />
                            <AnimatedStat value={24} suffix="/7" label="Support" icon={Zap} />
                        </Box>
                    </Container>
                </Box>

                {/* How It Works - Timeline */}
                <StorySection id="how-it-works">
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <MotionTypography
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                sx={{ 
                                    fontSize: '13px', 
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 2
                                }}
                            >
                                Getting Started
                            </MotionTypography>
                            <MotionTypography
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '40px' }, 
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Up and running in{' '}
                                <Box component="span" sx={{ color: '#DC2626' }}>4 steps</Box>
                            </MotionTypography>
                        </Box>
                        
                        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                            {timelineSteps.map((step, index) => (
                                <TimelineStep 
                                    key={index}
                                    step={index + 1}
                                    title={step.title}
                                    description={step.description}
                                    isLast={index === timelineSteps.length - 1}
                                    delay={index * 0.15}
                                />
                            ))}
                        </Box>
                    </Container>
                </StorySection>

                {/* Trust Section */}
                <Box sx={{ py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="md">
                        <MotionBox
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            sx={{
                                p: { xs: 4, md: 5 },
                                borderRadius: '24px',
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                textAlign: 'center'
                            }}
                        >
                            <Typography sx={{ 
                                fontSize: '13px', 
                                color: '#DC2626',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                mb: 2
                            }}>
                                Built for Scale
                            </Typography>
                            <Typography sx={{ 
                                fontSize: { xs: '22px', md: '28px' }, 
                                fontWeight: 800,
                                color: isDark ? 'white' : '#0F172A',
                                mb: 2
                            }}>
                                Modern Technology Stack
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '15px',
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                lineHeight: 1.7,
                                mb: 3,
                                maxWidth: 500,
                                mx: 'auto'
                            }}>
                                Built on cloud infrastructure with industry-standard security. 
                                Your data is encrypted, backed up, and accessible from anywhere.
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'AWS'].map((tech) => (
                                    <Chip 
                                        key={tech}
                                        label={tech}
                                        size="small"
                                        sx={{
                                            bgcolor: isDark ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.08)',
                                            color: '#DC2626',
                                            fontWeight: 600,
                                            fontSize: '12px',
                                            border: '1px solid rgba(220, 38, 38, 0.2)'
                                        }}
                                    />
                                ))}
                            </Box>
                        </MotionBox>
                    </Container>
                </Box>

                {/* Final CTA */}
                <Box sx={{ py: { xs: 8, md: 12 } }}>
                    <Container maxWidth="md">
                        <MotionBox 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            sx={{
                                p: { xs: 5, md: 7 },
                                borderRadius: '32px',
                                background: 'linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(249,115,22,0.1) 50%, rgba(6,182,212,0.05) 100%)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <MotionBox
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                sx={{
                                    position: 'absolute',
                                    top: -100,
                                    right: -100,
                                    width: 300,
                                    height: 300,
                                    borderRadius: '50%',
                                    border: '1px solid rgba(220, 38, 38, 0.1)',
                                    pointerEvents: 'none'
                                }}
                            />
                            
                            <Rocket size={40} color="#DC2626" style={{ marginBottom: 16 }} />
                            
                            <Typography 
                                variant="h2" 
                                sx={{ 
                                    fontSize: { xs: '28px', md: '38px' }, 
                                    fontWeight: 900,
                                    mb: 2,
                                    color: isDark ? 'white' : '#0F172A'
                                }}
                            >
                                Ready to Transform Your Gym?
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '17px',
                                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                mb: 4,
                                maxWidth: 450,
                                mx: 'auto',
                                lineHeight: 1.7
                            }}>
                                Join gym owners who've streamlined their operations with AthlonX. 
                                Start your free trial today—no credit card required.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => openAuthModal('signup')}
                                    endIcon={<ArrowRight size={18} />}
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                                        py: 1.5, 
                                        px: 4, 
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
                                        '&:hover': { 
                                            boxShadow: '0 8px 30px rgba(220, 38, 38, 0.5)',
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
                                        fontSize: '15px',
                                        textTransform: 'none',
                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                                        color: isDark ? 'white' : '#0F172A',
                                        '&:hover': { 
                                            borderColor: '#DC2626',
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
