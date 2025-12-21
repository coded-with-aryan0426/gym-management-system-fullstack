
import React from 'react';
import { Box, Typography, Chip, Grid, Container } from '@mui/material';
import { Zap, TrendingUp, Target, Rocket, ChevronRight } from 'lucide-react';
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
  hidden: { y: 40, opacity: 0 },
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
        paddingY: { xs: '120px', md: '200px' },
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: { xs: 8, md: 15 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'var(--color-crimson)',
                marginBottom: 3,
              }}
            >
              The Evolution
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '40px', md: '64px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'white',
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                marginBottom: 3,
              }}
            >
              From Chaos to <span className="text-gradient">Empire.</span>
            </Typography>
            <Typography
              sx={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                maxWidth: 600,
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              A systematic roadmap to reclaim your time and dominate your market.
            </Typography>
          </motion.div>
        </Box>

        {/* Stages Container */}
        <Box sx={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
          {/* Animated Progress Line (Desktop) */}
          <Box
            sx={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              right: '50px',
              height: '2px',
              background: 'linear-gradient(90deg, var(--color-accent-cyan) 0%, var(--color-accent-emerald) 33%, var(--color-accent-gold) 66%, var(--color-crimson) 100%)',
              opacity: 0.15,
              display: { xs: 'none', md: 'block' },
              zIndex: 0,
            }}
          />

          <Grid 
            container 
            spacing={6}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {transformationStages.map((item, index) => (
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
                  {/* Stage Indicator */}
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 900,
                      color: item.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      marginBottom: 3,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${item.color}20`,
                    }}
                  >
                    {item.stage}
                  </Typography>

                  {/* Icon Circle */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '32px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4,
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px ${item.color}10`,
                      '&:hover': {
                         borderColor: item.color,
                         transform: 'translateY(-10px) rotate(5deg)',
                         boxShadow: `0 20px 40px ${item.color}15`,
                      },
                      '&::after': {
                        content: index < transformationStages.length - 1 ? '""' : 'none',
                        position: 'absolute',
                        right: '-40px',
                        top: '50%',
                        width: '20px',
                        height: '2px',
                        background: 'rgba(255,255,255,0.05)',
                        display: { xs: 'none', md: 'block' }
                      }
                    }}
                  >
                    <item.icon size={40} color={item.color} strokeWidth={1.5} />
                  </Box>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '22px',
                      fontWeight: 900,
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
                      fontSize: '15px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      marginBottom: 4,
                      textAlign: 'center',
                      maxWidth: 240,
                    }}
                  >
                    {item.description}
                  </Typography>
                  
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <ChevronRight size={14} color={item.color} />
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'white',
                      }}
                    >
                      {item.outcome}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
