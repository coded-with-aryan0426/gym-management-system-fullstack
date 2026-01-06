"use client";

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, useScrollTrigger, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';

const navItems = [
  { label: 'Features', id: 'features' },
  { label: 'Problems We Solve', id: 'problems' },
  { label: 'Success Stories', id: 'testimonials' },
  { label: 'Pricing', id: 'pricing' }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Custom scroll listener for smoother control
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: { xs: 64, md: 72 },
          // Floating Dock Logic
          width: scrolled ? 'calc(100% - 40px)' : '100%',
          top: scrolled ? '20px' : '0',
          left: scrolled ? '20px' : '0',
          right: scrolled ? '20px' : '0',
          borderRadius: scrolled ? '16px' : '0',
          backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.85)' : 'transparent',
          backdropFilter: 'blur(16px)',
          border: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
          borderBottom: !scrolled ? 'none' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',

          // Transitions
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: { xs: '0 16px', sm: '0 24px', md: '0 40px' },
          zIndex: 1200,
          margin: '0 auto', // Center it when floating
          maxWidth: scrolled ? '1400px' : '100%', // Optional: Limit animation width on ultra-wide screens
        }}
      >
        <Toolbar sx={{ height: '100%', justifyContent: 'space-between', minHeight: 'unset !important', padding: '0 !important' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
            <Logo size={40} />
          </Box>

          {/* Nav Links - Desktop Only */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 3 }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="text"
                onClick={() => scrollToSection(item.id)}
                sx={{
                  color: 'var(--color-gray-300)',
                  fontSize: 14,
                  fontWeight: 500,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  padding: '8px 12px',
                  '&:hover': {
                    color: '#E63946',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
            {/* Login - Hidden on xs */}
            <Button
              variant="text"
              href="/login"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: { sm: 14, md: 16 },
                padding: { sm: '6px 12px', md: '8px 16px' },
                '&:hover': {
                  color: '#FF495C',
                  backgroundColor: 'rgba(255, 73, 92, 0.1)',
                }
              }}
            >
              Log In
            </Button>

            {/* CTA Button - Always visible but smaller on mobile */}
            <Button
              variant="contained"
              href="/signup"
              sx={{
                height: { xs: 40, sm: 44, md: 48 },
                padding: { xs: '0 16px', sm: '0 20px', md: '0 28px' },
                background: 'var(--gradient-cta)',
                borderRadius: { xs: '10px', md: '12px' },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: 13, sm: 14, md: 16 },
                boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)',
                }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Start Free Trial</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Start Free</Box>
            </Button>

            {/* Mobile Menu Toggle - Only on mobile/tablet */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{
                display: { xs: 'flex', lg: 'none' },
                color: 'white',
                padding: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 320 },
            backgroundColor: '#0A0A0A',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        {/* Close Button Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Logo size={40} />
          </Box>
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              color: 'white',
              padding: '8px',
              '&:hover': {
                backgroundColor: 'rgba(230, 57, 70, 0.1)',
              }
            }}
          >
            <X size={24} />
          </IconButton>
        </Box>
        <Box sx={{ padding: 3 }}>
          {/* Navigation Links */}
          <List sx={{ padding: 0 }}>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ marginBottom: 1 }}>
                <ListItemButton
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    borderRadius: '12px',
                    padding: '16px 20px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 500,
                        fontFamily: 'var(--font-heading)',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', marginY: 3 }} />

          {/* Mobile Login Button */}
          <Button
            fullWidth
            variant="outlined"
            href="/login"
            sx={{
              height: 52,
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '12px',
              marginBottom: 2,
              '&:hover': {
                borderColor: '#E63946',
                backgroundColor: 'rgba(230, 57, 70, 0.1)',
              }
            }}
          >
            Log In
          </Button>

          {/* Mobile CTA Button */}
          <Button
            fullWidth
            variant="contained"
            href="/signup"
            sx={{
              height: 52,
              background: 'var(--gradient-cta)',
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)',
            }}
          >
            Start Free Trial
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
