"use client";

import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip, Paper, Avatar } from '@mui/material';
import { Sparkles, ArrowRight, Play, Star, Trophy, Shield, Zap, UserPlus, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: 'auto' },
          paddingTop: { xs: '70px', sm: '80px', md: '90px' },
          paddingBottom: { xs: '40px', md: '60px' },
          overflow: 'hidden',
          backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
          transition: 'background-color 0.3s ease',
        }}
      >
      <Box
        sx={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: { xs: '0 16px', sm: '0 24px', md: '0 40px', lg: '0 60px' },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: '24px', md: '32px', lg: '48px' },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Content Side */}
        <Box sx={{ flex: 1, color: isDark ? 'white' : 'var(--text-primary)', width: '100%', textAlign: { xs: 'center', lg: 'left' } }}>
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
              fontSize: { xs: '28px', sm: '36px', md: '44px', lg: '52px', xl: '56px' },
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.1,
              letterSpacing: { xs: '-0.5px', md: '-1px' },
              color: isDark ? 'white' : 'var(--text-primary)',
              marginBottom: { xs: 1.5, md: 2 },
              maxWidth: { lg: 600 },
            }}
          >
            Run Your Gym Like a <GradientText>Machine</GradientText>. Not a Mess.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '14px', sm: '15px', md: '16px', lg: '17px' },
              fontWeight: 400,
              lineHeight: 1.5,
              color: isDark ? 'var(--color-gray-400)' : 'var(--text-secondary)',
              maxWidth: { xs: '100%', lg: 500 },
              margin: { xs: '0 auto 20px', lg: '0 0 28px 0' },
            }}
          >
            Stop drowning in spreadsheets and fragmented apps. Sync your billing,
            scheduling, and member tracking into one intelligent dashboard.
          </Typography>

          {/* CTA Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            marginBottom: { xs: 3, md: 4 },
            alignItems: { xs: 'center', lg: 'flex-start' },
          }}>
            <Box sx={{
              display: 'flex',
              gap: 1.5,
              maxWidth: { xs: '100%', sm: 480 },
              width: '100%',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                  placeholder="Enter your email"
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: { xs: 46, md: 52 },
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      borderRadius: '10px',
                      fontSize: { xs: '14px', md: '15px' },
                      color: isDark ? 'white' : 'var(--text-primary)',
                      '& fieldset': {
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E63946',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={16} color={isDark ? "#666" : "#999"} />
                      </InputAdornment>
                    ),
                  }}
                />

              <Button
                variant="contained"
                sx={{
                  height: { xs: 46, md: 52 },
                  minWidth: { xs: '100%', sm: 160, md: 180 },
                  background: 'var(--gradient-cta)',
                  borderRadius: '10px',
                  fontSize: { xs: '14px', md: '15px' },
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
                endIcon={<ArrowRight size={18} />}
                onClick={onSignupClick}
              >
                Join the Future
              </Button>
            </Box>

            <Button
              variant="text"
              startIcon={<Play size={16} />}
              sx={{
                color: isDark ? 'var(--color-gray-300)' : 'var(--text-secondary)',
                fontSize: { xs: '12px', md: '13px' },
                fontWeight: 500,
                textTransform: 'none',
                padding: '6px 0',
                justifyContent: { xs: 'center', lg: 'flex-start' },
                width: 'fit-content',
                '&:hover': {
                  color: isDark ? 'white' : 'var(--text-primary)',
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
              gap: { xs: 1, sm: 1.5, md: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', lg: 'flex-start' },
              paddingTop: { xs: 2, md: 3 },
              borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
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
                  size={14}
                  color="#06D6A0"
                />
                <Typography
                  sx={{
                    fontSize: { xs: '10px', sm: '11px', md: '12px' },
                    fontWeight: 500,
                    color: isDark ? 'var(--color-gray-300)' : 'var(--text-secondary)',
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
              backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 2,
            }}
          >
            <Avatar sx={{ bgcolor: '#06D6A0', width: { md: 36, lg: 40 }, height: { md: 36, lg: 40 } }}>
              <UserPlus size={18} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: { md: '12px', lg: '14px' }, fontWeight: 600, color: isDark ? 'white' : 'var(--text-primary)' }}>
                New Member Joined
              </Typography>
              <Typography sx={{ fontSize: { md: '10px', lg: '12px' }, color: isDark ? 'var(--color-gray-400)' : 'var(--text-tertiary)' }}>
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
              backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              zIndex: 2,
            }}
          >
            <Typography sx={{ fontSize: { md: '10px', lg: '12px' }, color: isDark ? 'var(--color-gray-400)' : 'var(--text-tertiary)', marginBottom: 0.5 }}>
              Today's Revenue
            </Typography>
            <Typography sx={{ fontSize: { md: '20px', lg: '24px' }, fontWeight: 700, color: isDark ? 'white' : 'var(--text-primary)' }}>
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
