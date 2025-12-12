"use client";

import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip, Paper, Avatar } from '@mui/material';
import { Sparkles, ArrowRight, Play, Star, Trophy, Shield, Zap, UserPlus, Mail, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const GradientText = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="span"
    sx={{
      background: 'var(--gradient-cta)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </Box>
);

const trustSignals = [
  { id: 1, icon: Star, text: '4.9/5 from 2,847 reviews' },
  { id: 2, icon: Trophy, text: 'Best Gym Software 2024' },
  { id: 3, icon: Shield, text: 'Bank-Level Security' },
  { id: 4, icon: Zap, text: 'Setup in 15 Minutes' },
];

interface HeroProps {
  onSignupClick: () => void;
}

export default function Hero({ onSignupClick }: HeroProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: { xs: '96px', md: '120px' },
        paddingBottom: '80px',
        overflow: 'hidden',
        background: 'var(--gradient-hero)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 'lg',
          margin: '0 auto',
          padding: { xs: '0 var(--space-4)', md: '0 var(--space-10)' },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: '64px', lg: '64px' },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Content Side */}
        <Box sx={{ flex: 1, color: 'white' }}>
          <Chip
            icon={<Sparkles size={14} color="var(--color-accent-blue)" />}
            label="Trusted by 5,000+ Gyms Across India"
            sx={{
              backgroundColor: 'rgba(67, 97, 238, 0.15)',
              color: 'var(--color-accent-blue)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              height: 32,
              paddingX: 1,
              marginBottom: 3,
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(67, 97, 238, 0.3)',
              '& .MuiChip-icon': { color: 'var(--color-accent-blue)' }
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '36px', md: '48px', lg: '60px' },
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-white)',
              marginBottom: 3,
              maxWidth: 600,
            }}
          >
            Run Your Gym Like a <GradientText>Machine</GradientText>. Not a Mess.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '18px', md: '20px' },
              fontWeight: 400,
              fontFamily: 'var(--font-inter)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-gray-300)',
              marginBottom: 5,
              maxWidth: 520,
            }}
          >
            Whether you're an owner tracking revenue, a trainer managing clients,
            or a member booking classes — everything syncs in real-time.
          </Typography>

          {/* CTA Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 6 }}>
            <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 480, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                placeholder="Enter your gym email..."
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-white)',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                      borderWidth: 1,
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-accent-green)',
                      borderWidth: 2,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="var(--color-gray-400)" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                sx={{
                  height: 56,
                  minWidth: 200,
                  background: 'var(--gradient-cta)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'none',
                  color: 'var(--color-primary-900)',
                  boxShadow: 'var(--shadow-glow-green)',
                  transition: 'var(--transition-base)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 30px rgba(0, 245, 160, 0.6)',
                  },
                }}
                endIcon={<ArrowRight size={20} />}
                onClick={onSignupClick}
              >
                Start Free Trial
              </Button>
            </Box>

            <Button
              variant="text"
              startIcon={<Play size={18} />}
              sx={{
                color: 'var(--color-gray-300)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                textTransform: 'none',
                padding: 0,
                justifyContent: 'flex-start',
                width: 'fit-content',
                '&:hover': {
                  color: 'var(--color-white)',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Watch 2-Min Demo
            </Button>
          </Box>

          {/* Trust Signals */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 2, md: 4 },
              flexWrap: 'wrap',
              paddingTop: 4,
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {trustSignals.map((signal) => (
              <Box
                key={signal.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <signal.icon
                  size={18}
                  color="var(--color-accent-green)"
                />
                <Typography
                  sx={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--color-gray-300)',
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
            maxWidth: 600,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          {/* Main Dashboard Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              component="img"
              src="/images/dashboard-mockup.png"
              alt="Gym Management Dashboard"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </motion.div>

          {/* Floating Notification Cards */}
          <Paper
            elevation={0}
            component={motion.div}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              padding: 2,
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 2,
            }}
          >
            <Avatar sx={{ bgcolor: 'var(--color-success)', width: 40, height: 40 }}>
              <UserPlus size={20} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                New Member Joined
              </Typography>
              <Typography sx={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                Just now
              </Typography>
            </Box>
          </Paper>

          {/* Revenue Card */}
          <Paper
            elevation={0}
            component={motion.div}
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            sx={{
              position: 'absolute',
              bottom: 40,
              left: -40,
              padding: 2,
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 2,
            }}
          >
            <Typography sx={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginBottom: 0.5 }}>
              Today's Revenue
            </Typography>
            <Typography sx={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              ₹2,45,000
            </Typography>
            <Chip
              label="+23% from yesterday"
              size="small"
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--color-success)',
                fontSize: 'var(--text-xs)',
                height: 24,
                marginTop: 1,
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
