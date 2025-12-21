
import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip, Paper, Avatar } from '@mui/material';
import { Sparkles, ArrowRight, Play, Star, Trophy, Shield, Zap, UserPlus, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const GradientText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <Box
    component="span"
    className={className || "text-gradient-primary"}
    sx={{
      fontWeight: 900,
    }}
  >
    {children}
  </Box>
);

const trustSignals = [
  { id: 1, icon: Star, text: '4.9/5 from 2,847 reviews', color: 'var(--color-accent-gold)' },
  { id: 2, icon: Trophy, text: 'Best Gym Software 2024', color: 'var(--color-accent-gold)' },
  { id: 3, icon: Shield, text: 'Bank-Level Security', color: 'var(--color-accent-cyan)' },
  { id: 4, icon: Zap, text: 'Setup in 15 Minutes', color: 'var(--color-accent-orange)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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
        paddingTop: { xs: '120px', md: '160px' },
        paddingBottom: '100px',
        overflow: 'hidden',
        background: 'var(--bg-mesh-gradient)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background Glows */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '30vw',
        height: '30vw',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
      }} />

      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          maxWidth: 'lg',
          margin: '0 auto',
          padding: { xs: '0 var(--space-6)', md: '0 var(--space-10)' },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: '80px', lg: '64px' },
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Content Side */}
        <Box sx={{ flex: 1.2, color: 'white' }}>
          <motion.div variants={itemVariants}>
            <Chip
              icon={<Sparkles size={14} />}
              label="The Future of Gym Management"
              className="glass-effect"
              sx={{
                color: 'var(--color-crimson)',
                fontSize: '12px',
                fontWeight: 700,
                height: 32,
                paddingX: 1.5,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 4,
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                '& .MuiChip-icon': { color: 'var(--color-crimson)' }
              }}
            />
          </motion.div>

          <Typography
            variant="h1"
            component={motion.h1}
            variants={itemVariants}
            sx={{
              fontSize: { xs: '42px', md: '56px', lg: '72px' },
              fontWeight: 900,
              fontFamily: 'var(--font-family-display)',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              marginBottom: 3,
              maxWidth: 700,
            }}
          >
            Run Your Gym Like a <GradientText>Machine</GradientText>.
          </Typography>

          <Typography
            variant="body1"
            component={motion.p}
            variants={itemVariants}
            sx={{
              fontSize: { xs: '18px', md: '21px' },
              fontWeight: 400,
              fontFamily: 'var(--font-family-premium)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: 6,
              maxWidth: 540,
            }}
          >
            Stop drowning in spreadsheets. AthlonX is the elite operating system for precision-driven gym owners and trainers.
          </Typography>

          {/* CTA Section */}
          <Box component={motion.div} variants={itemVariants} sx={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
            <Box sx={{ display: 'flex', gap: 2, maxWidth: 520, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                placeholder="Enter your work email..."
                variant="outlined"
                fullWidth
                className="input-premium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 60,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-premium-md)',
                    fontSize: '16px',
                    '& fieldset': { border: 'none' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="var(--text-muted)" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                className="btn-premium btn-premium-primary"
                sx={{
                  height: 60,
                  minWidth: 200,
                  fontSize: '16px',
                }}
                endIcon={<ArrowRight size={20} />}
                onClick={handleCtaClick}
              >
                Start Free Trial
              </Button>
            </Box>

            <Button
              variant="text"
              startIcon={<Play size={20} />}
              sx={{
                color: 'var(--text-secondary)',
                fontSize: '15px',
                fontWeight: 600,
                textTransform: 'none',
                padding: 0,
                justifyContent: 'flex-start',
                width: 'fit-content',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: 'var(--color-crimson)',
                  backgroundColor: 'transparent',
                  transform: 'translateX(5px)',
                },
              }}
            >
              Watch the Platform Tour
            </Button>
          </Box>

          {/* Trust Signals */}
          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 3, md: 5 },
              flexWrap: 'wrap',
              paddingTop: 5,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {trustSignals.map((signal) => (
              <Box
                key={signal.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <signal.icon
                    size={16}
                    color={signal.color}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {signal.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Visual Side */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            width: '100%',
            maxWidth: 640,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          {/* Main Dashboard Preview with floating effect */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: '-2px',
                  background: 'var(--gradient-primary)',
                  borderRadius: '30px',
                  zIndex: -1,
                  opacity: 0.3,
                  filter: 'blur(10px)',
                }
              }}
            >
              <Box
                component="img"
                src="/images/dashboard-red.png"
                alt="AthlonX Dashboard"
                className="animate-float"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '28px',
                  boxShadow: 'var(--shadow-premium-xl)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'block',
                }}
              />
            </Box>
          </motion.div>

          {/* Floating Metrics Card */}
          <Paper
            elevation={0}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -15, 0] }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.8 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" } 
            }}
            className="glass-effect-heavy"
            sx={{
              position: 'absolute',
              top: '10%',
              right: '-40px',
              padding: 2.5,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              zIndex: 10,
              boxShadow: 'var(--shadow-premium-lg)',
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)', width: 44, height: 44, border: '1px solid rgba(220, 38, 38, 0.2)' }}>
              <UserPlus size={22} color="var(--color-crimson)" />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
                Active Members
              </Typography>
              <Typography sx={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-crimson)' }}>
                1,284
              </Typography>
            </Box>
          </Paper>

          {/* Floating Revenue Card */}
          <Paper
            elevation={0}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, 15, 0] }}
            transition={{ 
              opacity: { duration: 0.5, delay: 1 },
              y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 } 
            }}
            className="premium-card"
            sx={{
              position: 'absolute',
              bottom: '5%',
              left: '-60px',
              padding: 3,
              zIndex: 10,
              minWidth: 200,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Monthly Revenue
              </Typography>
              <Zap size={16} color="var(--color-accent-gold)" />
            </Box>
            <Typography sx={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: 1 }}>
              ₹8.4L
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-accent-emerald)', boxShadow: '0 0 10px var(--color-accent-emerald)' }} />
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-emerald)' }}>
                +14% vs last month
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
