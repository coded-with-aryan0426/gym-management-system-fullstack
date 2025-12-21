
import React from 'react';
import { Box, Typography, Button, Container, Chip, Paper, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Sparkles, ArrowRight, Play, Star, Trophy, ShieldCheck, Zap, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GradientText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <Box
    component="motion.span"
    initial={{ backgroundPosition: '0% 50%' }}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    className={className || "text-gradient-primary"}
    sx={{
      fontWeight: 900,
      backgroundSize: '200% auto',
    }}
  >
    {children}
  </Box>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] },
  },
};

interface HeroProps {
  onSignupClick?: () => void;
}

export default function Hero({ onSignupClick }: HeroProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleCtaClick = () => {
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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: { xs: '120px', md: '140px' },
        paddingBottom: '80px',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {/* Dynamic Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
        filter: 'blur(100px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Chip
              icon={<Sparkles size={14} />}
              label="The Elite Gym Operating System"
              className="glass-effect"
              sx={{
                color: 'var(--color-crimson)',
                fontSize: { xs: '11px', md: '13px' },
                fontWeight: 800,
                height: 36,
                paddingX: 2,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 4,
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.15)',
                '& .MuiChip-icon': { color: 'var(--color-crimson)' }
              }}
            />
          </motion.div>

          {/* Headline */}
          <Typography
            variant="h1"
            component={motion.h1}
            variants={itemVariants}
            sx={{
              fontSize: { xs: '48px', sm: '64px', md: '84px', lg: '96px' },
              fontWeight: 900,
              fontFamily: 'var(--font-family-display)',
              lineHeight: { xs: 1.1, md: 1.05 },
              letterSpacing: '-0.05em',
              color: 'var(--text-primary)',
              marginBottom: 3,
              maxWidth: 960,
              textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            Run Your Gym Like a <br />
            <GradientText>Machine.</GradientText>
          </Typography>

          {/* Subheadline */}
          <Typography
            variant="body1"
            component={motion.p}
            variants={itemVariants}
            sx={{
              fontSize: { xs: '18px', md: '22px' },
              fontWeight: 400,
              fontFamily: 'var(--font-family-premium)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: 6,
              maxWidth: 680,
              opacity: 0.9,
            }}
          >
            Precision management for high-performance gyms. Stop juggling spreadsheets 
            and start scaling your empire with data-driven clarity.
          </Typography>

          {/* CTAs */}
          <Box 
            component={motion.div} 
            variants={itemVariants} 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 3, 
              alignItems: 'center',
              marginBottom: 8 
            }}
          >
            <Button
              variant="contained"
              className="btn-premium btn-premium-primary"
              sx={{
                height: 64,
                width: { xs: '100%', sm: 260 },
                fontSize: '18px',
                fontWeight: 700,
                boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3)',
              }}
              endIcon={<ArrowRight size={20} />}
              onClick={handleCtaClick}
            >
              Start Free Trial
            </Button>

            <Button
              variant="outlined"
              className="glass-effect"
              sx={{
                height: 64,
                width: { xs: '100%', sm: 260 },
                fontSize: '18px',
                fontWeight: 700,
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                }
              }}
              startIcon={<Play size={20} />}
            >
              Watch Demo
            </Button>
          </Box>

          {/* Dashboard Preview Section with 3D Reveal */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.5, delay: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
            sx={{
              width: '100%',
              maxWidth: 1080,
              position: 'relative',
              perspective: '2000px',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-20px',
                left: '10%',
                right: '10%',
                height: '40px',
                background: 'var(--color-crimson)',
                filter: 'blur(80px)',
                opacity: 0.2,
                zIndex: -1,
              }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                background: '#0a0a0a',
                lineHeight: 0,
              }}
            >
              <Box
                component="img"
                src="/images/dashboard-red.png"
                alt="AthlonX Dashboard"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  opacity: 0.9,
                }}
              />
              
              {/* Overlay Gradient to blend with page */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, #000, transparent)',
                zIndex: 1,
              }} />
            </Box>

            {/* Floating Trust Badge */}
            <Paper
              elevation={0}
              className="glass-effect-heavy"
              sx={{
                position: 'absolute',
                top: '15%',
                right: '-20px',
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 1.5,
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 2,
                transform: 'rotate(2deg)',
              }}
            >
              <Box sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)', p: 1, borderRadius: '10px' }}>
                <Trophy size={20} color="var(--color-accent-gold)" />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
                #1 Gym Solution 2024
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              className="glass-effect-heavy"
              sx={{
                position: 'absolute',
                bottom: '20%',
                left: '-30px',
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 1.5,
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 2,
                transform: 'rotate(-3deg)',
              }}
            >
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '10px' }}>
                <ShieldCheck size={20} color="var(--color-accent-emerald)" />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
                ISO Certified Security
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
