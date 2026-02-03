"use client";

import React from 'react';
import { Box, Typography, Grid, Container, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Star, Shield, Zap } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// Footer link configuration with proper routing
const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', sectionId: 'future' },
      { label: 'Pricing', sectionId: 'value' },
      { label: 'Member App', href: '/member-app' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Testimonials', sectionId: 'social' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ]
  }
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleLinkClick = (link: { label: string; sectionId?: string; href?: string }) => {
    if (link.href) {
      navigate(link.href);
    } else if (link.sectionId) {
      const sectionId = link.sectionId;
      // If on home page, scroll. Otherwise navigate to home then scroll
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <Box
        component="footer"
        sx={{
          backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          paddingTop: 'var(--space-20)',
          paddingBottom: 'var(--space-8)',
          color: isDark ? 'white' : 'var(--text-primary)',
          transition: 'background-color 0.3s ease',
        }}
      >
      <Container maxWidth="xl">
        {/* Main Footer Grid */}
        <Grid container spacing={{ xs: 5, md: 6 }} sx={{ marginBottom: 8 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ maxWidth: 300 }}>
              {/* Logo */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 3, cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <Logo size={48} showText={true} />
              </Box>

              <Typography
                sx={{
                  fontSize: '14px',
                  color: isDark ? 'var(--color-gray-400)' : 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 3,
                }}
              >
                The most powerful, all-in-one management platform for gym owners who demand absolute control and growth.
              </Typography>

              {/* Social Icons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <IconButton
                    key={idx}
                    size="small"
                    sx={{
                      color: isDark ? 'var(--color-gray-600)' : 'var(--text-tertiary)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#E63946',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Icon size={20} />
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Links Columns */}
          {footerSections.map((column) => (
            <Grid size={{ xs: 6, md: 2 }} key={column.title}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isDark ? 'white' : 'var(--text-primary)',
                  marginBottom: 3,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '1px'
                }}
              >
                {column.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {column.links.map(link => (
                  <Link
                    key={link.label}
                    component="button"
                    underline="none"
                    onClick={() => handleLinkClick(link)}
                    sx={{
                      fontSize: '14px',
                      color: isDark ? 'var(--color-gray-500)' : 'var(--text-tertiary)',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': { color: '#E63946' }
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Trust Badges Row */}
        <Box
          sx={{
            paddingY: 4,
            borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star size={16} color="#E63946" strokeWidth={3} />
            <Typography sx={{ fontSize: '13px', color: isDark ? 'var(--color-gray-400)' : 'var(--text-secondary)', fontWeight: 600 }}>
              4.9/5 RATING
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={16} color="#E63946" strokeWidth={3} />
            <Typography sx={{ fontSize: '13px', color: isDark ? 'var(--color-gray-400)' : 'var(--text-secondary)', fontWeight: 600 }}>
              MILITARY GRADE SECURITY
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} color="#E63946" strokeWidth={3} />
            <Typography sx={{ fontSize: '13px', color: isDark ? 'var(--color-gray-400)' : 'var(--text-secondary)', fontWeight: 600 }}>
              99.9% UPTIME GUARANTEE
            </Typography>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            paddingTop: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: '14px', color: isDark ? 'var(--color-gray-500)' : 'var(--text-tertiary)' }}>
            &copy; {new Date().getFullYear()} AthlonX Gym Management. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography sx={{ fontSize: '14px', color: isDark ? 'var(--color-gray-500)' : 'var(--text-tertiary)', cursor: 'pointer', '&:hover': { color: isDark ? 'white' : 'var(--text-primary)' } }}>
              English (India)
            </Typography>
            <Typography sx={{ fontSize: '14px', color: isDark ? 'var(--color-gray-500)' : 'var(--text-tertiary)', cursor: 'pointer', '&:hover': { color: isDark ? 'white' : 'var(--text-primary)' } }}>
              INR (₹)
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
