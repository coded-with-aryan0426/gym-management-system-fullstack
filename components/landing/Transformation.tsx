"use client";

import React from 'react';
import { Box, Typography, Chip, Paper, Grid, Container } from '@mui/material';
import { Zap, TrendingUp, Target, Rocket } from 'lucide-react';

const transformationStages = [
  {
    id: 1,
    stage: 'Stage 1',
    icon: Zap,
    headline: 'Instant Clarity',
    description: 'Import your members. Automate your first payment run. See your real numbers for the first time.',
    outcome: 'Stop drowning in spreadsheets',
    timeline: 'Week 1',
  },
  {
    id: 2,
    stage: 'Stage 2',
    icon: TrendingUp,
    headline: 'Systems Working FOR You',
    description: 'Members booking themselves. Trainers managing their own schedules. Payments collecting automatically.',
    outcome: '10+ hours/week saved on admin',
    timeline: 'Month 1',
  },
  {
    id: 3,
    stage: 'Stage 3',
    icon: Target,
    headline: 'Competitive Edge',
    description: 'Your member experience rivals big chains. Retention is up. Referrals are flowing. Trainers are happier.',
    outcome: '15% increase in member retention',
    timeline: 'Month 3',
  },
  {
    id: 4,
    stage: 'Stage 4',
    icon: Rocket,
    headline: 'Scale Mode Unlocked',
    description: 'Open location #2. Or #3. Your systems scale with you. What felt impossible now feels inevitable.',
    outcome: 'Ready for multi-location expansion',
    timeline: 'Month 6+',
  },
];

export default function Transformation() {
  return (
    <Box
      sx={{
        background: 'var(--gradient-hero)',
        paddingY: { xs: '80px', md: '120px' },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 10 }}>
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
            THE JOURNEY
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '36px', md: '56px' },
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
            }}
          >
            From Chaos to Empire in 6 Months
          </Typography>
        </Box>

        {/* Timeline Container */}
        <Box sx={{ position: 'relative', maxWidth: 1000, margin: '0 auto' }}>
          {/* Connector Line (Desktop) */}
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(100% - 40px)',
              left: '10%',
              right: '10%',
              height: 2,
              background: 'rgba(230, 57, 70, 0.1)',
              display: { xs: 'none', md: 'block' },
            }}
          />

          <Grid container spacing={4}>
            {transformationStages.map((item) => (
              <Grid item xs={12} md={3} key={item.id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Stage Card */}
                  <Paper
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '24px',
                      padding: 3,
                      marginBottom: 3,
                      textAlign: 'center',
                      maxWidth: 260,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: 'rgba(230, 57, 70, 0.3)',
                      },
                    }}
                  >
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'var(--gradient-cta)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <item.icon size={28} color="white" />
                    </Box>

                    {/* Stage Label */}
                    <Typography
                      sx={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#E63946',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: 1,
                      }}
                    >
                      {item.stage}
                    </Typography>

                    {/* Headline */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: 1.5,
                      }}
                    >
                      {item.headline}
                    </Typography>

                    {/* Description */}
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: 'var(--color-gray-500)',
                        lineHeight: 1.5,
                        marginBottom: 2,
                      }}
                    >
                      {item.description}
                    </Typography>

                    {/* Outcome */}
                    <Chip
                      label={item.outcome}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(230, 57, 70, 0.1)',
                        color: '#E63946',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                      }}
                    />
                  </Paper>

                  {/* Timeline Node */}
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#E63946',
                      marginBottom: 1.5,
                      zIndex: 2,
                    }}
                  />

                  {/* Timeline Label */}
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {item.timeline}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
