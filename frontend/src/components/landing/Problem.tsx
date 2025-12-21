
import React from 'react';
import { Box, Typography, Card, Grid, Container, Chip, Stack, Avatar } from '@mui/material';
import { TrendingDown, Calendar, Frown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    target: 'Gym Owners',
    icon: TrendingDown,
    color: 'var(--color-crimson)',
    bg: 'rgba(220, 38, 38, 0.1)',
    headline: 'Revenue Leaking',
    agitation: "Missed payments. Manual invoicing. No idea which tier actually makes money.",
  },
  {
    id: 2,
    target: 'Trainers',
    icon: Calendar,
    color: 'var(--color-amber)',
    bg: 'rgba(245, 158, 11, 0.1)',
    headline: 'Client Chaos',
    agitation: 'Texting to book sessions. No-shows killing income. Zero progress visibility.',
  },
  {
    id: 3,
    target: 'Members',
    icon: Frown,
    color: 'var(--color-ocean)',
    bg: 'rgba(59, 130, 246, 0.1)',
    headline: 'Friction-Heavy',
    agitation: "Outdated apps. Payments failing. Progress tracking scattered everywhere.",
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

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] },
  },
};

export default function Problem() {
  return (
    <Box
      sx={{
        backgroundColor: '#050505',
        paddingY: { xs: '80px', md: '120px' },
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
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.03) 0%, transparent 70%)',
        filter: 'blur(120px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: { xs: 6, md: 8 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Chip
              label="The Friction"
              sx={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: 'var(--color-crimson)',
                fontWeight: 800,
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: 2,
                height: 26,
                border: '1px solid rgba(220, 38, 38, 0.2)',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '32px', md: '48px' },
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                letterSpacing: '-0.03em',
                color: 'white',
                maxWidth: 800,
                margin: '0 auto',
                lineHeight: 1.1,
              }}
            >
              Is Your Gym Running You, <br />
              <Box component="span" sx={{ opacity: 0.3 }}>Or Are You Running Your Gym?</Box>
            </Typography>
          </motion.div>
        </Box>

        {/* Problem Cards - Compact Grid */}
        <Grid 
          container 
          spacing={3}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {problems.map((item, index) => (
            <Grid item xs={12} md={4} key={item.id}>
              <Card
                component={motion.div}
                variants={cardVariants}
                sx={{
                  height: '100%',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '24px',
                  padding: { xs: 3, md: 4 },
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    borderColor: 'rgba(220, 38, 38, 0.2)',
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    '& .problem-icon': {
                      color: 'var(--color-crimson)',
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 3,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <item.icon className="problem-icon" size={24} color={item.color} style={{ transition: 'all 0.3s ease' }} />
                </Box>
                
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '22px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-family-display)',
                    color: 'var(--text-primary)',
                    marginBottom: 1.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.headline}
                </Typography>
                
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    marginBottom: 3,
                  }}
                >
                  {item.agitation}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-crimson)', opacity: 0.6 }}>
                  <AlertCircle size={14} />
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Systemic Failure
                  </Typography>
                </Box>

                {/* Decorative index */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 20,
                    fontSize: '64px',
                    fontWeight: 900,
                    color: 'white',
                    opacity: 0.03,
                    zIndex: 0,
                    pointerEvents: 'none',
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  0{index + 1}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Founder Quote - Optimized and Compact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box
            sx={{
              maxWidth: 800,
              margin: '80px auto 0',
              padding: { xs: 4, md: 6 },
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '32px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
             <Typography
                sx={{
                  fontSize: { xs: '18px', md: '24px' },
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: 'white',
                  lineHeight: 1.4,
                  marginBottom: 4,
                  letterSpacing: '-0.01em',
                }}
             >
              "I built AthlonX because I was tired of using 5 different softwares just to keep my gym open. I wanted one dashboard that told me the truth about my business."
             </Typography>
             
             <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <Avatar 
                  src="https://ui-avatars.com/api/?name=Aryan+Suthar&background=DC2626&color=fff" 
                  sx={{ width: 48, height: 48, border: '1px solid var(--color-crimson)' }} 
                />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '16px' }}>
                    Aryan Suthar
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: 'var(--color-crimson)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
