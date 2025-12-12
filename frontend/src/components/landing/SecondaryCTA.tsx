
import React from 'react';
import { Box, Typography, Button, Container, Grid, Avatar } from '@mui/material';
import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const testimonials = [
    { src: '/images/testimonial-1.jpg', alt: 'User 1' },
    { src: '/images/testimonial-2.jpg', alt: 'User 2' },
    { src: '/images/testimonial-3.jpg', alt: 'User 3' },
];

interface SecondaryCTAProps {
    onSignupClick?: () => void;
}

export default function SecondaryCTA({ onSignupClick }: SecondaryCTAProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onSignupClick) {
            onSignupClick();
        } else {
            navigate('/signup');
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                paddingY: { xs: '80px', md: '120px' },
                background: 'var(--gradient-hero)',
                overflow: 'hidden',
            }}
        >
            {/* Background Decoration */}
            <Box
                component={motion.div}
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.2) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: 1,
                }}
            />

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: '32px', md: '56px' },
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        color: 'white',
                        marginBottom: 3,
                        lineHeight: 'var(--leading-tight)',
                    }}
                >
                    Ready to Stop playing Gym Owner and Start Being a <Box component="span" sx={{ color: 'var(--color-accent-green)' }}>CEO?</Box>
                </Typography>

                <Typography
                    sx={{
                        fontSize: { xs: '18px', md: '20px' },
                        color: 'var(--color-gray-300)',
                        marginBottom: 6,
                        maxWidth: 700,
                        marginX: 'auto',
                    }}
                >
                    Join 5,000+ gyms that switched to AthlonX. Setup takes 15 minutes.
                    If you don't love it in 14 days, you pay ₹0.
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        marginBottom: 6,
                    }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            height: 64,
                            minWidth: 280,
                            paddingX: 6,
                            background: 'var(--gradient-cta)',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)',
                            textTransform: 'none',
                            color: 'white', // White text
                            boxShadow: 'var(--shadow-glow-blue)', // Red glow
                            transition: 'var(--transition-base)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)',
                            },
                        }}
                        endIcon={<ArrowRight size={20} />}
                        onClick={handleClick}
                    >
                        Yes, Transform My Gym
                    </Button>
                    <Typography
                        sx={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-gray-400)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Shield size={14} />
                        14-Day Money Back Guarantee • Cancel Anytime
                    </Typography>
                </Box>

                {/* Social Proof Mini */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {testimonials.map((user, index) => (
                            <Avatar
                                key={index}
                                src={user.src}
                                alt={user.alt}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid var(--color-primary-900)',
                                    marginLeft: index > 0 ? -1.5 : 0,
                                }}
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} color="var(--color-accent-green)" />
                        <Typography sx={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-300)' }}>
                            12 gyms joined today
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
