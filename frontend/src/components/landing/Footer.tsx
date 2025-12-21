import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Stack, Divider } from '@mui/material';
import { 
  Instagram, 
  Twitter, 
  LinkedIn, 
  Facebook,
  Mail,
  Phone,
  LocationOn
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Integration', href: '#integration' }
  ],
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' }
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Security', href: '/security' }
  ]
};

const socialLinks = [
  { icon: <Facebook fontSize="small" />, href: '#', label: 'Facebook' },
  { icon: <Twitter fontSize="small" />, href: '#', label: 'Twitter' },
  { icon: <Instagram fontSize="small" />, href: '#', label: 'Instagram' },
  { icon: <LinkedIn fontSize="small" />, href: '#', label: 'LinkedIn' }
];

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        pt: { xs: 6, md: 8 },
        pb: 4,
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="img"
                  src="/images/logo.png"
                  alt="GymFlow"
                  sx={{ height: 32, width: 'auto' }}
                />
                <Typography variant="h6" fontWeight="700" color="text.primary">
                  GymFlow
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.6 }}>
                Revolutionizing fitness management with AI-driven insights and premium tools for growth-minded gym owners.
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    size="small"
                    component={motion.a}
                    whileHover={{ y: -2 }}
                    href={social.href}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main', bgcolor: 'primary.main + 10' }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {Object.entries(footerLinks).map(([category, links]) => (
                <Grid item xs={6} sm={4} key={category}>
                  <Typography variant="subtitle2" fontWeight="600" mb={2} color="text.primary">
                    {category}
                  </Typography>
                  <Stack spacing={1}>
                    {links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, opacity: 0.1 }} />

        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm="auto">
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} GymFlow Technologies Inc. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Mail sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">hello@gymflow.io</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">San Francisco, CA</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
