"use client";

import React from 'react';
import { AppBar, Toolbar, Button, Box, useScrollTrigger } from '@mui/material';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AppBar 
      position="fixed"
      elevation={0}
      sx={{
        height: 72,
        backgroundColor: trigger ? 'rgba(13, 13, 26, 0.95)' : 'transparent',
        backdropFilter: 'blur(12px)',
        borderBottom: trigger ? '1px solid rgba(255,255,255,0.1)' : 'none',
        padding: { xs: '0 var(--space-4)', md: '0 var(--space-10)' },
        transition: 'all 0.3s ease',
        zIndex: 50,
      }}
    >
      <Toolbar sx={{ height: '100%', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'var(--color-accent-orange)', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800
            }}
          >
            A
          </Box>
          <Box component="span" sx={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)' }}>
            AthlonX
          </Box>
        </Box>

        {/* Nav Links - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
          {['Features', 'Testimonials', 'Pricing'].map((item) => (
            <Button 
              key={item}
              variant="text" 
              sx={{ 
                color: 'var(--color-gray-300)',
                fontSize: 15,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { color: 'white' }
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* CTA Button */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="text"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'white',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Log In
          </Button>
          <Button
            variant="contained"
            sx={{
              height: 44,
              padding: '0 24px',
              backgroundColor: 'var(--color-accent-blue)',
              borderRadius: 'var(--radius-lg)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'var(--color-accent-blue-hover)',
              }
            }}
          >
           Get Started
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
