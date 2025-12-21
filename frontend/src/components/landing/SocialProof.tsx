
import React from 'react';
import { Box, Typography, Card, Grid, Container, Avatar } from '@mui/material';
import { Quote, Star, TrendingUp, Clock, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    rating: 5,
    quote: 'We went from losing ₹3.5L/month to 98% collection rate. This paid for itself in week one.',
    metric: '98% Collections',
    metricIcon: TrendingUp,
    name: 'Rahul Sharma',
    role: 'Owner, Iron Temple',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=DC2626&color=fff',
  },
  {
    id: 2,
    rating: 5,
    quote: "Spend 15 mins on admin instead of 3 hours. Revenue went up 67%. Best investment.",
    metric: '67% Growth',
    metricIcon: Clock,
    name: 'Priya Patel',
    role: 'Head Trainer, FitLife',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=DC2626&color=fff',
  },
  {
    id: 3,
    rating: 5,
    quote: "Booking classes is finally easy. None of the others made it this easy to stay consistent.",
    metric: '15kg Lost',
    metricIcon: Award,
    name: 'Arjun Reddy',
    role: 'Member, PowerGym',
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Reddy&background=DC2626&color=fff',
  },
];

const stats = [
  { label: 'Trust Score', value: '4.9/5', icon: Star, color: 'var(--color-accent-gold)' },
  { label: 'Gyms Joined', value: '5K+', icon: Award, color: 'var(--color-accent-cyan)' },
  { label: 'Time Saved', value: '85%', icon: Clock, color: 'var(--color-accent-emerald)' },
  { label: 'Revenue Lift', value: '32%', icon: TrendingUp, color: 'var(--color-crimson)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function SocialProof() {
  return (
    <Box
      sx={{
        backgroundColor: 'transparent',
        paddingY: { xs: '80px', md: '120px' },
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
              Real World Impact
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
                maxWidth: 700,
                marginX: 'auto',
              }}
            >
              The Precision Edge <br />
              <span className="text-gradient">in Real Time.</span>
            </Typography>
          </motion.div>
        </Box>

        {/* Testimonials Grid */}
        <Grid 
          container 
          spacing={3}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Card
                component={motion.div}
                variants={itemVariants}
                className="premium-card"
                sx={{
                  padding: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255,255,255,0.015)',
                  borderColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.5, marginBottom: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill="var(--color-accent-gold)" color="var(--color-accent-gold)" />
                  ))}
                </Box>

                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    marginBottom: 3,
                    flex: 1,
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.quote}"
                </Typography>

                <Box
                  sx={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <testimonial.metricIcon size={14} color="var(--color-accent-emerald)" />
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-accent-emerald)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {testimonial.metric}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={testimonial.avatar}
                    sx={{ width: 40, height: 40, border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>
                        {testimonial.name}
                      </Typography>
                      <CheckCircle2 size={12} color="var(--color-accent-cyan)" />
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dense Stats Section */}
        <Box sx={{ marginTop: { xs: 8, md: 12 } }}>
          <Grid 
            container 
            spacing={2} 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Box
                  component={motion.div}
                  variants={itemVariants}
                  sx={{
                    textAlign: 'center',
                    padding: 3,
                    borderRadius: '24px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '10px', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 15px',
                  }}>
                    <stat.icon size={20} color={stat.color} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: { xs: '28px', md: '36px' }, 
                    fontWeight: 950, 
                    color: 'white', 
                    lineHeight: 1,
                    marginBottom: 0.5, 
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    color: 'var(--text-tertiary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                  }}>
                    {stat.label}
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
