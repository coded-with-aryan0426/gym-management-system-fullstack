import { Box, Typography, Container, Grid, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, UserCheck, Bell, Globe, Mail, Clock } from 'lucide-react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import ScrollProgress from '../../components/landing/ScrollProgress';
import { useTheme } from '../../contexts/ThemeContext';
import './StaticPages.css';

const MotionBox = motion(Box);

const sections = [
    {
        icon: Eye,
        title: '1. Information We Collect',
        content: `We collect information that you provide directly to us when you create an account, such as your name, email address, phone number, and gym details. We also collect usage data, device information, and communication history to improve our services.`,
        color: '#E63946'
    },
    {
        icon: FileText,
        title: '2. How We Use Information',
        content: `Your data is used to provide and maintain our gym management platform, process your transactions, send technical notices, and respond to your comments or questions. We also use aggregated data for analytics and service optimization.`,
        color: '#FF9F1C'
    },
    {
        icon: Shield,
        title: '3. Data Security',
        content: `We implement industry-standard security measures including SSL encryption, secure database architectures, and regular security audits. Your sensitive information is protected both in transit and at rest using modern cryptographic protocols.`,
        color: '#00F5FF'
    },
    {
        icon: UserCheck,
        title: '4. Sharing of Information',
        content: `We do not sell your personal data. We may share information with your authorized gym owner, service providers who assist in our operations, or when required by law. All third-party providers are vetted for their privacy standards.`,
        color: '#10B981'
    },
    {
        icon: Lock,
        title: '5. Your Privacy Rights',
        content: `You have the right to access, update, or delete your personal information at any time. You can also object to processing or request data portability. Simply contact us or use the account settings in your dashboard.`,
        color: '#8B5CF6'
    },
    {
        icon: Bell,
        title: '6. Changes to Policy',
        content: `We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date at the top.`,
        color: '#F59E0B'
    }
];

export default function PrivacyPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box className="static-page">
            <ScrollProgress />
            <Header />
            
            {/* Background Accents */}
            <Box className="static-page__bg-accents">
                <Box className="static-page__glow-red" />
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
                                        bgcolor: 'rgba(0, 245, 255, 0.1)', 
                                        color: '#00F5FF',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        border: '1px solid rgba(0, 245, 255, 0.3)'
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
                                    Privacy Policy
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Clock size={16} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                                        <Typography sx={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                            Last Updated: Feb 3, 2026
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Globe size={16} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                                        <Typography sx={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                            Version 2.0
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

                        {/* Contact Support Card */}
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
                                Questions about your privacy?
                            </Typography>
                            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 3 }}>
                                We're here to help. Contact our dedicated privacy team for any concerns.
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Mail size={18} />}
                                href="mailto:privacy@athlonx.com"
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 4,
                                    borderColor: '#00F5FF',
                                    color: '#00F5FF',
                                    fontWeight: 700,
                                    '&:hover': {
                                        borderColor: '#00F5FF',
                                        bgcolor: 'rgba(0, 245, 255, 0.05)'
                                    }
                                }}
                            >
                                privacy@athlonx.com
                            </Button>
                        </MotionBox>
                    </Container>
                </Box>
            </main>
            <Footer />
        </Box>
    );
}
