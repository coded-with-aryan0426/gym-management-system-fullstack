"use client";

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../ui/Logo';

const navItems = [
  { label: 'Features', id: 'features' },
  { label: 'Audit Report', id: 'problems' },
  { label: 'Success Stories', id: 'testimonials' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'About', id: 'about', isPage: true, href: '/about' },
  { label: 'Contact', id: 'contact', isPage: true, href: '/contact' }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          height: 72,
          backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ height: '100%', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto', width: '100%', paddingX: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Logo size={40} />
          </Box>

          {/* Nav Links - Desktop */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 4 }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => !(item as any).isPage && scrollToSection(item.id)}
                href={(item as any).isPage ? (item as any).href : undefined}
                sx={{
                  color: 'var(--color-gray-400)',
                  fontSize: 15,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'transparent',
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              href="/login"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                '&:hover': { color: '#E63946', background: 'transparent' }
              }}
            >
              Log In
            </Button>

            <Button
              variant="contained"
              href="/signup"
              sx={{
                height: 44,
                paddingX: 3,
                background: 'var(--gradient-cta)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 15,
                '&:hover': {
                  background: 'var(--color-accent-red-hover)',
                  transform: 'translateY(-1px)',
                }
              }}
              endIcon={<ArrowRight size={18} />}
            >
              Start Free
            </Button>

            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ display: { xs: 'flex', lg: 'none' }, color: 'white' }}
            >
              <Menu size={24} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: '#0A0A0A',
            padding: 3,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Logo size={32} />
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
            <X size={24} />
          </IconButton>
        </Box>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => !(item as any).isPage && scrollToSection(item.id)}
                href={(item as any).isPage ? (item as any).href : undefined}
                component={(item as any).isPage ? 'a' : 'div'}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { color: 'white', fontSize: 18, fontWeight: 600 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            href="/login"
            sx={{ height: 50, borderRadius: '8px', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            Log In
          </Button>
          <Button
            fullWidth
            variant="contained"
            href="/signup"
            sx={{ height: 50, borderRadius: '8px', background: 'var(--gradient-cta)' }}
          >
            Start Free Trial
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
