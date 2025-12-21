
import React from 'react';
import { Box, Typography, Container, Grid, Paper, Divider } from '@mui/material';
import { Users, TrendingUp, Calendar, Zap, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const metrics = [
  {
    id: 1,
    label: 'Total Members',
    value: '8,432',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'var(--color-accent-cyan)',
  },
  {
    id: 2,
    label: 'Monthly Revenue',
    value: '₹42,85,000',
    change: '+18.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'var(--color-crimson)',
  },
  {
    id: 3,
    label: 'Average Attendance',
    value: '85%',
    change: '+5.4%',
    trend: 'up',
    icon: Calendar,
    color: 'var(--color-accent-emerald)',
  },
  {
    id: 4,
    label: 'Active Sessions',
    value: '142',
    change: '-2.1%',
    trend: 'down',
    icon: Activity,
    color: 'var(--color-accent-gold)',
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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function QuickMetrics() {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--bg-primary)',
        paddingBottom: { xs: '80px', md: '120px' },
        position: 'relative',
        zIndex: 2,
        marginTop: '-60px', // Pull up to overlap hero slightly for dashboard feel
      }}
    >
      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={3}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.id}>
              <Paper
                component={motion.div}
                variants={itemVariants}
                className="premium-card"
                sx={{
                  padding: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'rgba(13, 13, 13, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      backgroundColor: `${metric.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${metric.color}30`,
                    }}
                  >
                    <metric.icon size={22} color={metric.color} />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      padding: '4px 8px',
                      borderRadius: '8px',
                      backgroundColor: metric.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: metric.trend === 'up' ? 'var(--color-accent-emerald)' : 'var(--color-crimson)',
                      }}
                    >
                      {metric.change}
                    </Typography>
                    <ArrowUpRight 
                      size={14} 
                      color={metric.trend === 'up' ? 'var(--color-accent-emerald)' : 'var(--color-crimson)'}
                      style={{ transform: metric.trend === 'down' ? 'rotate(90deg)' : 'none' }}
                    />
                  </Box>
                </Box>

                {/* Content */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 0.5,
                    }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '32px',
                      fontWeight: 900,
                      color: 'white',
                      fontFamily: 'var(--font-family-display)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Box>

                {/* Mini Graph Placeholder */}
                <Box sx={{ height: 40, width: '100%', marginTop: 'auto', opacity: 0.3 }}>
                   <svg width="100%" height="40" viewBox="0 0 100 40">
                      <path 
                        d={metric.trend === 'up' 
                          ? "M0 35 Q 25 30, 40 20 T 70 15 T 100 5" 
                          : "M0 5 Q 25 10, 40 20 T 70 25 T 100 35"} 
                        fill="none" 
                        stroke={metric.color} 
                        strokeWidth="2" 
                      />
                   </svg>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Dynamic Activity Indicators */}
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.5, duration: 1 }}
        >
          <Box
            sx={{
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box className="animate-pulse" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-accent-emerald)', boxShadow: '0 0 10px var(--color-accent-emerald)' }} />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                System Status: <Box component="span" sx={{ color: 'white' }}>Optimal</Box>
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--border-subtle)', height: 20, display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Zap size={14} color="var(--color-accent-gold)" />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Sync Latency: <Box component="span" sx={{ color: 'white' }}>14ms</Box>
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--border-subtle)', height: 20, display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Shield size={14} color="var(--color-accent-cyan)" />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Security Tier: <Box component="span" sx={{ color: 'white' }}>Enterprise</Box>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
