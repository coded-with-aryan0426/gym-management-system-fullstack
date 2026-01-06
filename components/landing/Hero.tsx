"use client";

import React from 'react';
import { Box, Typography, Button, TextField, InputAdornment, Chip } from '@mui/material';
import { Sparkles, ArrowRight, Play, Star, Trophy, Shield, Zap, Mail } from 'lucide-react';

const GradientText = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="span"
    sx={{
      background: 'var(--gradient-cta)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
    }}
  >
    {children}
  </Box>
);

const trustSignals = [
  { id: 1, icon: Star, text: '4.9/5 Reviews', color: '#FFD700' },
  { id: 2, icon: Trophy, text: 'Best Gym Software', color: '#06D6A0' },
  { id: 3, icon: Shield, text: 'Bank-Level Security', color: '#4361EE' },
  { id: 4, icon: Zap, text: '15 Min Setup', color: '#F77F00' },
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
        paddingTop: { xs: '100px', sm: '120px', md: '160px' },
        paddingBottom: { xs: '80px', md: '120px' },
        overflow: 'hidden',
        background: 'var(--gradient-hero)',
      }}
    >
      <Box
        sx={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: { xs: '0 20px', sm: '0 32px', md: '0 60px' },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: '60px', lg: '80px' },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Content Side */}
        <Box sx={{ flex: 1, color: 'white', width: '100%', textAlign: { xs: 'center', lg: 'left' } }}>
          <Chip
            icon={<Sparkles size={14} />}
            label="Next-Gen Gym Operating System"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-gray-300)',
              fontSize: '12px',
              fontWeight: 600,
              height: 32,
              marginBottom: 3,
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              '& .MuiChip-icon': { color: '#E63946' }
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '36px', sm: '48px', md: '64px', lg: '72px' },
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'white',
              marginBottom: 3,
            }}
          >
            Master Your Gym with <br />
            <GradientText>Absolute Precision</GradientText>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '16px', md: '18px', lg: '20px' },
              color: 'var(--color-gray-400)',
              maxWidth: 600,
              margin: { xs: '0 auto 32px', lg: '0 0 48px 0' },
            }}
          >
            The premium command center for fitness businesses. 
            Automate complexity, eliminate chaos, and scale your legacy.
          </Typography>

          {/* CTA Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            marginBottom: 6,
            alignItems: { xs: 'center', lg: 'flex-start' },
          }}>
            <Box 
              sx={{
                display: 'flex',
                gap: 2,
                maxWidth: { xs: '100%', sm: 500 },
                width: '100%',
                flexDirection: { xs: 'column', sm: 'row' },
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <TextField
                placeholder="Enter work email..."
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 2 }}>
                      <Mail size={20} color="rgba(255,255,255,0.4)" />
                    </InputAdornment>
                  ),
                  sx: { height: 48, color: 'white' }
                }}
              />

              <Button
                variant="contained"
                onClick={onSignupClick}
                sx={{
                  height: 48,
                  minWidth: { sm: 160 },
                  background: 'var(--gradient-cta)',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
                endIcon={<ArrowRight size={20} />}
              >
                Get Started
              </Button>
            </Box>

            <Button
              variant="text"
              startIcon={<Play size={20} fill="currentColor" />}
              sx={{
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { background: 'transparent', color: '#E63946' }
              }}
            >
              Watch Product Tour
            </Button>
          </Box>

          {/* Trust Signals */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 4 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', lg: 'flex-start' },
              paddingTop: 4,
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {trustSignals.map((signal) => (
              <Box key={signal.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <signal.icon size={16} color={signal.color} />
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-gray-500)' }}>
                  {signal.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Visual Side */}
        <Box
          sx={{
            flex: { xs: 'none', lg: 1 },
            position: 'relative',
            width: '100%',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: '24px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <Box
              component="img"
              src="/images/dashboard-red.png"
              alt="Titan Dashboard"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: '16px',
                display: 'block',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
