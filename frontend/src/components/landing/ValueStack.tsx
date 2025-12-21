
import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Grid, Container } from '@mui/material';
import { Crown, Target, Smartphone, Settings, Check, ArrowRight, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const valueTiers = [
  {
    id: 1,
    icon: Crown,
    color: 'var(--color-accent-gold)',
    title: 'Owner Command Center',
    subtitle: 'Complete business intelligence',
    value: '₹2,49,750',
    features: [
      'Real-time revenue dashboard',
      'Multi-location management',
      'Staff payroll & commission',
      'Financial reports & projections',
      'Automated billing & dunning',
      'Business analytics & insights',
    ],
  },
  {
    id: 2,
    icon: Target,
    color: 'var(--color-accent-cyan)',
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
    color: 'var(--color-accent-pink)',
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
    color: 'var(--color-accent-emerald)',
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function ValueStack() {
  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        paddingY: { xs: '100px', md: '160px' },
        position: 'relative',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
        }
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 10, maxWidth: 800, marginX: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--color-crimson)',
                marginBottom: 2.5,
              }}
            >
              The Full Stack
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '36px', md: '56px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'white',
                marginBottom: 3,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Saying "No" Should Feel <span style={{ color: 'var(--text-tertiary)' }}>Impossible.</span>
            </Typography>
            <Typography
              sx={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Don't just buy software. Buy a complete business transformation system optimized for high-performance gyms.
            </Typography>
          </motion.div>
        </Box>

        {/* Value Tiers Grid */}
        <Grid 
          container 
          spacing={3}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {valueTiers.map((tier) => (
            <Grid item xs={12} md={6} key={tier.id}>
              <Card
                component={motion.div}
                variants={itemVariants}
                className="premium-card"
                sx={{
                  padding: { xs: 4, md: 5 },
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  overflow: 'hidden',
                }}
              >
                {/* Header Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <tier.icon size={28} color={tier.color} />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      textDecoration: 'line-through',
                      opacity: 0.6,
                    }}
                  >
                    {tier.value} value
                  </Typography>
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: '24px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-family-display)',
                    color: 'white',
                    marginBottom: 1,
                  }}
                >
                  {tier.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    marginBottom: 4,
                  }}
                >
                  {tier.subtitle}
                </Typography>

                {/* Feature List */}
                <List sx={{ padding: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  {tier.features.map((feature) => (
                    <ListItem
                      key={feature}
                      sx={{
                        paddingY: 0.5,
                        paddingX: 0,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Check size={16} color="var(--color-accent-emerald)" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Paper
            className="glass-effect-heavy"
            sx={{
              maxWidth: 600,
              margin: '0 auto',
              marginTop: 12,
              padding: { xs: 5, md: 8 },
              borderRadius: '32px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-premium-xl)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
            }}
          >
            {/* Background Glow */}
            <Box sx={{
              position: 'absolute',
              top: '-20%',
              left: '-20%',
              width: '140%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 60%)',
              zIndex: 0,
              pointerEvents: 'none',
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                sx={{
                  fontSize: '16px',
                  color: 'var(--text-tertiary)',
                  textDecoration: 'line-through',
                  marginBottom: 1,
                  fontWeight: 600,
                }}
              >
                Total Market Value: ₹5,82,500
              </Typography>

              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'var(--color-crimson)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontWeight: 800,
                  marginBottom: 2,
                }}
              >
                Your Elite Investment
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1.5, marginBottom: 2 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '64px', md: '80px' },
                    fontWeight: 900,
                    fontFamily: 'var(--font-family-display)',
                    color: 'white',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  ₹4,999
                </Typography>
                <Typography
                  sx={{
                    fontSize: '20px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                  }}
                >
                  /mo
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1.5, 
                marginBottom: 5,
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                width: 'fit-content',
                margin: '0 auto 40px',
                border: '1px solid var(--border-subtle)',
              }}>
                <Zap size={16} color="var(--color-accent-gold)" />
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  Less than ₹166/day — The cost of 1 PT session
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                className="btn-premium btn-premium-primary"
                sx={{
                  height: 64,
                  fontSize: '18px',
                  marginBottom: 3
                }}
                endIcon={<ArrowRight size={22} />}
              >
                Start Your 14-Day Free Trial
              </Button>

              <Typography
                sx={{
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  fontWeight: 500,
                }}
              >
                <Lock size={14} />
                No credit card required • Precision access starting instantly
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
