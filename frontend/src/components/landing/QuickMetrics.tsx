import React from 'react';
import { Box, Typography, Container, Grid, Paper, Divider } from '@mui/material';
import { Users, TrendingUp, Calendar, Zap, ArrowUpRight, Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const metrics = [
  {
    id: 1,
    label: 'Total Members',
    value: '8,432',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: '#06b6d4',
  },
  {
    id: 2,
    label: 'Monthly Revenue',
    value: '₹42,85,000',
    change: '+18.2%',
    trend: 'up',
    icon: TrendingUp,
    color: '#DC2626',
  },
  {
    id: 3,
    label: 'Average Attendance',
    value: '85%',
    change: '+5.4%',
    trend: 'up',
    icon: Calendar,
    color: '#10b981',
  },
  {
    id: 4,
    label: 'Active Sessions',
    value: '142',
    change: '-2.1%',
    trend: 'down',
    icon: Activity,
    color: '#fbbf24',
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
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function QuickMetrics() {
  return (
    <Box
      sx={{
        backgroundColor: '#000000',
        paddingBottom: { xs: '80px', md: '120px' },
        position: 'relative',
        zIndex: 2,
        marginTop: '-100px', 
      }}
    >
      <Container maxWidth="lg">
        <motion.div
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
        >
          <Grid container spacing={3}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.id}>
                <motion.div variants={itemVariants}>
                  <Paper
                    className="premium-card"
                    sx={{
                      padding: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(26, 26, 26, 0.6) !important', // Explicitly dark
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '20px',
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          backgroundColor: `${metric.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${metric.color}40`,
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
                            color: metric.trend === 'up' ? '#10b981' : '#DC2626',
                          }}
                        >
                          {metric.change}
                        </Typography>
                        <ArrowUpRight 
                          size={14} 
                          color={metric.trend === 'up' ? '#10b981' : '#DC2626'}
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
                          color: 'rgba(255, 255, 255, 0.5)',
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
                          color: '#ffffff',
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
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

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
              <Box className="animate-pulse" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                System Status: <Box component="span" sx={{ color: '#ffffff' }}>Optimal</Box>
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', height: 20, display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Zap size={14} color="#fbbf24" />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                Sync Latency: <Box component="span" sx={{ color: '#ffffff' }}>14ms</Box>
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', height: 20, display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Shield size={14} color="#06b6d4" />
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                Security Tier: <Box component="span" sx={{ color: '#ffffff' }}>Enterprise</Box>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
