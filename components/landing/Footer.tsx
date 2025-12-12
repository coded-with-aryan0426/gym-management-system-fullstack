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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 3 }}>
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
                <Box component="span" sx={{ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)' }}>
                  AthlonX
                </Box>
              </Box>

              <Typography
                sx={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-gray-400)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: 3,
                }}
              >
                Power every rep. Track every rupee. The all-in-one platform for modern Indian gyms.
              </Typography>

              {/* Social Icons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <IconButton key={idx} size="small" sx={{ color: 'var(--color-gray-400)', '&:hover': { color: 'white' } }}>
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
              links: ['Features', 'Pricing', 'Member App', 'Changelog', 'Roadmap']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Contact', 'Partners']
            },
            {
              title: 'Resources',
              links: ['Help Center', 'API Documentation', 'Community', 'Gym Success Guide']
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']
            }
          ].map((column) => (
            <Grid size={{ xs: 6, sm: 3, md: 2 }} key={column.title}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--color-white)',
                  marginBottom: 3,
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {column.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {column.links.map(link => (
                  <Link
                    key={link}
                    href="#"
                    underline="none"
                    sx={{
                      fontSize: '15px',
                      color: 'var(--color-gray-400)',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'var(--color-accent-blue)' }
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
            paddingBottom: 5,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-300)' }}>
              <strong>4.9/5</strong> Rating
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={16} color="var(--color-success)" />
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-300)' }}>
              ISO 27001 Certified
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} color="var(--color-accent-blue)" />
            <Typography sx={{ fontSize: '14px', color: 'var(--color-gray-300)' }}>
              99.99% Uptime SLA
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
