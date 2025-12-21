
import React from 'react';
import { Box, Typography, Card, Grid, Container, Avatar } from '@mui/material';
import { Quote, Star, TrendingUp, Clock, Award } from 'lucide-react';
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
  hidden: { y: 20, opacity: 0 },
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
        backgroundColor: 'var(--bg-primary)',
        paddingY: { xs: '100px', md: '160px' },
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
        }
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', marginBottom: 10 }}>
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
              Testimonials
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
              The Precision Edge <span style={{ color: 'var(--text-tertiary)' }}>in Action.</span>
            </Typography>
          </motion.div>
        </Box>

        {/* Testimonials Grid */}
        <Grid 
          container 
          spacing={4}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Card
                component={motion.div}
                variants={itemVariants}
                className="premium-card"
                sx={{
                  padding: 5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <Quote 
                  size={40} 
                  color="var(--color-crimson)" 
                  style={{ opacity: 0.1, position: 'absolute', top: 20, right: 30 }} 
                />

                <Box sx={{ display: 'flex', gap: 0.5, marginBottom: 3 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="var(--color-accent-gold)" color="var(--color-accent-gold)" />
                  ))}
                </Box>

                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    marginBottom: 4,
                    flex: 1,
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.quote}"
                </Typography>

                <Box
                  sx={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 16px',
                    marginBottom: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    alignSelf: 'flex-start',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <testimonial.metricIcon size={14} color="var(--color-accent-emerald)" />
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-accent-emerald)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {testimonial.metric}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={testimonial.avatar}
                    sx={{ width: 48, height: 48, border: '1px solid var(--border-subtle)' }}
                  />
                  <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
                      {testimonial.name}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <Grid 
          container 
          spacing={3} 
          sx={{ marginTop: 12 }}
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
                  padding: 4,
                  borderRadius: '24px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '14px', 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <stat.icon size={24} color={stat.color} />
                </Box>
                <Typography sx={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: 0.5, fontFamily: 'var(--font-family-display)' }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
