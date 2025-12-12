
import React from 'react';
import { Box, Typography, Card, Chip, Grid, Container } from '@mui/material';
import { TrendingDown, Calendar, Frown } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    target: 'For Gym Owners',
    icon: TrendingDown,
    iconBg: 'rgba(239, 68, 68, 0.1)',
    iconColor: 'var(--color-error)',
    headline: 'Revenue Leaking Through the Cracks',
    agitation: "Missed payments. Manual invoicing. No idea which membership tier actually makes money. You're working IN your gym instead of ON your gym.",
  },
  {
    id: 2,
    target: 'For Trainers',
    icon: Calendar,
    iconBg: 'rgba(245, 158, 11, 0.1)',
    iconColor: 'var(--color-warning)',
    headline: 'Clients Ghosting. Schedule Chaos.',
    agitation: 'Texting back and forth to book sessions. No-shows killing your income. Zero visibility into client progress. You became a trainer, not an admin.',
  },
  {
    id: 3,
    target: 'For Members',
    icon: Frown,
    iconBg: 'rgba(139, 92, 246, 0.1)',
    iconColor: '#8B5CF6',
    headline: "Booking Shouldn't Feel Like a Workout",
    agitation: "Outdated apps. Can't see trainer availability. Payments failing. Progress tracking scattered across 5 different apps.",
  },
];

export default function Problem() {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--color-primary-900)',
        paddingY: { xs: '80px', md: '120px' },
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 8 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--color-error)',
              marginBottom: 2,
            }}
          >
            The Hard Truth
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '32px', md: '48px' },
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              color: 'white',
              maxWidth: 700,
              margin: '0 auto',
            }}
          >
            Is Your Gym Running You, Or Are You Running Your Gym?
          </Typography>
        </Box>

        {/* Problem Cards */}
        <Grid container spacing={4}>
          {problems.map((item, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 4,
                    height: '100%',
                    transition: 'var(--transition-base)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'var(--color-accent-orange)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Icon Container */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 3,
                    }}
                  >
                    <item.icon size={28} color={item.iconColor} />
                  </Box>

                  {/* Badge */}
                  <Chip
                    label={item.target}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 107, 53, 0.15)',
                      color: 'var(--color-accent-orange)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      marginBottom: 2,
                      height: 24,
                    }}
                  />

                  {/* Headline */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-white)',
                      marginBottom: 2,
                    }}
                  >
                    {item.headline}
                  </Typography>

                  {/* Agitation Text */}
                  <Typography
                    sx={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 400,
                      lineHeight: 'var(--leading-relaxed)',
                      color: 'var(--color-gray-400)',
                    }}
                  >
                    {item.id === 1 ? (
                      <>
                        Missed payments. Manual invoicing. No idea which membership tier actually makes money. You're working <Box component="span" sx={{ color: 'var(--color-error)', fontWeight: 600 }}>IN</Box> your gym instead of <Box component="span" sx={{ color: 'var(--color-success)', fontWeight: 600 }}>ON</Box> your gym.
                        </>
                    ) : (
                      item.agitation
                    )}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Transition Statement */}
        <Box
          sx={{
            maxWidth: 800,
            margin: '64px auto 0',
            padding: 4,
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderLeft: '4px solid var(--color-accent-orange)',
            borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
          }}
        >
           <Typography
            sx={{
              fontSize: 'var(--text-lg)',
              fontStyle: 'italic',
              color: 'var(--color-gray-300)',
              lineHeight: 'var(--leading-relaxed)',
            }}
           >
            "I built AthlonX because I was tired of using 5 different softwares just to keep my gym open. I wanted one dashboard that told me the truth about my business."
            <Box component="span" sx={{ display: 'block', marginTop: 2, fontStyle: 'normal', fontWeight: 600, color: 'white' }}>
              — Aryan, Founder of AthlonX
            </Box>
           </Typography>
        </Box>
      </Container>
    </Box>
  );
}
