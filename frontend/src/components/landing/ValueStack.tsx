
import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Grid, Container, Chip } from '@mui/material';
import { Crown, Target, Smartphone, Settings, Check, ArrowRight, Lock, Zap, TrendingUp } from 'lucide-react';

const valueTiers = [
  {
    id: 1,
    icon: Crown,
    color: 'var(--color-accent-gold)',
    title: 'Owner Command Center',
    subtitle: 'Business Intelligence',
    value: '₹2,49,750',
    description: 'Lead with real-time data and automated multi-location reporting.',
    features: [
      'Real-time revenue dashboard',
      'Multi-location management',
      'Financial projections',
      'Automated billing',
    ],
  },
  {
    id: 2,
    icon: Target,
    color: 'var(--color-accent-cyan)',
    title: 'Trainer Toolkit',
    subtitle: 'Management Powerhouse',
    value: '₹1,24,750',
    description: 'Empower staff with client tracking and workout orchestration.',
    features: [
      'Workout plan builder',
      'Progress photo comparisons',
      'Session reminders',
      'In-app messaging',
    ],
  },
  {
    id: 3,
    icon: Smartphone,
    color: 'var(--color-accent-pink)',
    title: 'Member Experience',
    subtitle: 'Mobile App',
    value: '₹83,250',
    description: 'A seamless interaction layer that keeps members coming back.',
    features: [
      'Branded mobile app',
      'Easy class booking',
      'Workout history',
      'In-app payments',
    ],
  },
  {
    id: 4,
    icon: Settings,
    color: 'var(--color-accent-emerald)',
    title: 'Operations Engine',
    subtitle: 'Automation',
    value: '₹1,24,750',
    description: 'The digital nervous system of your facility. Zero manual errors.',
    features: [
      'QR Check-in system',
      'Inventory management',
      'Staff scheduling',
      'Auto-communications',
    ],
  },
];

export default function ValueStack() {
  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        paddingY: { xs: '80px', md: '120px' },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: { xs: 6, md: 8 }, maxWidth: 800, marginX: 'auto' }}>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-crimson)',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
              }}
            >
              The Full Stack
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '32px', md: '48px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'white',
                marginBottom: 2.5,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              Saying "No" Should Feel <br />
              <span className="text-gradient">Physically Impossible.</span>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '15px', md: '17px' },
                color: 'var(--text-secondary)',
                maxWidth: 600,
                margin: '0 auto',
                lineHeight: 1.5,
              }}
            >
              Don't just buy software. Buy a complete business transformation system optimized for high-performance gyms.
            </Typography>
        </Box>

        {/* Value Tiers Grid - 2x2 Grid */}
        <Grid 
          container 
          spacing={3}
        >
          {valueTiers.map((tier) => (
            <Grid item xs={12} sm={6} md={3} key={tier.id}>
              <Card
                className="premium-card"
                sx={{
                  padding: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  '&:hover': {
                    borderColor: tier.color,
                    background: 'rgba(255,255,255,0.03)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <tier.icon size={20} color={tier.color} />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 800, color: tier.color, textTransform: 'uppercase' }}>
                      Market Value
                    </Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', opacity: 0.6 }}>
                      {tier.value}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-family-display)',
                    color: 'white',
                    marginBottom: 1,
                  }}
                >
                  {tier.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {tier.description}
                </Typography>

                <Box sx={{ marginTop: 'auto' }}>
                  <List sx={{ padding: 0 }}>
                    {tier.features.map((feature) => (
                      <ListItem key={feature} sx={{ padding: '2px 0' }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Check size={14} color="var(--color-accent-emerald)" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pricing Card - Compact */}
        <Box sx={{ marginTop: { xs: 8, md: 12 }, position: 'relative' }}>
            <Paper
              sx={{
                maxWidth: 600,
                margin: '0 auto',
                padding: { xs: 4, md: 6 },
                borderRadius: '32px',
                textAlign: 'center',
                background: 'rgba(10,10,10,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
              }}
            >
              <Chip
                label="Limited Beta"
                sx={{
                  height: 24,
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: 'white',
                  marginBottom: 2.5,
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: '28px', md: '36px' },
                  fontWeight: 900,
                  fontFamily: 'var(--font-family-display)',
                  color: 'white',
                  marginBottom: 2,
                }}
              >
                 One System. <span style={{ color: 'var(--color-crimson)' }}>Zero Limits.</span>
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, marginBottom: 3 }}>
                <Typography sx={{ fontSize: { xs: '64px', md: '80px' }, fontWeight: 950, color: 'white' }}>
                  ₹4,999
                </Typography>
                <Typography sx={{ fontSize: '20px', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  /mo
                </Typography>
              </Box>

              <Typography sx={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: 4 }}>
                Replace all tools and save 40+ hours. Cancel anytime.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                className="btn-premium btn-premium-primary"
                sx={{
                  height: 56,
                  fontSize: '18px',
                  fontWeight: 800,
                  borderRadius: '16px',
                }}
                endIcon={<ArrowRight size={20} />}
              >
                Get Started Now
              </Button>
            </Paper>
        </Box>
      </Container>
    </Box>
  );
}
