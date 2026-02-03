import { Box, Typography, Container, Grid, Divider, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { FileText, Gavel, Scale, Ban, RefreshCw, AlertCircle, Clock, Globe, HelpCircle } from 'lucide-react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import './StaticPages.css';

const MotionBox = motion(Box);

const sections = [
    {
        icon: Gavel,
        title: '1. Acceptance of Terms',
        content: `By accessing or using AthlonX, you agree to be bound by these Terms of Service and all applicable laws and regulations. These terms constitute a legally binding agreement between you and AthlonX regarding your use of our platform.`,
        color: '#E63946'
    },
    {
        icon: Scale,
        title: '2. Use License',
        content: `Permission is granted to use our services for personal and commercial gym management purposes. You may not modify, copy, or attempt to decompile any software contained on the platform. This license automatically terminates if you violate any restrictions.`,
        color: '#FF9F1C'
    },
    {
        icon: RefreshCw,
        title: '3. Service Availability',
        content: `While we strive for 99.9% uptime, we do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the service with reasonable notice for maintenance, updates, or other business reasons.`,
        color: '#00F5FF'
    },
    {
        icon: AlertCircle,
        title: '4. Account Responsibilities',
        content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use or security breach.`,
        color: '#10B981'
    },
    {
        icon: Ban,
        title: '5. Limitation of Liability',
        content: `AthlonX shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use our services. Our total liability shall not exceed the amount paid by you for the service in the last 12 months.`,
        color: '#8B5CF6'
    },
    {
        icon: Globe,
        title: '6. Governing Law',
        content: `These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.`,
        color: '#F59E0B'
    }
];

export default function TermsPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box className="static-page">
            <Header />
            
            {/* Background Accents */}
            <Box className="static-page__bg-accents">
                <Box className="static-page__glow-orange" />
                <Box className="static-page__glow-cyan" />
            </Box>

            <main style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <Box className="static-page__hero" sx={{ pt: { xs: '120px', md: '140px' }, pb: { xs: '60px', md: '80px' } }}>
                    <Container maxWidth="md">
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Chip 
                                    label="Legal" 
                                    sx={{ 
                                        mb: 3, 
                                        bgcolor: 'rgba(255, 159, 28, 0.1)', 
                                        color: '#FF9F1C',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        border: '1px solid rgba(255, 159, 28, 0.3)'
                                    }} 
                                />
                                <Typography 
                                    variant="h1" 
                                    sx={{ 
                                        fontSize: { xs: '36px', md: '56px' }, 
                                        fontWeight: 900,
                                        mb: 3,
                                        color: isDark ? 'white' : '#0F172A'
                                    }}
                                >
                                    Terms of Service
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Clock size={16} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                                        <Typography sx={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                            Last Updated: Feb 3, 2026
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FileText size={16} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                                        <Typography sx={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                            Version 1.5
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Box>

                        <Divider sx={{ mb: 8, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sections.map((section, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                                        <Box sx={{ 
                                            p: 1.5, 
                                            borderRadius: '12px', 
                                            bgcolor: `${section.color}15`,
                                            color: section.color,
                                            display: 'flex',
                                            flexShrink: 0
                                        }}>
                                            <section.icon size={24} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ 
                                                fontWeight: 800, 
                                                mb: 2,
                                                fontSize: '22px',
                                                color: isDark ? 'white' : '#0F172A'
                                            }}>
                                                {section.title}
                                            </Typography>
                                            <Typography sx={{ 
                                                fontSize: '16px', 
                                                lineHeight: 1.8,
                                                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                                textAlign: 'justify'
                                            }}>
                                                {section.content}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MotionBox>
                            ))}
                        </Box>

                        {/* Help Center Card */}
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            sx={{
                                mt: 10,
                                p: 4,
                                borderRadius: '24px',
                                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                textAlign: 'center'
                            }}
                        >
                            <Typography sx={{ fontWeight: 800, fontSize: '20px', mb: 1, color: isDark ? 'white' : '#0F172A' }}>
                                Need clarification on our terms?
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 3 }}>
                                Our support team is here to help you understand your rights and responsibilities.
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<HelpCircle size={18} />}
                                href="/contact"
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 4,
                                    borderColor: '#FF9F1C',
                                    color: '#FF9F1C',
                                    fontWeight: 700,
                                    '&:hover': {
                                        borderColor: '#FF9F1C',
                                        bgcolor: 'rgba(255, 159, 28, 0.05)'
                                    }
                                }}
                            >
                                Contact Support
                            </Button>
                        </MotionBox>
                    </Container>
                </Box>
            </main>
            <Footer />
        </Box>
    );
}
