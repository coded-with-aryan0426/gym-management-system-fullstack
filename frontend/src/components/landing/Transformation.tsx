
import React from 'react';
import { Box, Typography, Chip, Paper, Grid, Container } from '@mui/material';
import { Zap, TrendingUp, Target, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const transformationStages = [
  {
    id: 1,
    stage: 'Week 1',
    icon: Zap,
    color: 'var(--color-accent-cyan)',
    headline: 'Instant Clarity',
    description: 'Import members. Automate your first payment run. See your real numbers for the first time.',
    outcome: 'Eliminate Sheet-Stress',
  },
  {
    id: 2,
    stage: 'Month 1',
    icon: TrendingUp,
    color: 'var(--color-accent-emerald)',
    headline: 'Operational Flow',
    description: 'Automated booking and trainer management. Staff and members sync effortlessly.',
    outcome: '10+ Hours/wk Saved',
  },
  {
    id: 3,
    stage: 'Month 3',
    icon: Target,
    color: 'var(--color-accent-gold)',
    headline: 'Conversion Edge',
    description: 'Member experience rivals big chains. Retention is up. Referrals are flowing.',
    outcome: '15% Churn Reduction',
  },
  {
    id: 4,
    stage: 'Month 6+',
    icon: Rocket,
    color: 'var(--color-crimson)',
    headline: 'Scale Mode',
    description: 'Open location #2. Multi-location systems scale with you. Inevitable growth.',
    outcome: 'Multi-Gym Ready',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Transformation() {
  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        paddingY: { xs: '100px', md: '160px' },
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 12 }}>
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
              The Evolution
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '36px', md: '56px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'white',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              From Chaos to <span style={{ color: 'var(--text-tertiary)' }}>Empire.</span>
            </Typography>
          </motion.div>
        </Box>

        {/* Stages Container */}
        <Box sx={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
          {/* Timeline Linker (Desktop) */}
          <Box
            sx={{
              position: 'absolute',
              top: '50px',
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
              display: { xs: 'none', md: 'block' },
              zIndex: 0,
            }}
          />

          <Grid 
            container 
            spacing={4}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {transformationStages.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Box
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Icon Circle */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '24px',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4,
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                         borderColor: item.color,
                         transform: 'scale(1.1) rotate(5deg)',
                         backgroundColor: 'rgba(255,255,255,0.05)',
                      }
                    }}
                  >
                    <item.icon size={32} color={item.color} />
                  </Box>
                  
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 2,
                    }}
                  >
                    {item.stage}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '20px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-family-display)',
                      color: 'white',
                      marginBottom: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    {item.headline}
                  </Typography>
                  
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      marginBottom: 3,
                      textAlign: 'center',
                      maxWidth: 240,
                    }}
                  >
                    {item.description}
                  </Typography>
                  
                  <Chip
                    label={item.outcome}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                      height: 28,
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      '& .MuiChip-label': { paddingX: 1.5 }
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
