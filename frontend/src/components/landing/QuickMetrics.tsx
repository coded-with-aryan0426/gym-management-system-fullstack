
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Paper, Divider } from '@mui/material';
import { Users, TrendingUp, Calendar, Zap, ArrowUpRight, Activity, Shield } from 'lucide-react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

function Counter({ value, prefix = "", suffix = "" }: { value: string, prefix?: string, suffix?: string }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 2,
      onUpdate: (value) => setDisplayValue(Math.floor(value)),
      ease: "easeOut"
    });
    return () => controls.stop();
  }, [numericValue]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

const metrics = [
  {
    id: 1,
    label: 'Total Members',
    value: '8432',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: '#06b6d4',
  },
  {
    id: 2,
    label: 'Monthly Revenue',
    value: '4285000',
    prefix: '₹',
    change: '+18.2%',
    trend: 'up',
    icon: TrendingUp,
    color: '#DC2626',
  },
  {
    id: 3,
    label: 'Attendance Rate',
    value: '85',
    suffix: '%',
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
        marginTop: { xs: '-60px', md: '-100px' }, 
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
                      padding: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.5,
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(20, 20, 20, 0.8) !important',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '24px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          backgroundColor: `${metric.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${metric.color}30`,
                        }}
                      >
                        <metric.icon size={24} color={metric.color} />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          padding: '6px 10px',
                          borderRadius: '10px',
                          backgroundColor: metric.trend === 'up' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                          border: `1px solid ${metric.trend === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: metric.trend === 'up' ? '#10b981' : '#DC2626',
                          }}
                        >
                          {metric.change}
                        </Typography>
                        <ArrowUpRight 
                          size={14} 
                          strokeWidth={3}
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
                          fontWeight: 700,
                          color: 'var(--text-tertiary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: 1,
                        }}
                      >
                        {metric.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '36px',
                          fontWeight: 950,
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                          fontFamily: 'var(--font-family-display)',
                        }}
                      >
                        <Counter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                      </Typography>
                    </Box>
  
                    {/* Animated Waveform placeholder */}
                    <Box sx={{ height: 30, width: '100%', marginTop: 'auto', opacity: 0.4 }}>
                       <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <motion.path 
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            d={metric.trend === 'up' 
                              ? "M0 25 Q 20 20, 40 15 T 60 10 T 80 5 T 100 0" 
                              : "M0 5 Q 20 10, 40 15 T 60 20 T 80 25 T 100 30"} 
                            fill="none" 
                            stroke={metric.color} 
                            strokeWidth="3" 
                            strokeLinecap="round"
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
           transition={{ delay: 0.8, duration: 1 }}
        >
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 3, md: 6 },
              flexWrap: 'wrap',
              padding: '20px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981', 
                  boxShadow: '0 0 15px #10b981',
                  animation: 'pulse 2s infinite'
                }} 
              />
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Status: <span style={{ color: 'white' }}>Mission Ready</span>
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Zap size={16} color="#fbbf24" fill="#fbbf2433" />
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Latency: <span style={{ color: 'white' }}>12ms</span>
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Shield size={16} color="#DC2626" fill="#DC262633" />
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Security: <span style={{ color: 'white' }}>Military Grade</span>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
