
import { Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Grid, Container } from '@mui/material';
import { Crown, Target, Smartphone, Settings, Check, ArrowRight, Lock, Zap, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const valueTiers = [
  {
    id: 1,
    icon: Crown,
    color: 'var(--color-accent-gold)',
    title: 'Owner Command Center',
    subtitle: 'Complete business intelligence',
    value: '₹2,49,750',
    description: 'Stop guessing. Start leading with real-time data and automated multi-location reporting.',
    features: [
      'Real-time revenue dashboard',
      'Multi-location management',
      'Staff payroll & commission',
      'Financial reports & projections',
      'Automated billing & dunning',
      'Business analytics & insights',
    ],
    size: 'large',
  },
  {
    id: 2,
    icon: Target,
    color: 'var(--color-accent-cyan)',
    title: 'Trainer Toolkit',
    subtitle: 'Management powerhouse',
    value: '₹1,24,750',
    description: 'Empower your staff with industry-leading client tracking and workout orchestration.',
    features: [
      'Client management system',
      'Workout plan builder (drag & drop)',
      'Progress photo comparisons',
      'Session scheduling & reminders',
      'Commission tracking',
      'In-app client messaging',
    ],
    size: 'small',
  },
  {
    id: 3,
    icon: Smartphone,
    color: 'var(--color-accent-pink)',
    title: 'Member Experience',
    subtitle: 'White-labeled mobile app',
    value: '₹83,250',
    description: 'Your brand, in their pocket. A seamless interaction layer that keeps members coming back.',
    features: [
      'Branded mobile app (YOUR logo)',
      'Easy class booking',
      'Personal progress tracking',
      'Workout history & PRs',
      'In-app payments (UPI, Cards)',
      'Push notification engagement',
    ],
    size: 'small',
  },
  {
    id: 4,
    icon: Settings,
    color: 'var(--color-accent-emerald)',
    title: 'Operations Engine',
    subtitle: 'Automate your entire gym',
    value: '₹1,24,750',
    description: 'The digital nervous system of your facility. Zero friction, zero manual errors.',
    features: [
      'Check-in system (QR/biometric)',
      'Equipment maintenance tracking',
      'Class capacity management',
      'Staff scheduling',
      'Inventory management',
      'Automated member communications',
    ],
    size: 'large',
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
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ValueStack() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

  const yOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        backgroundColor: 'transparent',
        paddingY: { xs: '120px', md: '200px' },
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.03) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: -1,
      }} />

      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: { xs: 8, md: 12 }, maxWidth: 900, marginX: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              sx={{
                fontSize: { xs: '12px', md: '14px' },
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'var(--color-crimson)',
                marginBottom: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                '&::before, &::after': {
                  content: '""',
                  width: '30px',
                  height: '1px',
                  background: 'var(--color-crimson)',
                  opacity: 0.5
                }
              }}
            >
              The Full Stack
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '40px', md: '72px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'white',
                marginBottom: 4,
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            >
              Saying "No" Should Feel <br />
              <span className="text-gradient">Physically Impossible.</span>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '18px', md: '22px' },
                color: 'var(--text-secondary)',
                maxWidth: 700,
                margin: '0 auto',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Don't just buy software. Buy a complete business transformation system optimized for high-performance gyms that demand perfection.
            </Typography>
          </motion.div>
        </Box>

        {/* Value Tiers Grid - Asymmetrical Layout */}
        <Grid 
          container 
          spacing={4}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          sx={{ alignItems: 'stretch' }}
        >
          {valueTiers.map((tier, index) => (
            <Grid 
              item 
              xs={12} 
              md={tier.size === 'large' ? 7 : 5} 
              key={tier.id}
              sx={{ 
                order: { 
                  xs: index, 
                  md: index === 1 ? 2 : index === 2 ? 1 : index 
                } 
              }}
            >
              <Card
                component={motion.div}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="premium-card"
                sx={{
                  padding: { xs: 4, md: 6 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  background: tier.size === 'large' 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                    : 'rgba(255,255,255,0.015)',
                  borderColor: tier.size === 'large' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                }}
              >
                {/* Decorative Icon Background */}
                <tier.icon 
                  size={200} 
                  style={{ 
                    position: 'absolute', 
                    top: -40, 
                    right: -40, 
                    opacity: 0.02, 
                    color: tier.color,
                    transform: 'rotate(15deg)'
                  }} 
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <tier.icon size={32} color={tier.color} />
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--text-tertiary)',
                        textDecoration: 'line-through',
                        opacity: 0.5,
                      }}
                    >
                      {tier.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: tier.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      Market Value
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '28px', md: '36px' },
                    fontWeight: 900,
                    fontFamily: 'var(--font-family-display)',
                    color: 'white',
                    marginBottom: 2,
                    lineHeight: 1.1,
                  }}
                >
                  {tier.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '16px',
                    color: 'var(--text-secondary)',
                    marginBottom: 4,
                    lineHeight: 1.6,
                    maxWidth: tier.size === 'large' ? '80%' : '100%',
                  }}
                >
                  {tier.description}
                </Typography>

                {/* Feature List */}
                <Box sx={{ marginTop: 'auto' }}>
                  <List sx={{ 
                    padding: 0, 
                    display: 'grid', 
                    gridTemplateColumns: tier.size === 'large' ? { xs: '1fr', sm: '1fr 1fr' } : '1fr', 
                    gap: 2 
                  }}>
                    {tier.features.map((feature) => (
                      <ListItem
                        key={feature}
                        sx={{
                          padding: 0,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}>
                            <Check size={12} color="var(--color-accent-emerald)" strokeWidth={3} />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pricing Impact Card */}
        <Box sx={{ marginTop: { xs: 15, md: 25 }, position: 'relative' }}>
          {/* Glowing Background Ring */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '140%',
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 60%)',
            zIndex: 0,
            pointerEvents: 'none',
          }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Paper
              sx={{
                maxWidth: 800,
                margin: '0 auto',
                padding: { xs: 6, md: 10 },
                borderRadius: { xs: '40px', md: '60px' },
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    py: 1,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    marginBottom: 4,
                  }}
                >
                  <TrendingUp size={16} color="var(--color-crimson)" />
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                    }}
                  >
                    Limited Time Beta Pricing
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: '40px', md: '56px' },
                    fontWeight: 900,
                    fontFamily: 'var(--font-family-display)',
                    color: 'white',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    marginBottom: 4,
                  }}
                >
                   One System. <br />
                   <span style={{ color: 'var(--color-crimson)' }}>Zero Limitations.</span>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: '80px', md: '120px' },
                      fontWeight: 950,
                      fontFamily: 'var(--font-family-display)',
                      color: 'white',
                      lineHeight: 0.9,
                      letterSpacing: '-0.05em',
                      textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                  >
                    ₹4,999
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '24px', md: '32px' },
                      color: 'var(--text-tertiary)',
                      fontWeight: 700,
                    }}
                  >
                    /mo
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: '18px',
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  Replace 12 tools. Save 40+ hours a month. <br />
                  <span style={{ color: 'white' }}>Cancel any time. No hidden BS.</span>
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  className="btn-premium btn-premium-primary"
                  sx={{
                    height: 80,
                    fontSize: '22px',
                    fontWeight: 800,
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)',
                    marginBottom: 4
                  }}
                  endIcon={<ArrowRight size={28} />}
                >
                  Unleash Precision Access
                </Button>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Lock size={16} color="var(--text-tertiary)" />
                    <Typography sx={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      No credit card required
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Zap size={16} color="var(--color-accent-gold)" />
                    <Typography sx={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      Instant setup in 60 seconds
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
