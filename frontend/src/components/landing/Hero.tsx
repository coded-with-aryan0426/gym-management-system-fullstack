
import React from 'react';
import { Box, Typography, Button, Container, Chip, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Sparkles, ArrowRight, Play, Trophy, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GradientText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.span
    initial={{ backgroundPosition: '0% 50%' }}
    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    className={className || "text-gradient-primary"}
    style={{
      fontWeight: 900,
      backgroundSize: '200% auto',
      display: 'inline-block'
    }}
  >
    {children}
  </motion.span>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] },
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
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: { xs: '100px', md: '120px' },
        paddingBottom: '60px',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {/* Dynamic Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)',
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
              icon={<Sparkles size={12} />}
              label="The Elite Gym Operating System"
              className="glass-effect"
              sx={{
                color: 'var(--color-crimson)',
                fontSize: { xs: '10px', md: '11px' },
                fontWeight: 800,
                height: 28,
                paddingX: 1.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 2.5,
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.1)',
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
              fontSize: { xs: '36px', sm: '48px', md: '64px', lg: '72px' },
              fontWeight: 900,
              fontFamily: 'var(--font-family-display)',
              lineHeight: { xs: 1.1, md: 1.05 },
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              marginBottom: 2,
              maxWidth: 800,
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
              fontSize: { xs: '15px', md: '17px' },
              fontWeight: 400,
              fontFamily: 'var(--font-family-premium)',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              marginBottom: 4,
              maxWidth: 580,
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
              gap: 2, 
              alignItems: 'center',
              marginBottom: 6 
            }}
          >
            <Button
              variant="contained"
              className="btn-premium btn-premium-primary"
              sx={{
                height: 50,
                padding: '0 32px',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3)',
              }}
              endIcon={<ArrowRight size={18} />}
              onClick={handleCtaClick}
            >
              Start Free Trial
            </Button>

            <Button
              variant="outlined"
              className="glass-effect"
              sx={{
                height: 50,
                padding: '0 32px',
                fontSize: '15px',
                fontWeight: 700,
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                }
              }}
              startIcon={<Play size={18} />}
            >
              Watch Demo
            </Button>
          </Box>

          {/* Dashboard Preview Section with 3D Reveal */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
            sx={{
              width: '100%',
              maxWidth: 880,
              position: 'relative',
              perspective: '2000px',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-15px',
                left: '20%',
                right: '20%',
                height: '30px',
                background: 'var(--color-crimson)',
                filter: 'blur(60px)',
                opacity: 0.15,
                zIndex: -1,
              }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
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
                height: '35%',
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
                top: '10%',
                right: '-10px',
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 1,
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 2,
                transform: 'rotate(2deg)',
              }}
            >
              <Box sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)', p: 0.6, borderRadius: '6px' }}>
                <Trophy size={14} color="var(--color-accent-gold)" />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '12px', color: 'white' }}>
                #1 Gym Solution 2024
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              className="glass-effect-heavy"
              sx={{
                position: 'absolute',
                bottom: '18%',
                left: '-15px',
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 1,
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 2,
                transform: 'rotate(-3deg)',
              }}
            >
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 0.6, borderRadius: '8px' }}>
                <ShieldCheck size={14} color="var(--color-accent-emerald)" />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '12px', color: 'white' }}>
                ISO Certified Security
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
