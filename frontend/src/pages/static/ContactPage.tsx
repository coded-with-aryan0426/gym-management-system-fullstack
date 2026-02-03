import { Box, Typography, Container, TextField, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Send, Mail, Phone } from 'lucide-react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import './StaticPages.css';

export default function ContactPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Box className="static-page">
            <Header />
            <Box className="static-page__hero">
                <Container maxWidth="lg">
                    <Grid container spacing={8}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography 
                                    variant="h1" 
                                    sx={{ 
                                        fontSize: { xs: '36px', md: '56px' },
                                        fontWeight: 900,
                                        mb: 2,
                                        color: isDark ? 'white' : '#0F172A'
                                    }}
                                >
                                    Let's Talk.
                                </Typography>
                                <Typography sx={{ 
                                    fontSize: '18px',
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    mb: 4,
                                    lineHeight: 1.6
                                }}>
                                    Ready to scale your gym? Our experts are here to help you set up the perfect OS for your business.
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            p: 1.5, 
                                            borderRadius: '12px', 
                                            bgcolor: 'rgba(230, 57, 70, 0.1)',
                                            color: '#E63946',
                                            display: 'flex'
                                        }}>
                                            <Mail size={24} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>Email Us</Typography>
                                            <Typography sx={{ fontWeight: 600, color: isDark ? 'white' : '#0F172A' }}>sales@athlonx.com</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            p: 1.5, 
                                            borderRadius: '12px', 
                                            bgcolor: 'rgba(0, 245, 255, 0.1)',
                                            color: '#00F5FF',
                                            display: 'flex'
                                        }}>
                                            <Phone size={24} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>Call Us</Typography>
                                            <Typography sx={{ fontWeight: 600, color: isDark ? 'white' : '#0F172A' }}>+91 98765 43210</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>

                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                sx={{
                                    p: 4,
                                    borderRadius: '24px',
                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField 
                                            fullWidth 
                                            label="Full Name" 
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
                                            rows={4} 
                                            label="How can we help?" 
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
                                                py: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: '#E63946',
                                                fontWeight: 700,
                                                fontSize: '16px',
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: '#D32F2F' }
                                            }}
                                        >
                                            Send Message
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
}
