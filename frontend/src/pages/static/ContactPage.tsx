import { Box, Typography, Container, TextField, Button, Grid, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, MessageSquare, MapPin, Clock, Globe, ArrowRight } from 'lucide-react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import ScrollProgress from '../../components/landing/ScrollProgress';
import { useTheme } from '../../contexts/ThemeContext';
import './StaticPages.css';

const MotionBox = motion(Box);

const contactMethods = [
    {
        icon: Mail,
        title: 'Email Us',
        value: 'sales@athlonx.com',
        description: 'For sales, partnerships, and general inquiries.',
        color: '#E63946',
        delay: 0.1
    },
    {
        icon: MessageSquare,
        title: 'Live Chat',
        value: 'Available 24/7',
        description: 'Get immediate help from our support team.',
        color: '#FF9F1C',
        delay: 0.2
    },
    {
        icon: Phone,
        title: 'Call Us',
        value: '+91 98765 43210',
        description: 'Mon-Fri from 9am to 6pm IST.',
        color: '#00F5FF',
        delay: 0.3
    }
];

export default function ContactPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box className="static-page">
            <ScrollProgress />
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
                        <Grid container spacing={8} alignItems="center">
                            <Grid size={{ xs: 12, md: 5 }}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <Chip 
                                        label="Contact Us" 
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
                                            fontSize: { xs: '40px', md: '64px' },
                                            fontWeight: 900,
                                            mb: 3,
                                            lineHeight: 1,
                                            color: isDark ? 'white' : '#0F172A'
                                        }}
                                    >
                                        Let's Build the{' '}
                                        <Box component="span" sx={{ color: '#E63946' }}>Future</Box>
                                        {' '}Together.
                                    </Typography>
                                    <Typography sx={{ 
                                        fontSize: '18px',
                                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                        mb: 5,
                                        lineHeight: 1.6,
                                        maxWidth: '450px'
                                    }}>
                                        Have questions about our platform? Our team of gym management experts is ready to help you optimize your business.
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {contactMethods.map((method, index) => (
                                            <Box key={index} sx={{ display: 'flex', gap: 2.5 }}>
                                                <Box sx={{ 
                                                    p: 1.5, 
                                                    borderRadius: '16px', 
                                                    bgcolor: `${method.color}15`,
                                                    color: method.color,
                                                    display: 'flex',
                                                    height: 'fit-content'
                                                }}>
                                                    <method.icon size={28} />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ 
                                                        fontSize: '14px', 
                                                        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', 
                                                        fontWeight: 700, 
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        mb: 0.5
                                                    }}>
                                                        {method.title}
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 800, fontSize: '18px', color: isDark ? 'white' : '#0F172A', mb: 0.5 }}>
                                                        {method.value}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)' }}>
                                                        {method.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </motion.div>
                            </Grid>

                            <Grid size={{ xs: 12, md: 7 }}>
                                <MotionBox
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    sx={{
                                        p: { xs: 3, md: 5 },
                                        borderRadius: '32px',
                                        background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: isDark ? 'none' : '0 20px 40px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Typography sx={{ 
                                        fontSize: '24px', 
                                        fontWeight: 800, 
                                        mb: 4,
                                        color: isDark ? 'white' : '#0F172A'
                                    }}>
                                        Send us a Message
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField 
                                                fullWidth 
                                                label="Full Name" 
                                                placeholder="John Doe"
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '16px',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                        '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                                                        '&.Mui-focused fieldset': { borderColor: '#E63946' }
                                                    },
                                                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
                                                    '& .MuiOutlinedInput-input': { color: isDark ? 'white' : '#0F172A' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField 
                                                fullWidth 
                                                label="Work Email" 
                                                placeholder="john@gym.com"
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '16px',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                        '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                                                        '&.Mui-focused fieldset': { borderColor: '#E63946' }
                                                    },
                                                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
                                                    '& .MuiOutlinedInput-input': { color: isDark ? 'white' : '#0F172A' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField 
                                                fullWidth 
                                                label="Gym Name" 
                                                placeholder="Elite Fitness Center"
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '16px',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                        '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                                                        '&.Mui-focused fieldset': { borderColor: '#E63946' }
                                                    },
                                                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
                                                    '& .MuiOutlinedInput-input': { color: isDark ? 'white' : '#0F172A' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField 
                                                fullWidth 
                                                multiline 
                                                rows={5} 
                                                label="Tell us about your needs" 
                                                placeholder="I'm looking to manage 500+ members and 10 trainers..."
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '16px',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                                        '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                                                        '&.Mui-focused fieldset': { borderColor: '#E63946' }
                                                    },
                                                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
                                                    '& .MuiOutlinedInput-input': { color: isDark ? 'white' : '#0F172A' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                endIcon={<Send size={20} />}
                                                sx={{
                                                    py: 2,
                                                    borderRadius: '16px',
                                                    background: 'linear-gradient(135deg, #E63946 0%, #FF495C 100%)',
                                                    fontWeight: 800,
                                                    fontSize: '16px',
                                                    textTransform: 'none',
                                                    boxShadow: '0 10px 30px rgba(230, 57, 70, 0.3)',
                                                    '&:hover': { 
                                                        background: 'linear-gradient(135deg, #D32F2F 0%, #E63946 100%)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 15px 40px rgba(230, 57, 70, 0.4)'
                                                    }
                                                }}
                                            >
                                                Send Message
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </MotionBox>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* Bottom Section - Trust Indicators */}
                <Box sx={{ py: { xs: '60px', md: '100px' }, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            {[
                                { 
                                    icon: Clock, 
                                    title: 'Fast Response', 
                                    desc: 'Our team typically responds within 4 business hours for all sales inquiries.' 
                                },
                                { 
                                    icon: Globe, 
                                    title: 'Global Presence', 
                                    desc: 'Supporting gyms and fitness centers across 15+ countries worldwide.' 
                                },
                                { 
                                    icon: MapPin, 
                                    title: 'Headquarters', 
                                    desc: 'Innovation Hub, Bangalore, Karnataka, India - The Silicon Valley of Asia.' 
                                }
                            ].map((item, i) => (
                                <Grid size={{ xs: 12, md: 4 }} key={i}>
                                    <Box sx={{ 
                                        textAlign: 'center',
                                        p: 4,
                                        borderRadius: '24px',
                                        background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                                    }}>
                                        <Box sx={{ 
                                            width: 64, 
                                            height: 64, 
                                            borderRadius: '20px', 
                                            bgcolor: 'rgba(230, 57, 70, 0.05)',
                                            color: '#E63946',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3
                                        }}>
                                            <item.icon size={32} />
                                        </Box>
                                        <Typography sx={{ fontSize: '20px', fontWeight: 800, mb: 1, color: isDark ? 'white' : '#0F172A' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', lineHeight: 1.6 }}>
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
            </main>
            <Footer />
        </Box>
    );
}
