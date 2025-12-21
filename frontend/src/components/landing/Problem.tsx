
import React from 'react';
import { Box, Typography, Card, Grid, Container, Chip } from '@mui/material';
import { TrendingDown, Calendar, Frown, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    target: 'Gym Owners',
    icon: TrendingDown,
    color: 'var(--color-crimson)',
    bg: 'rgba(220, 38, 38, 0.05)',
    headline: 'Revenue Leaking Everywhere',
    agitation: "Missed payments. Manual invoicing. No idea which tier actually makes money. You're working IN your gym instead of ON your gym.",
  },
  {
    id: 2,
    target: 'Trainers',
    icon: Calendar,
    color: 'var(--color-accent-gold)',
    bg: 'rgba(251, 191, 36, 0.05)',
    headline: 'Client Ghosting & Chaos',
    agitation: 'Texting back and forth to book sessions. No-shows killing your income. Zero progress visibility. You became a trainer, not an admin.',
  },
  {
    id: 3,
    target: 'Members',
    icon: Frown,
    color: 'var(--color-accent-cyan)',
    bg: 'rgba(6, 182, 212, 0.05)',
    headline: 'Friction-Heavy Experience',
    agitation: "Outdated apps. Can't see availability. Payments failing. Progress tracking scattered across 5 different apps.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Problem() {
  return (
      <Box
        sx={{
          backgroundColor: 'transparent',
          paddingY: { xs: '100px', md: '160px' },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 70%)',
            zIndex: 0,
          }
        }}
      >
      {/* Background Decorative Element */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.03) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
              The Friction
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '36px', md: '56px' },
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
              <Box component="span" sx={{ color: 'var(--text-tertiary)' }}>Or Are You Running Your Gym?</Box>
            </Typography>
          </motion.div>
        </Box>

        {/* Problem Cards */}
        <Grid 
          container 
          spacing={4} 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {problems.map((item) => (
            <Grid item xs={12} md={4} key={item.id}>
              <Card
                component={motion.div}
                variants={cardVariants}
                className="premium-card"
                sx={{
                  padding: { xs: 4, md: 5 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle at top right, ${item.bg}, transparent 70%)`,
                    opacity: 0.5,
                  }
                }}
              >
                {/* Icon Container */}
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 4,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <item.icon size={28} color={item.color} />
                </Box>

                <Chip 
                  label={item.target}
                  sx={{
                    width: 'fit-content',
                    backgroundColor: item.bg,
                    color: item.color,
                    fontWeight: 700,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 3,
                    height: 24,
                    border: `1px solid ${item.bg}`,
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    fontSize: '22px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-family-display)',
                    color: 'var(--text-primary)',
                    marginBottom: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {item.headline}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {item.agitation}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Founder Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Box
            sx={{
              maxWidth: 860,
              margin: '100px auto 0',
              padding: { xs: 4, md: 6 },
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '32px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Quote 
              size={48} 
              color="var(--color-crimson)" 
              style={{ opacity: 0.1, position: 'absolute', top: 20, left: 30 }} 
            />
            
             <Typography
              sx={{
                fontSize: { xs: '18px', md: '22px' },
                fontWeight: 500,
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 1,
              }}
             >
              "I built AthlonX because I was tired of using 5 different softwares just to keep my gym open. I wanted one dashboard that told me the truth about my business."
             </Typography>
             
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <Box 
                  component="img" 
                  src="/images/founder-avatar.png" 
                  onError={(e: any) => e.target.src = "https://ui-avatars.com/api/?name=Aryan&background=DC2626&color=fff"}
                  sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-crimson)' }} 
                />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>
                    Aryan Suthar
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    Founder & CEO, AthlonX
                  </Typography>
                </Box>
             </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
