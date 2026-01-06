"use client";

import React from 'react';
import { Box, Typography, Grid, Container, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Star, Shield, Zap } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Member App', href: '/member-app' },
        { label: 'Updates', href: '/about' } // Redirecting updates to about for now
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '/about' } // Redirecting blog to about
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security', href: '/privacy' } // Redirecting security to privacy
      ]
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#050505',
        paddingTop: 12,
        paddingBottom: 6,
        color: 'white',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} sx={{ marginBottom: 10 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ maxWidth: 320 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 4 }}>
                <Logo size={48} />
                <Typography sx={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>AthlonX</Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '15px',
                  color: 'var(--color-gray-500)',
                  lineHeight: 1.7,
                  marginBottom: 4,
                }}
              >
                The premium operating system for high-performance fitness businesses. Built for those who demand precision.
              </Typography>

              {/* Social Icons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <IconButton
                    key={idx}
                    component={motion.button}
                    whileHover={{ y: -4, color: '#E63946' }}
                    sx={{
                      color: 'rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: 1.5,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <Icon size={20} />
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <Grid size={{ xs: 6, md: 2.6 }} key={section.title}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'white',
                  marginBottom: 4,
                  letterSpacing: '2px'
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {section.links.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    underline="none"
                    sx={{
                      fontSize: '15px',
                      color: 'var(--color-gray-500)',
                      transition: 'all 0.3s var(--transition-android)',
                      '&:hover': { color: 'white', paddingLeft: '4px' }
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Trust Badges */}
        <Box
          sx={{
            paddingY: 6,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: { xs: 4, md: 8 },
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Star size={18} color="#E63946" fill="#E63946" />
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-400)', fontWeight: 700 }}>4.9/5 RATING</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Shield size={18} color="#06D6A0" />
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-400)', fontWeight: 700 }}>BANK-LEVEL SECURITY</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Zap size={18} color="#FFD700" fill="#FFD700" />
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-400)', fontWeight: 700 }}>99.9% UPTIME</Typography>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            paddingTop: 6,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
            &copy; {currentYear} AthlonX Global. Built for high performance.
          </Typography>

          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', '&:hover': { color: 'white' } }}>
              System Status
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', '&:hover': { color: 'white' } }}>
              Privacy Preferences
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
