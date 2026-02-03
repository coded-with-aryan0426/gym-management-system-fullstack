"use client";

import React from 'react';
import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Grid, Container } from '@mui/material';
import { Crown, Target, Smartphone, Settings, Check, ArrowRight, Lock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const valueTiers = [
  {
    id: 1,
    icon: Crown,
    title: 'Owner Command Center',
    subtitle: 'Complete business intelligence suite',
    value: '₹2,49,750',
    features: [
      'Real-time revenue dashboard',
      'Multi-location management',
      'Staff payroll & commission tracking',
      'Financial reports & projections',
      'Automated billing & dunning',
      'Business analytics & insights',
    ],
  },
  {
    id: 2,
    icon: Target,
    title: 'Trainer Toolkit',
    subtitle: 'Client management powerhouse',
    value: '₹1,24,750',
    features: [
      'Client management system',
      'Workout plan builder (drag & drop)',
      'Progress photo comparisons',
      'Session scheduling & reminders',
      'Commission tracking',
      'In-app client messaging',
    ],
  },
  {
    id: 3,
    icon: Smartphone,
    title: 'Member Experience',
    subtitle: 'White-labeled mobile app',
    value: '₹83,250',
    features: [
      'Branded mobile app (YOUR logo)',
      'Easy class booking',
      'Personal progress tracking',
      'Workout history & PRs',
      'In-app payments (UPI, Cards)',
      'Push notification engagement',
    ],
  },
  {
    id: 4,
    icon: Settings,
    title: 'Operations Engine',
    subtitle: 'Automate your entire gym',
    value: '₹1,24,750',
    features: [
      'Check-in system (QR/biometric)',
      'Equipment maintenance tracking',
      'Class capacity management',
      'Staff scheduling',
      'Inventory management',
      'Automated member communications',
    ],
  },
];

export default function ValueStack() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Box
      sx={{
        backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC',
        paddingY: { xs: '80px', md: '120px' },
        borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        transition: 'background-color 0.3s ease'
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 8, maxWidth: 800, marginX: 'auto' }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#E63946',
              marginBottom: 2,
            }}
          >
            THE VALUE
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '36px', md: '56px' },
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              color: isDark ? 'white' : '#0F172A',
              lineHeight: 1.1,
              letterSpacing: '-1px',
              marginBottom: 3
            }}
          >
            Everything You Need to Dominate
          </Typography>
          <Typography
            sx={{
              fontSize: '18px',
              color: isDark ? 'var(--color-gray-500)' : '#64748B',
              lineHeight: 1.6
            }}
          >
            Don't just buy software. Buy the complete operating system for your gym's future.
          </Typography>
        </Box>

        {/* Value Tiers Grid */}
        <Grid container spacing={3}>
          {valueTiers.map((tier) => (
            <Grid size={{ xs: 12, md: 6 }} key={tier.id}>
              <Card
                  sx={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '24px',
                    padding: 4,
                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: 'rgba(230, 57, 70, 0.3)',
                      transform: 'translateY(-4px)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    },
                  }}
                >
                {/* Header Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: 'var(--gradient-cta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(230, 57, 70, 0.2)'
                    }}
                  >
                    <tier.icon size={28} color="white" />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-gray-600)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {tier.value} value
                  </Typography>
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: '22px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: isDark ? 'white' : '#0F172A',
                    marginBottom: 1,
                  }}
                >
                  {tier.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    color: isDark ? 'var(--color-gray-500)' : '#64748B',
                    marginBottom: 4,
                    fontWeight: 500
                  }}
                >
                  {tier.subtitle}
                </Typography>

                {/* Feature List */}
                <List sx={{ padding: 0 }}>
                  {tier.features.map((feature) => (
                    <ListItem
                      key={feature}
                      sx={{
                        paddingY: 1,
                        paddingX: 0,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Check size={18} color="#E63946" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          fontSize: '15px',
                          color: isDark ? 'var(--color-gray-400)' : '#64748B',
                          fontWeight: 400
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Price Summary Card */}
        <Paper
          sx={{
            maxWidth: 540,
            margin: '0 auto',
            marginTop: 10,
            padding: 5,
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: '32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(230, 57, 70, 0.3)',
            boxShadow: '0 0 40px rgba(230, 57, 70, 0.1)',
          }}
        >
          <Typography
            sx={{
              fontSize: '16px',
              color: isDark ? 'var(--color-gray-500)' : '#64748B',
              textDecoration: 'line-through',
              marginBottom: 1,
              fontWeight: 600
            }}
          >
            Total Value: ₹5,82,500
          </Typography>

          <Typography
            sx={{
              fontSize: '13px',
              color: '#E63946',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 800,
              marginBottom: 1,
            }}
          >
            YOUR INVESTMENT
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, marginBottom: 1 }}>
            <Typography
              sx={{
                fontSize: '64px',
                fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                color: isDark ? 'white' : '#0F172A',
                letterSpacing: '-2px'
              }}
            >
              ₹4,999
            </Typography>
            <Typography
              sx={{
                fontSize: '20px',
                color: isDark ? 'var(--color-gray-500)' : '#64748B',
                fontWeight: 600
              }}
            >
              /month
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: '14px',
              color: isDark ? 'var(--color-gray-500)' : '#64748B',
              marginBottom: 4,
            }}
          >
            That's ₹166/day — less than a single personal training session
          </Typography>

          <Box
            sx={{
              backgroundColor: 'rgba(230, 57, 70, 0.1)',
              borderRadius: '12px',
              padding: 2.5,
              marginBottom: 4,
              border: '1px solid rgba(230, 57, 70, 0.2)'
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#E63946',
              }}
            >
              One late payment collected pays for your entire year.
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{
              height: 64,
              background: 'var(--gradient-cta)',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 800,
              textTransform: 'none',
              color: 'white',
              boxShadow: '0 10px 30px rgba(230, 57, 70, 0.4)',
              marginBottom: 2.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 40px rgba(230, 57, 70, 0.6)',
              }
            }}
            endIcon={<ArrowRight size={22} />}
          >
            Start Your 14-Day Free Trial
          </Button>

          <Typography
            sx={{
              fontSize: '14px',
              color: isDark ? 'var(--color-gray-500)' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              fontWeight: 500
            }}
          >
            <Lock size={16} color="#E63946" />
            No credit card required. Cancel anytime.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
