import { Box, Typography, Container, Avatar } from '@mui/material';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Target,
    Eye,
    Heart,
    Users,
    Lightbulb,
    Shield,
    Rocket,
    Award,
    MapPin,
    Calendar,
    Linkedin,
    Twitter,
    Quote
} from 'lucide-react';
import './StaticPages.css';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

// Value card component
function ValueCard({ icon: Icon, title, description, color, delay }: { 
    icon: any; 
    title: string; 
    description: string; 
    color: string; 
    delay: number 
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
        <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            sx={{
                p: 3,
                borderRadius: '16px',
                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                    borderColor: color,
                    boxShadow: `0 12px 32px ${color}15`
                }
            }}
        >
            <Box sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                background: `${color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
            }}>
                <Icon size={22} color={color} />
            </Box>
            <Typography sx={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: isDark ? 'white' : '#0F172A',
                mb: 0.5
            }}>
                {title}
            </Typography>
            <Typography sx={{ 
                fontSize: '13px', 
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                lineHeight: 1.6
            }}>
                {description}
            </Typography>
        </MotionBox>
    );
}

// Team member card
function TeamMember({ name, role, image, bio, delay }: { 
    name: string; 
    role: string; 
    image: string;
    bio: string;
    delay: number 
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
        <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: '20px',
                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: '#DC2626',
                    boxShadow: '0 12px 32px rgba(220, 38, 38, 0.1)'
                }
            }}
        >
            <Avatar
                src={image}
                sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    border: '3px solid',
                    borderColor: isDark ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)',
                    fontSize: '28px',
                    fontWeight: 700,
                    bgcolor: 'rgba(220, 38, 38, 0.1)',
                    color: '#DC2626'
                }}
            >
                {name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Typography sx={{ 
                fontSize: '17px', 
                fontWeight: 700, 
                color: isDark ? 'white' : '#0F172A',
                mb: 0.5
            }}>
                {name}
            </Typography>
            <Typography sx={{ 
                fontSize: '13px', 
                color: '#DC2626',
                fontWeight: 600,
                mb: 1.5
            }}>
                {role}
            </Typography>
            <Typography sx={{ 
                fontSize: '13px', 
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                lineHeight: 1.6
            }}>
                {bio}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 2 }}>
                <Box 
                    component="a" 
                    href="#"
                    sx={{ 
                        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#DC2626' }
                    }}
                >
                    <Linkedin size={16} />
                </Box>
                <Box 
                    component="a" 
                    href="#"
                    sx={{ 
                        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#DC2626' }
                    }}
                >
                    <Twitter size={16} />
                </Box>
            </Box>
        </MotionBox>
    );
}

// Timeline milestone
function Milestone({ year, title, description, delay }: { 
    year: string; 
    title: string; 
    description: string; 
    delay: number 
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    
    return (
        <MotionBox
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            sx={{
                display: 'flex',
                gap: 3,
                position: 'relative',
                pb: 4,
                '&:last-child': { pb: 0 },
                '&:not(:last-child)::before': {
                    content: '""',
                    position: 'absolute',
                    left: 15,
                    top: 36,
                    bottom: 0,
                    width: 2,
                    background: isDark ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.15)'
                }
            }}
        >
            <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                zIndex: 1
            }}>
                <Calendar size={14} color="white" />
            </Box>
            <Box sx={{ flex: 1, pt: 0.25 }}>
                <Typography sx={{ 
                    fontSize: '12px', 
                    color: '#DC2626',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    mb: 0.5
                }}>
                    {year}
                </Typography>
                <Typography sx={{ 
                    fontSize: '16px', 
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

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    const values = [
        { 
            icon: Lightbulb, 
            title: "Innovation First", 
            description: "We constantly push boundaries to deliver cutting-edge solutions that keep our users ahead.",
            color: "#F59E0B"
        },
        { 
            icon: Users, 
            title: "Customer Obsessed", 
            description: "Every feature we build starts with understanding real problems gym owners face daily.",
            color: "#DC2626"
        },
        { 
            icon: Shield, 
            title: "Trust & Security", 
            description: "Your data is sacred. We employ enterprise-grade security to protect every byte.",
            color: "#10B981"
        },
        { 
            icon: Heart, 
            title: "Passion for Fitness", 
            description: "We're not just tech people—we're fitness enthusiasts who understand your world.",
            color: "#EC4899"
        }
    ];

    const team = [
        { 
            name: "Aryan Sharma", 
            role: "Founder & CEO", 
            image: "",
            bio: "Former gym owner turned tech entrepreneur. 8+ years in fitness industry."
        },
        { 
            name: "Priya Patel", 
            role: "CTO", 
            image: "",
            bio: "Ex-Google engineer with expertise in scalable cloud architecture."
        },
        { 
            name: "Rahul Mehta", 
            role: "Head of Product", 
            image: "",
            bio: "Product leader passionate about crafting intuitive user experiences."
        },
        { 
            name: "Sneha Reddy", 
            role: "Head of Customer Success", 
            image: "",
            bio: "Dedicated to ensuring every gym succeeds with AthlonX."
        }
    ];

    const milestones = [
        { year: "2023", title: "The Idea", description: "AthlonX was born from firsthand frustration managing a local gym with spreadsheets and scattered tools." },
        { year: "2024", title: "First Launch", description: "Released MVP to 10 beta gyms. Learned, iterated, and rebuilt based on real feedback." },
        { year: "2025", title: "Rapid Growth", description: "Scaled to 500+ gyms across India. Launched trainer portal and advanced analytics." },
        { year: "2026", title: "The Future", description: "Expanding globally. Building AI-powered insights and mobile-first experiences." }
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: isDark ? '#0A0A0A' : '#F8FAFC',
            position: 'relative'
        }}>
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
            
            {/* Background Glow */}
            <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <Box sx={{
                    position: 'absolute',
                    top: '5%',
                    right: '10%',
                    width: '40vw',
                    height: '40vw',
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.06) 0%, transparent 70%)',
                    filter: 'blur(80px)'
                }} />
            </Box>

            <main style={{ position: 'relative', zIndex: 1 }}>
                
                {/* Hero - Who We Are */}
                <Box sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 } }}>
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center' }}>
                            <MotionBox
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Typography sx={{ 
                                    fontSize: '12px', 
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    mb: 2
                                }}>
                                    About Us
                                </Typography>
                            </MotionBox>
                            
                            <MotionTypography
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                variant="h1" 
                                sx={{ 
                                    fontSize: { xs: '32px', sm: '42px', md: '52px' }, 
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    mb: 3,
                                    color: isDark ? 'white' : '#0F172A',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                We're Building the Future of{' '}
                                <Box 
                                    component="span" 
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #DC2626 0%, #F97316 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Gym Management
                                </Box>
                            </MotionTypography>
                            
                            <MotionTypography
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                sx={{ 
                                    fontSize: { xs: '15px', md: '17px' }, 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', 
                                    maxWidth: 600, 
                                    mx: 'auto',
                                    lineHeight: 1.8
                                }}
                            >
                                AthlonX started with a simple question: Why is running a gym still so complicated? 
                                We're a team of fitness enthusiasts and technologists on a mission to change that.
                            </MotionTypography>
                        </Box>
                    </Container>
                </Box>

                {/* Our Story */}
                <Box sx={{ py: { xs: 6, md: 10 }, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: { xs: 4, md: 8 },
                            alignItems: 'center'
                        }}>
                            <MotionBox
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <Typography sx={{ 
                                    fontSize: '12px', 
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 2
                                }}>
                                    Our Story
                                </Typography>
                                <Typography variant="h2" sx={{ 
                                    fontSize: { xs: '26px', md: '32px' }, 
                                    fontWeight: 800,
                                    lineHeight: 1.2,
                                    mb: 3,
                                    color: isDark ? 'white' : '#0F172A'
                                }}>
                                    Born from Real Frustration
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '15px', 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.8,
                                    mb: 2
                                }}>
                                    In 2023, our founder Aryan was running a 200-member gym in Mumbai. Every day was 
                                    a struggle—member data in Excel, payments tracked on paper, trainers coordinating 
                                    via WhatsApp groups. Hours wasted on admin instead of helping members achieve their goals.
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '15px', 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.8,
                                    mb: 2
                                }}>
                                    The existing software solutions were either too expensive, too complex, or built by 
                                    people who had never stepped inside a gym. So we decided to build something different.
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '15px', 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.8
                                }}>
                                    AthlonX is the platform we wished existed—powerful enough for large chains, 
                                    simple enough for a single-location gym, and affordable for everyone in between.
                                </Typography>
                            </MotionBox>
                            
                            <MotionBox
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                                    position: 'relative'
                                }}
                            >
                                <Quote size={32} color="#DC2626" style={{ opacity: 0.3, marginBottom: 12 }} />
                                <Typography sx={{ 
                                    fontSize: '18px', 
                                    fontWeight: 500,
                                    fontStyle: 'italic',
                                    color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                                    lineHeight: 1.7,
                                    mb: 3
                                }}>
                                    "I spent more time managing my gym than actually helping members get fit. 
                                    That's when I knew something had to change. AthlonX is the solution I built 
                                    for myself—and now for thousands of gym owners like me."
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        bgcolor: 'rgba(220, 38, 38, 0.1)',
                                        color: '#DC2626',
                                        fontWeight: 700
                                    }}>
                                        AS
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '15px', color: isDark ? 'white' : '#0F172A' }}>
                                            Aryan Sharma
                                        </Typography>
                                        <Typography sx={{ fontSize: '13px', color: '#DC2626' }}>
                                            Founder & CEO
                                        </Typography>
                                    </Box>
                                </Box>
                            </MotionBox>
                        </Box>
                    </Container>
                </Box>

                {/* Mission & Vision */}
                <Box sx={{ py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="lg">
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 3
                        }}>
                            <MotionBox
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                sx={{
                                    p: 4,
                                    borderRadius: '20px',
                                    background: isDark ? 'rgba(220, 38, 38, 0.05)' : 'rgba(220, 38, 38, 0.03)',
                                    border: `1px solid ${isDark ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)'}`,
                                }}
                            >
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
                                }}>
                                    <Target size={26} color="white" />
                                </Box>
                                <Typography sx={{ 
                                    fontSize: '12px', 
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 1
                                }}>
                                    Our Mission
                                </Typography>
                                <Typography variant="h3" sx={{ 
                                    fontSize: '22px', 
                                    fontWeight: 800,
                                    color: isDark ? 'white' : '#0F172A',
                                    mb: 2
                                }}>
                                    Empower Every Gym to Thrive
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '15px', 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.7
                                }}>
                                    We exist to remove the operational burden from fitness businesses, so owners 
                                    and trainers can focus on what matters most—transforming lives through fitness.
                                </Typography>
                            </MotionBox>
                            
                            <MotionBox
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                                sx={{
                                    p: 4,
                                    borderRadius: '20px',
                                    background: isDark ? 'rgba(249, 115, 22, 0.05)' : 'rgba(249, 115, 22, 0.03)',
                                    border: `1px solid ${isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.1)'}`,
                                }}
                            >
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)'
                                }}>
                                    <Eye size={26} color="white" />
                                </Box>
                                <Typography sx={{ 
                                    fontSize: '12px', 
                                    color: '#F97316',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 1
                                }}>
                                    Our Vision
                                </Typography>
                                <Typography variant="h3" sx={{ 
                                    fontSize: '22px', 
                                    fontWeight: 800,
                                    color: isDark ? 'white' : '#0F172A',
                                    mb: 2
                                }}>
                                    The Operating System for Fitness
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '15px', 
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    lineHeight: 1.7
                                }}>
                                    We envision a world where every fitness business, from a garage gym to a 
                                    50-location chain, runs on AthlonX—the universal platform for fitness operations.
                                </Typography>
                            </MotionBox>
                        </Box>
                    </Container>
                </Box>

                {/* Our Values */}
                <Box sx={{ py: { xs: 6, md: 10 }, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography sx={{ 
                                fontSize: '12px', 
                                color: '#DC2626',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                mb: 2
                            }}>
                                What Drives Us
                            </Typography>
                            <Typography variant="h2" sx={{ 
                                fontSize: { xs: '26px', md: '34px' }, 
                                fontWeight: 800,
                                color: isDark ? 'white' : '#0F172A'
                            }}>
                                Our Core Values
                            </Typography>
                        </Box>
                        
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 2
                        }}>
                            {values.map((value, index) => (
                                <ValueCard key={index} {...value} delay={index * 0.1} />
                            ))}
                        </Box>
                    </Container>
                </Box>

                {/* Journey Timeline */}
                <Box sx={{ py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography sx={{ 
                                fontSize: '12px', 
                                color: '#DC2626',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                mb: 2
                            }}>
                                Our Journey
                            </Typography>
                            <Typography variant="h2" sx={{ 
                                fontSize: { xs: '26px', md: '34px' }, 
                                fontWeight: 800,
                                color: isDark ? 'white' : '#0F172A'
                            }}>
                                Key Milestones
                            </Typography>
                        </Box>
                        
                        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                            {milestones.map((milestone, index) => (
                                <Milestone key={index} {...milestone} delay={index * 0.15} />
                            ))}
                        </Box>
                    </Container>
                </Box>

                {/* Team Section */}
                <Box sx={{ py: { xs: 6, md: 10 }, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Container maxWidth="lg">
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography sx={{ 
                                fontSize: '12px', 
                                color: '#DC2626',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                mb: 2
                            }}>
                                The People Behind AthlonX
                            </Typography>
                            <Typography variant="h2" sx={{ 
                                fontSize: { xs: '26px', md: '34px' }, 
                                fontWeight: 800,
                                color: isDark ? 'white' : '#0F172A',
                                mb: 1
                            }}>
                                Meet Our Team
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '15px', 
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                maxWidth: 500,
                                mx: 'auto'
                            }}>
                                A passionate group of fitness enthusiasts, engineers, and designers united by one goal.
                            </Typography>
                        </Box>
                        
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 2
                        }}>
                            {team.map((member, index) => (
                                <TeamMember key={index} {...member} delay={index * 0.1} />
                            ))}
                        </Box>
                    </Container>
                </Box>

                {/* Location / Contact CTA */}
                <Box sx={{ py: { xs: 6, md: 10 } }}>
                    <Container maxWidth="md">
                        <MotionBox 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            sx={{
                                p: { xs: 4, md: 5 },
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(249,115,22,0.05) 100%)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                                textAlign: 'center'
                            }}
                        >
                            <MapPin size={32} color="#DC2626" style={{ marginBottom: 12 }} />
                            <Typography variant="h3" sx={{ 
                                fontSize: '22px', 
                                fontWeight: 800,
                                color: isDark ? 'white' : '#0F172A',
                                mb: 1
                            }}>
                                Based in Mumbai, Building for the World
                            </Typography>
                            <Typography sx={{ 
                                fontSize: '15px', 
                                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                mb: 3,
                                maxWidth: 450,
                                mx: 'auto',
                                lineHeight: 1.7
                            }}>
                                Our headquarters are in Mumbai, India, but our vision is global. 
                                We're here to help gyms everywhere succeed.
                            </Typography>
                            <Box 
                                component="a"
                                href="/contact"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    color: '#DC2626',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        gap: 1.5
                                    }
                                }}
                            >
                                Get in touch <Rocket size={16} />
                            </Box>
                        </MotionBox>
                    </Container>
                </Box>
            </main>
            
            <Footer />
        </Box>
    );
}
