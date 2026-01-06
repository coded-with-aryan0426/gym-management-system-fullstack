"use client";

import React from 'react';
import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Grid, Container } from '@mui/material';
import { Crown, Target, Smartphone, Settings, Check, ArrowRight, Zap, Shield, Trophy } from 'lucide-react';

const valueTiers = [
  {
    id: 1,
    icon: Crown,
    title: 'Owner Command Center',
    subtitle: 'Complete business intelligence suite',
    value: '₹2,49,750',
    color: '#E63946',
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
    color: '#4361EE',
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
    color: '#06D6A0',
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
    color: '#F77F00',
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
      id="features"
      sx={{
        backgroundColor: '#050505',
        paddingY: { xs: '80px', md: '120px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 8, maxWidth: 800, marginX: 'auto' }}>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#E63946',
              marginBottom: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Zap size={16} /> THE ECOSYSTEM
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '32px', md: '48px' },
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 3
            }}
          >
            One Platform. <br />
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.4)' }}>Limitless Growth.</Box>
          </Typography>
          <Typography
            sx={{
              fontSize: '16px',
              color: 'var(--color-gray-400)',
              lineHeight: 1.6,
              maxWidth: 600,
              marginX: 'auto'
            }}
          >
            A suite of professional-grade tools engineered to automate your operations and amplify your member experience.
          </Typography>
        </Box>

        {/* Value Tiers Grid */}
        <Grid container spacing={4}>
          {valueTiers.map((tier) => (
            <Grid item xs={12} md={6} key={tier.id}>
              <Card
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '24px',
                  padding: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: '100%',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: tier.color,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: tier.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <tier.icon size={28} color="white" />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.2)',
                      textDecoration: 'line-through',
                    }}
                  >
                    {tier.value}
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: 1,
                  }}
                >
                  {tier.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'var(--color-gray-500)',
                    marginBottom: 4,
                  }}
                >
                  {tier.subtitle}
                </Typography>

                <List sx={{ padding: 0 }}>
                  {tier.features.map((feature) => (
                    <ListItem
                      key={feature}
                      sx={{
                        paddingY: 1,
                        paddingX: 0,
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Check size={16} color={tier.color} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          fontSize: '14px',
                          color: 'var(--color-gray-400)',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Investment Card */}
        <Box sx={{ marginTop: 10 }}>
          <Paper
            sx={{
              maxWidth: 600,
              margin: '0 auto',
              padding: 6,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '32px',
              textAlign: 'center',
              border: '1px solid rgba(230, 57, 70, 0.2)',
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
                color: '#E63946',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: 800,
                marginBottom: 2,
              }}
            >
              PREMIUM ACCESS
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, marginBottom: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: '48px', md: '64px' },
                  fontWeight: 900,
                  color: 'white',
                  lineHeight: 1
                }}
              >
                ₹4,999
              </Typography>
              <Typography
                sx={{
                  fontSize: '20px',
                  color: 'rgba(255,255,255,0.3)',
                  fontWeight: 600
                }}
              >
                /mo
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: '15px',
                color: 'var(--color-gray-400)',
                marginBottom: 4,
              }}
            >
              That's ₹166/day — less than a single personal training session.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              sx={{
                height: 56,
                background: 'var(--gradient-cta)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'none',
                color: 'white',
                marginBottom: 3,
              }}
              endIcon={<ArrowRight size={20} />}
            >
              Start Free Trial
            </Button>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield size={16} color="#06D6A0" />
                <Typography sx={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Secure</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Trophy size={16} color="#FFD700" />
                <Typography sx={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Top Rated</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
