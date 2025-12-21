
import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import { Zap, TrendingUp, Target, Rocket, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const transformationStages = [
  { id: 1, stage: 'Week 1', icon: Zap, color: 'var(--color-accent-cyan)', headline: 'Instant Clarity', outcome: 'Eliminate Stress' },
  { id: 2, stage: 'Month 1', icon: TrendingUp, color: 'var(--color-accent-emerald)', headline: 'Operational Flow', outcome: 'Saved 10h/wk' },
  { id: 3, stage: 'Month 3', icon: Target, color: 'var(--color-accent-gold)', headline: 'Conversion Edge', outcome: 'Churn Reduction' },
  { id: 4, stage: 'Month 6+', icon: Rocket, color: 'var(--color-crimson)', headline: 'Scale Mode', outcome: 'Multi-Gym Ready' },
];

export default function Transformation() {
  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        paddingY: { xs: '60px', md: '100px' },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: { xs: 6, md: 8 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-crimson)',
                marginBottom: 2,
              }}
            >
              The Evolution
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '32px', md: '48px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'white',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                marginBottom: 2,
              }}
            >
              From Chaos to <span className="text-gradient">Empire.</span>
            </Typography>
            <Typography
              sx={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                maxWidth: 480,
                margin: '0 auto',
                lineHeight: 1.5,
              }}
            >
              A systematic roadmap to reclaim your time and dominate your market.
            </Typography>
          </motion.div>
        </Box>

        {/* Stages Container */}
        <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
          <Grid container spacing={3}>
            {transformationStages.map((item, index) => (
              <Grid item xs={6} md={3} key={item.id}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '10px',
                      fontWeight: 900,
                      color: item.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 2,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${item.color}20`,
                    }}
                  >
                    {item.stage}
                  </Typography>

                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 2,
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                         borderColor: item.color,
                         transform: 'translateY(-5px)',
                         background: 'rgba(255,255,255,0.04)',
                      }
                    }}
                  >
                    <item.icon size={28} color={item.color} />
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
                    {item.headline}
                  </Typography>

                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <ChevronRight size={12} color={item.color} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>
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
