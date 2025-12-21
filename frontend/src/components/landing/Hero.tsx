import React from 'react';
import { Box, Typography, Button, Container, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GradientText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.span
    initial={{ backgroundPosition: '0% 50%' }}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    className={className || "text-gradient-primary"}
    style={{
      backgroundSize: '200% auto',
      display: 'inline-block',
      color: 'transparent',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
    }}
  >
    {children}
  </motion.span>
);

const Hero = ({ onSignupClick }: { onSignupClick?: () => void }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleCtaClick = () => {
    if (onSignupClick) onSignupClick();
    else navigate('/signup');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 1) 0%, rgba(0, 0, 0, 1) 100%)',
      }}
    >
      {/* Abstract Background Fluid Shapes */}
      <motion.div
        style={{ y: y1, x: -100 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <motion.div
        style={{ y: y2, x: 100 }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '45vw',
            height: '45vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', // Subtle blue hint
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Chip
              icon={<Sparkles size={14} />}
              label="Next-Gen Gym Operating System"
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                fontWeight: 500,
                height: 32,
                paddingX: 1,
                marginBottom: 4,
                '& .MuiChip-icon': { color: 'var(--color-accent-gold)' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }
              }}
            />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '42px', md: '72px', lg: '84px' },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: '#fff',
                marginBottom: 3,
                maxWidth: 900,
              }}
            >
              Master Your Gym's <br />
              <GradientText>Flow State.</GradientText>
            </Typography>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '16px', md: '20px' },
                color: 'rgba(255, 255, 255, 0.5)',
                maxWidth: 600,
                marginBottom: 6,
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Experience the perfect balance of power and simplicity.
              Seamlessly manage members, staff, and finances with
              unparalleled elegance.
            </Typography>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                onClick={handleCtaClick}
                endIcon={<ArrowRight size={18} />}
                sx={{
                  background: '#fff',
                  color: '#000',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: '#f0f0f0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 40px rgba(255, 255, 255, 0.2)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                startIcon={<Play size={18} />}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: '#fff',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                Watch Demo
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
