"use client";

import React from 'react';
import { Box, Typography, Grid, Container, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Star, Shield, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'var(--color-primary-900)',
        paddingTop: 'var(--space-20)',
        paddingBottom: 'var(--space-8)',
        color: 'white',
      }}
    >
      <Container maxWidth="xl">
        {/* Main Footer Grid */}
        <Grid container spacing={{ xs: 5, md: 6 }} sx={{ marginBottom: 8 }}>
          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ maxWidth: 300 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'var(--gradient-cta)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(230, 57, 70, 0.3)',
                  }}
                >
                  <Box component="span" sx={{ color: 'white', fontWeight: 800, fontSize: 20 }}>A</Box>
                </Box>
                <Box component="span" sx={{ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
                  AthlonX
                </Box>
              </Box>

              <Typography
                sx={{
                  fontSize: '14px',
                  color: 'var(--color-gray-400)',
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
                      color: 'var(--color-gray-600)',
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
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Member App', 'Updates']
            },
            {
              title: 'Company',
              links: ['About Us', 'Contact', 'Blog']
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service', 'Security']
            }
          ].map((column) => (
            <Grid size={{ xs: 6, md: 2 }} key={column.title}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'white',
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
                    key={link}
                    href="#"
                    underline="none"
                    sx={{
                      fontSize: '14px',
                      color: 'var(--color-gray-500)',
                      transition: 'all 0.2s',
                      '&:hover': { color: '#E63946' }
                    }}
                  >
                    {link}
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
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star size={16} color="#E63946" strokeWidth={3} />
            <Typography sx={{ fontSize: '13px', color: 'var(--color-gray-400)', fontWeight: 600 }}>
              4.9/5 RATING
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={16} color="#E63946" strokeWidth={3} />
            <Typography sx={{ fontSize: '13px', color: 'var(--color-gray-400)', fontWeight: 600 }}>
              MILITARY GRADE SECURITY
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} color="#E63946" strokeWidth={3} />
            <Typography sx={{ fontSize: '13px', color: 'var(--color-gray-400)', fontWeight: 600 }}>
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
          <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
            &copy; {new Date().getFullYear()} AthlonX Gym Management. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-500)', cursor: 'pointer', '&:hover': { color: 'white' } }}>
              English (India)
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-500)', cursor: 'pointer', '&:hover': { color: 'white' } }}>
              INR (₹)
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
