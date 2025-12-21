
import React from 'react';
import { Box, Typography, Card, Grid, Container, Chip, Stack, Avatar } from '@mui/material';
import { TrendingDown, Calendar, Frown, Quote, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    target: 'Gym Owners',
    icon: TrendingDown,
    color: 'var(--color-crimson)',
    bg: 'rgba(220, 38, 38, 0.1)',
    headline: 'Revenue Leaking Everywhere',
    agitation: "Missed payments. Manual invoicing. No idea which tier actually makes money. You're working IN your gym instead of ON your gym.",
  },
  {
    id: 2,
    target: 'Trainers',
    icon: Calendar,
    color: 'var(--color-accent-gold)',
    bg: 'rgba(251, 191, 36, 0.1)',
    headline: 'Client Ghosting & Chaos',
    agitation: 'Texting back and forth to book sessions. No-shows killing your income. Zero progress visibility. You became a trainer, not an admin.',
  },
  {
    id: 3,
    target: 'Members',
    icon: Frown,
    color: 'var(--color-accent-cyan)',
    bg: 'rgba(6, 182, 212, 0.1)',
    headline: 'Friction-Heavy Experience',
    agitation: "Outdated apps. Can't see availability. Payments failing. Progress tracking scattered across 5 different apps.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 1, cubicBezier: [0.16, 1, 0.3, 1] },
  },
};

export default function Problem() {
  return (
    <Box
      sx={{
        backgroundColor: '#050505',
        paddingY: { xs: '120px', md: '200px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dark Ambient Glow */}
      <Box sx={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)',
        filter: 'blur(120px)',
        zIndex: 0,
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Chip
              label="The Friction"
              component={motion.div}
              sx={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: 'var(--color-crimson)',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: 3,
                height: 32,
                border: '1px solid rgba(220, 38, 38, 0.2)',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '40px', md: '72px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                letterSpacing: '-0.04em',
                color: 'white',
                maxWidth: 900,
                margin: '0 auto',
                lineHeight: 1.05,
              }}
            >
              Is Your Gym Running You, <br />
              <Box component="span" sx={{ opacity: 0.3 }}>Or Are You Running Your Gym?</Box>
            </Typography>
          </motion.div>
        </Box>

        {/* Problem Cards - Emotional & Dramatic */}
        <Stack 
          spacing={4} 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {problems.map((item, index) => (
            <Card
              key={item.id}
              component={motion.div}
              variants={cardVariants}
              sx={{
                backgroundColor: '#0a0a0a',
                borderRadius: '32px',
                padding: { xs: 4, md: 6 },
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-10px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                  '& .problem-icon-container': {
                    transform: 'scale(1.1) rotate(5deg)',
                    borderColor: item.color,
                  }
                }
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={2}>
                  <Box
                    className="problem-icon-container"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '24px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <item.icon size={48} color={item.color} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={7}>
                  <Chip 
                    label={item.target}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-tertiary)',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 2,
                      height: 28,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '24px', md: '36px' },
                      fontWeight: 900,
                      fontFamily: 'var(--font-family-display)',
                      color: 'var(--text-primary)',
                      marginBottom: 2,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.headline}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '16px', md: '18px' },
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      maxWidth: 600,
                    }}
                  >
                    {item.agitation}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={3} sx={{ textAlign: { md: 'right' } }}>
                   <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: item.color, opacity: 0.8 }}>
                      <AlertCircle size={18} />
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                         Systemic Failure
                      </Typography>
                   </Box>
                </Grid>
              </Grid>

              {/* Decorative background number */}
              <Typography
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: 20,
                  fontSize: '180px',
                  fontWeight: 900,
                  color: 'white',
                  opacity: 0.02,
                  zIndex: 0,
                  pointerEvents: 'none',
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                0{index + 1}
              </Typography>
            </Card>
          ))}
        </Stack>

        {/* Founder Quote - Optimized for emotional impact */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <Box
            sx={{
              maxWidth: 960,
              margin: '120px auto 0',
              padding: { xs: 5, md: 8 },
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '48px',
              textAlign: 'center',
              position: 'relative',
              '&::before': {
                content: '"“"',
                position: 'absolute',
                top: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '160px',
                color: 'var(--color-crimson)',
                opacity: 0.1,
                fontFamily: 'serif',
              }
            }}
          >
             <Typography
              sx={{
                fontSize: { xs: '20px', md: '32px' },
                fontWeight: 600,
                fontStyle: 'italic',
                color: 'white',
                lineHeight: 1.4,
                marginBottom: 6,
                letterSpacing: '-0.01em',
              }}
             >
              "I built AthlonX because I was tired of using 5 different softwares just to keep my gym open. I wanted one dashboard that told me the truth about my business."
             </Typography>
             
             <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                  <Avatar 
                    src="https://ui-avatars.com/api/?name=Aryan+Suthar&background=DC2626&color=fff" 
                    sx={{ width: 64, height: 64, border: '2px solid var(--color-crimson)', boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' }} 
                  />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '20px' }}>
                    Aryan Suthar
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: 'var(--color-crimson)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Founder & CEO, AthlonX
                  </Typography>
                </Box>
             </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
