
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Users, TrendingUp, Calendar, Zap, ArrowUpRight, Activity, Shield } from 'lucide-react';
import { motion, animate } from 'framer-motion';

function Counter({ value, prefix = "", suffix = "" }: { value: string, prefix?: string, suffix?: string }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 1.5,
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
  { id: 1, label: 'Members', value: '8432', change: '+12%', trend: 'up', icon: Users, color: '#06b6d4' },
  { id: 2, label: 'Revenue', value: '4285000', prefix: '₹', change: '+18%', trend: 'up', icon: TrendingUp, color: '#DC2626' },
  { id: 3, label: 'Attendance', value: '85', suffix: '%', change: '+5%', trend: 'up', icon: Calendar, color: '#10b981' },
  { id: 4, label: 'Sessions', value: '142', change: '-2%', trend: 'down', icon: Activity, color: '#fbbf24' },
];

export default function QuickMetrics() {
  return (
    <Box
      sx={{
        backgroundColor: '#000000',
        paddingBottom: { xs: '60px', md: '80px' },
        position: 'relative',
        zIndex: 2,
        marginTop: { xs: '-40px', md: '-60px' }, 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid item xs={6} md={3} key={metric.id}>
              <Paper
                className="premium-card"
                sx={{
                  padding: { xs: 2.5, md: 3 },
                  background: 'rgba(20, 20, 20, 0.8) !important',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: `${metric.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <metric.icon size={18} color={metric.color} />
                  </Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 800, color: metric.trend === 'up' ? '#10b981' : '#DC2626' }}>
                    {metric.change}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {metric.label}
                </Typography>
                <Typography sx={{ fontSize: { xs: '24px', md: '32px' }, fontWeight: 950, color: '#ffffff', fontFamily: 'var(--font-family-display)' }}>
                  <Counter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, md: 4 },
            flexWrap: 'wrap',
            padding: '12px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Status: <span style={{ color: 'white' }}>Mission Ready</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={14} color="#fbbf24" strokeWidth={3} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Latency: <span style={{ color: 'white' }}>12ms</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={14} color="#DC2626" strokeWidth={3} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Security: <span style={{ color: 'white' }}>Military Grade</span>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
