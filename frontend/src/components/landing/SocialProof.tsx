
import React from 'react';
import { Box, Typography, Card, Grid, Container, Avatar, Rating } from '@mui/material';
import { Quote, Star, TrendingUp, Clock, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    rating: 5,
    quote: 'We went from losing ₹3.5L/month to 98% collection rate. Added 800+ members because onboarding is finally seamless. This paid for itself in week one.',
    metric: '98.7% Collection Rate',
    metricIcon: TrendingUp,
    name: 'Rahul Sharma',
    role: 'Owner, Iron Temple Fitness',
    location: 'Mumbai, Maharashtra',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=DC2626&color=fff',
    delay: 0,
  },
  {
    id: 2,
    rating: 5,
    quote: "Spend 15 minutes on admin instead of 3 hours. My no-show rate dropped to 4%. My revenue went up 67%. AthlonX is the best investment I've made.",
    metric: '67% Revenue Growth',
    metricIcon: Clock,
    name: 'Priya Patel',
    role: 'Head Trainer, FitLife Studios',
    location: 'Bangalore, Karnataka',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=DC2626&color=fff',
    delay: 0.1,
  },
  {
    id: 3,
    rating: 5,
    quote: "Booking classes and tracking PRs is finally easy. I've been to 6 gyms before - none of them made it this easy to stay consistent. Down 15kg.",
    metric: '15kg Weight Loss',
    metricIcon: Award,
    name: 'Arjun Reddy',
    role: 'Member for 2 years',
    location: 'Hyderabad, Telangana',
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Reddy&background=DC2626&color=fff',
    delay: 0.2,
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
    transition: { staggerChildren: 0.15 },
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

export default function SocialProof() {
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
      {/* Background Section Glow */}
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '400px',
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.04) 0%, transparent 70%)',
        filter: 'blur(100px)',
        zIndex: -1,
      }} />

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
              Real World Impact
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
                maxWidth: 800,
                marginX: 'auto',
              }}
            >
              The Precision Edge <br />
              <span className="text-gradient">in Real Time.</span>
            </Typography>
          </motion.div>
        </Box>

        {/* Testimonials Grid - Staggered Appearance */}
        <Grid 
          container 
          spacing={4}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, idx) => (
            <Grid 
              item 
              xs={12} 
              md={4} 
              key={testimonial.id}
              sx={{ 
                marginTop: { md: idx === 1 ? 6 : 0 } // Staggered height
              }}
            >
              <Card
                component={motion.div}
                variants={itemVariants}
                whileHover={{ y: -12 }}
                className="premium-card"
                sx={{
                  padding: { xs: 4, md: 5 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Quote 
                  size={60} 
                  color="var(--color-crimson)" 
                  style={{ opacity: 0.05, position: 'absolute', top: 20, right: 20 }} 
                />

                <Box sx={{ display: 'flex', gap: 0.5, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill="var(--color-accent-gold)" color="var(--color-accent-gold)" />
                  ))}
                </Box>

                <Typography
                  sx={{
                    fontSize: '17px',
                    fontWeight: 400,
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    marginBottom: 5,
                    flex: 1,
                    fontStyle: 'italic',
                    position: 'relative',
                  }}
                >
                  "{testimonial.quote}"
                </Typography>

                <Box
                  sx={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                  }}
                >
                  <testimonial.metricIcon size={18} color="var(--color-accent-emerald)" strokeWidth={2.5} />
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--color-accent-emerald)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {testimonial.metric}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Avatar
                    src={testimonial.avatar}
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      border: '2px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.2 }}>
                      <Typography sx={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>
                        {testimonial.name}
                      </Typography>
                      <CheckCircle2 size={14} color="var(--color-accent-cyan)" fill="rgba(6,182,212,0.1)" />
                    </Box>
                    <Typography sx={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dynamic Stats Section */}
        <Box sx={{ marginTop: { xs: 12, md: 20 } }}>
          <Grid 
            container 
            spacing={3} 
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
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    textAlign: 'center',
                    padding: { xs: 4, md: 6 },
                    borderRadius: '32px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `radial-gradient(circle at 50% 0%, ${stat.color}0a 0%, transparent 70%)`,
                      zIndex: 0,
                    }
                  }}
                >
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: '16px', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 25px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    <stat.icon size={28} color={stat.color} />
                  </Box>
                  <Typography sx={{ 
                    fontSize: { xs: '36px', md: '48px' }, 
                    fontWeight: 950, 
                    color: 'white', 
                    marginBottom: 1, 
                    fontFamily: 'var(--font-family-display)',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '12px', 
                    fontWeight: 800, 
                    color: 'var(--text-tertiary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.2em',
                    position: 'relative',
                    zIndex: 1,
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
