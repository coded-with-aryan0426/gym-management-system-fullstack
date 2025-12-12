"use client";

import React from 'react';
import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Grid, Container } from '@mui/material';
import { Crown, Target, Smartphone, Settings, Check, ArrowRight, Lock } from 'lucide-react';

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
  return (
    <Box
      sx={{
        backgroundColor: 'var(--color-gray-50)',
        paddingY: { xs: '80px', md: '120px' },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 8, maxWidth: 700, marginX: 'auto' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '32px', md: '48px' },
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-primary-900)',
              marginBottom: 2,
            }}
          >
            The Value Stack That Makes Saying "No" Feel Stupid
          </Typography>
          <Typography
            sx={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-gray-500)',
            }}
          >
            Don't just buy software. Buy a complete business transformation system.
          </Typography>
        </Box>

        {/* Value Tiers Grid */}
        <Grid container spacing={3}>
          {valueTiers.map((tier) => (
            <Grid size={{ xs: 12, md: 6 }} key={tier.id}>
              <Card
                sx={{
                  backgroundColor: 'var(--color-white)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 4,
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-gray-200)',
                  height: '100%',
                  transition: 'var(--transition-base)',
                  '&:hover': {
                    boxShadow: 'var(--shadow-lg)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Header Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--gradient-cta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <tier.icon size={28} color="var(--color-primary-900)" />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 700,
                      color: 'var(--color-gray-400)',
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
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-gray-900)',
                    marginBottom: 1,
                  }}
                >
                  {tier.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-gray-500)',
                    marginBottom: 3,
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
                        <Check size={18} color="var(--color-success)" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-gray-700)',
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
            maxWidth: 480,
            margin: '0 auto',
            marginTop: 8,
            padding: 5,
            backgroundColor: 'var(--color-primary-800)',
            borderRadius: 'var(--radius-2xl)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Background Gradient Decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'var(--gradient-cta)',
            }}
          />

          <Typography
            sx={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-gray-400)',
              textDecoration: 'line-through',
              marginBottom: 1,
            }}
          >
            Total Value: ₹5,82,500
          </Typography>

          <Typography
            sx={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-gray-300)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wide)',
              marginBottom: 1,
            }}
          >
            Your Investment
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, marginBottom: 1 }}>
            <Typography
              sx={{
                fontSize: 'var(--text-5xl)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'var(--gradient-cta)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ₹4,999
            </Typography>
            <Typography
              sx={{
                fontSize: 'var(--text-xl)',
                color: 'var(--color-gray-400)',
              }}
            >
              /month
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-gray-400)',
              marginBottom: 4,
            }}
          >
            That's ₹166/day — less than a protein shake
          </Typography>

          <Box
            sx={{
              backgroundColor: 'rgba(0, 245, 160, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: 2,
              marginBottom: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--color-accent-green)',
              }}
            >
              The cost of just 2 members who don't churn pays for an entire year
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{
              height: 56,
              background: 'var(--gradient-cta)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              textTransform: 'none',
              color: 'var(--color-primary-900)',
              boxShadow: 'var(--shadow-glow-green)',
              marginBottom: 2
            }}
            endIcon={<ArrowRight size={20} />}
          >
            Start Free 14-Day Trial
          </Button>

          <Typography
            sx={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-gray-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Lock size={14} />
            No credit card required • Cancel anytime
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
