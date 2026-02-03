"use client";

import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip, Paper, Avatar } from '@mui/material';
import { Sparkles, ArrowRight, Play, Star, Trophy, Shield, Zap, UserPlus, Mail } from 'lucide-react';
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
  { id: 1, icon: Star, text: '4.9/5 Reviews' },
  { id: 2, icon: Trophy, text: 'Best Gym Software' },
  { id: 3, icon: Shield, text: 'Bank-Level Security' },
  { id: 4, icon: Zap, text: '15 Min Setup' },
];

interface HeroProps {
  onSignupClick: () => void;
}

export default function Hero({ onSignupClick }: HeroProps) {
  return (
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: '100vh' },
          paddingTop: { xs: '80px', sm: '100px', md: '120px' },
          paddingBottom: { xs: '60px', md: '80px' },
          overflow: 'hidden',
          backgroundColor: '#0A0A0A',
        }}
      >
      <Box
        sx={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: { xs: '0 16px', sm: '0 24px', md: '0 40px', lg: '0 60px' },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: '40px', md: '48px', lg: '64px' },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Content Side */}
        <Box sx={{ flex: 1, color: 'white', width: '100%', textAlign: { xs: 'center', lg: 'left' } }}>
          <Chip
            icon={<Sparkles size={14} color="#E63946" />}
            label={
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Most Powerful Gym Management Platform of 2024
              </Box>
            }
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              backgroundColor: 'rgba(230, 57, 70, 0.1)',
              color: '#E63946',
              fontSize: { xs: '11px', md: '13px' },
              fontWeight: 700,
              height: { xs: 28, md: 32 },
              paddingX: 1,
              marginBottom: { xs: 2, md: 3 },
              borderRadius: '8px',
              border: '1px solid rgba(230, 57, 70, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              '& .MuiChip-icon': { color: '#E63946' }
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '32px', sm: '40px', md: '56px', lg: '64px', xl: '72px' },
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.1,
              letterSpacing: { xs: '-1px', md: '-2px' },
              color: 'white',
              marginBottom: { xs: 2, md: 3 },
              maxWidth: { lg: 700 },
            }}
          >
            Run Your Gym Like a <GradientText>Machine</GradientText>. Not a Mess.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '15px', sm: '16px', md: '18px', lg: '20px' },
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--color-gray-400)',
              maxWidth: { xs: '100%', lg: 550 },
              margin: { xs: '0 auto 24px', lg: '0 0 40px 0' },
            }}
          >
            Stop drowning in spreadsheets and fragmented apps. Sync your billing,
            scheduling, and member tracking into one intelligent dashboard.
          </Typography>

          {/* CTA Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            marginBottom: { xs: 4, md: 6 },
            alignItems: { xs: 'center', lg: 'flex-start' },
          }}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              maxWidth: { xs: '100%', sm: 520 },
              width: '100%',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                placeholder="Enter your email"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: { xs: 52, md: 60 },
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    fontSize: { xs: '14px', md: '16px' },
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#E63946',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color="#666" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                sx={{
                  height: { xs: 52, md: 60 },
                  minWidth: { xs: '100%', sm: 180, md: 200 },
                  background: 'var(--gradient-cta)',
                  borderRadius: '12px',
                  fontSize: { xs: '15px', md: '16px' },
                  fontWeight: 700,
                  textTransform: 'none',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(230, 57, 70, 0.5)',
                  },
                }}
                endIcon={<ArrowRight size={20} />}
                onClick={onSignupClick}
              >
                Join the Future
              </Button>
            </Box>

            <Button
              variant="text"
              startIcon={<Play size={18} />}
              sx={{
                color: 'var(--color-gray-300)',
                fontSize: { xs: '13px', md: '14px' },
                fontWeight: 500,
                textTransform: 'none',
                padding: '8px 0',
                justifyContent: { xs: 'center', lg: 'flex-start' },
                width: 'fit-content',
                '&:hover': {
                  color: 'white',
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
              gap: { xs: 1.5, sm: 2, md: 3 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', lg: 'flex-start' },
              paddingTop: { xs: 3, md: 4 },
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {trustSignals.map((signal) => (
              <Box
                key={signal.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <signal.icon
                  size={16}
                  color="#06D6A0"
                />
                <Typography
                  sx={{
                    fontSize: { xs: '11px', sm: '12px', md: '13px' },
                    fontWeight: 500,
                    color: 'var(--color-gray-300)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {signal.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Visual Side - NOW VISIBLE ON ALL SCREENS */}
        <Box
          sx={{
            flex: { xs: 'none', lg: 1 },
            position: 'relative',
            width: '100%',
            maxWidth: { xs: '100%', sm: 500, lg: 600 },
            margin: { xs: '0 auto', lg: 0 },
          }}
        >
          {/* Main Dashboard Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              component="img"
              src="/images/dashboard-red.png"
              alt="Gym Management Dashboard"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: { xs: '16px', md: '20px' },
                boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </motion.div>

          {/* Floating Notification Cards - Hidden on mobile for cleaner look */}
          <Paper
            elevation={0}
            component={motion.div}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              top: { md: -10, lg: -20 },
              right: { md: -10, lg: -20 },
              padding: { md: 1.5, lg: 2 },
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#06D6A0', width: { md: 36, lg: 40 }, height: { md: 36, lg: 40 } }}>
              <UserPlus size={18} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: { md: '12px', lg: '14px' }, fontWeight: 600, color: 'white' }}>
                New Member Joined
              </Typography>
              <Typography sx={{ fontSize: { md: '10px', lg: '12px' }, color: 'var(--color-gray-400)' }}>
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
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              bottom: { md: 20, lg: 40 },
              left: { md: -20, lg: -40 },
              padding: { md: 1.5, lg: 2 },
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 2,
            }}
          >
            <Typography sx={{ fontSize: { md: '10px', lg: '12px' }, color: 'var(--color-gray-400)', marginBottom: 0.5 }}>
              Today's Revenue
            </Typography>
            <Typography sx={{ fontSize: { md: '20px', lg: '24px' }, fontWeight: 700, color: 'white' }}>
              ₹2,45,000
            </Typography>
            <Chip
              label="+23% from yesterday"
              size="small"
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#06D6A0',
                fontSize: { md: '10px', lg: '12px' },
                height: { md: 20, lg: 24 },
                marginTop: 0.5,
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
