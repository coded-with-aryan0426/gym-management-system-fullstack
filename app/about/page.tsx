"use client";

import React from 'react';
import { Box, Typography, Container, Grid, Button, Avatar, Chip } from '@mui/material';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BoltIcon from '@mui/icons-material/Bolt';

const MotionBox = motion(Box);

const bentoTransition = { duration: 0.5, ease: [0.23, 1, 0.32, 1] };

export default function AboutPage() {
  return (
    <Box sx={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white', overflow: 'hidden', position: 'relative' }}>
      <Header />
      
      {/* Background Energetic Accents */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: '10%', 
          left: '-10%', 
          width: '50vw', 
          height: '50vw', 
          background: 'radial-gradient(circle, rgba(230, 57, 70, 0.05) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'pulse 10s infinite alternate'
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: '10%', 
          right: '-10%', 
          width: '40vw', 
          height: '40vw', 
          background: 'radial-gradient(circle, rgba(255, 159, 28, 0.05) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'pulse 12s infinite alternate-reverse'
        }} />
        <Box sx={{ 
          position: 'absolute', 
          top: '40%', 
          right: '10%', 
          width: '30vw', 
          height: '30vw', 
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </Box>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>

      <main style={{ position: 'relative', zIndex: 1 }}>
          {/* Hero Section */}
          <Box sx={{ pt: { xs: '100px', md: '140px' }, pb: '40px' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography variant="h1" sx={{ 
                    fontSize: { xs: '32px', md: '48px' }, 
                    fontWeight: 900, 
                    mb: 2, 
                    lineHeight: 1.1,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #ffffff 30%, #FF9F1C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase'
                  }}>
                    Built for the <br /> 
                    <span style={{ color: '#E63946', WebkitTextFillColor: '#E63946' }}>Unstoppable.</span>
                  </Typography>
                  <Typography sx={{ 
                    fontSize: { xs: '16px', md: '18px' }, 
                    color: 'rgba(255,255,255,0.7)', 
                    maxWidth: '700px', 
                    mx: 'auto',
                    lineHeight: 1.6,
                    fontWeight: 500
                  }}>
                    AthlonX isn't just a platform—it's high-octane fuel for your gym's engine. We stripped away the bloat to give you pure, unadulterated control.
                  </Typography>
                </motion.div>
              </Box>

            {/* Core Split */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MotionBox
                  whileHover={{ y: -5, borderColor: 'rgba(0, 245, 255, 0.4)' }}
                  transition={bentoTransition}
                  sx={{ 
                    p: 4, 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: '100%',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}>
                    <SpeedIcon sx={{ fontSize: '80px', color: '#00F5FF' }} />
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 900, color: '#00F5FF', fontSize: '24px' }}>The Friction</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6 }}>
                    Legacy systems are slow, grey, and depressing. They suck the life out of your business with endless menus and broken workflows. We saw owners losing their fire to paperwork.
                  </Typography>
                </MotionBox>
              </Grid>
              <Grid item xs={12} md={6}>
                <MotionBox
                  whileHover={{ y: -5, borderColor: 'rgba(230, 57, 70, 0.5)' }}
                  transition={bentoTransition}
                  sx={{ 
                    p: 4, 
                    background: 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(255,159,28,0.05) 100%)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(230, 57, 70, 0.3)', 
                    height: '100%',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.1 }}>
                    <FitnessCenterIcon sx={{ fontSize: '80px', color: '#E63946' }} />
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 900, color: '#E63946', fontSize: '24px' }}>The Fire</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6 }}>
                    We engineered a command center that moves at the speed of thought. Bold, energetic, and lethal in its efficiency. We don't just manage memberships; we power communities.
                  </Typography>
                </MotionBox>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Bento Impact & Philosophy */}
        <Box sx={{ py: '100px' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gridTemplateRows: { xs: 'auto', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              
                {/* Main Impact Card */}
                <MotionBox
                  whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  sx={{ 
                    gridColumn: { md: 'span 2' }, 
                    gridRow: { md: 'span 1' },
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '-20%', 
                    right: '-10%', 
                    width: '300px', 
                    height: '300px', 
                    background: 'radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%)',
                    filter: 'blur(50px)'
                  }} />
                  <Typography sx={{ color: '#FF9F1C', fontWeight: 900, mb: 1, fontSize: '13px', letterSpacing: '2px' }}>DATA-BACKED DOMINANCE</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, mb: 1.5, fontSize: '32px', lineHeight: 1.2 }}>85% Admin <br />Reduction</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.5, maxWidth: '400px' }}>
                    We didn't just save time; we eliminated the mundane. Our partners focus on what matters: the athletes.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#E63946', fontSize: '28px' }}>2.4k</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Facilities</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#00F5FF', fontSize: '28px' }}>99.9%</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Uptime</Typography>
                    </Box>
                  </Box>
                </MotionBox>
  
                {/* Testimonial Card */}
                <MotionBox
                  whileHover={{ scale: 1.01 }}
                  sx={{ 
                    gridRow: { md: 'span 2' },
                    p: 4,
                    background: 'linear-gradient(180deg, rgba(255,159,28,0.1) 0%, rgba(5,5,5,1) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,159,28,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <Typography sx={{ fontSize: '18px', lineHeight: 1.6, color: 'white', fontWeight: 600, fontStyle: 'italic', mb: 'auto' }}>
                    "AthlonX is the pulse of our gym. The energy of the software matches the energy on our floor. It's fast, sharp, and undeniably powerful."
                  </Typography>
                  <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#FF9F1C', width: 48, height: 48, fontWeight: 900, fontSize: '18px', border: '2px solid rgba(255,255,255,0.1)' }}>MC</Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 900, fontSize: '16px' }}>Marcus Chen</Typography>
                      <Typography sx={{ color: '#FF9F1C', fontSize: '12px', fontWeight: 700 }}>CEO, IRONHAVEN GROUP</Typography>
                    </Box>
                  </Box>
                </MotionBox>

              {/* Small Value Cards */}
              <MotionBox
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 245, 255, 0.05)', borderColor: '#00F5FF' }}
                sx={{ 
                  p: 4,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '32px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(0, 245, 255, 0.1)', color: '#00F5FF', display: 'flex' }}>
                  <SpeedIcon sx={{ fontSize: '32px' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '18px' }}>Zero Friction</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Speed to action is our obsession.</Typography>
                </Box>
              </MotionBox>

              <MotionBox
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(230, 57, 70, 0.05)', borderColor: '#E63946' }}
                sx={{ 
                  p: 4,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '32px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(230, 57, 70, 0.1)', color: '#E63946', display: 'flex' }}>
                  <GroupIcon sx={{ fontSize: '32px' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '18px' }}>Legion Built</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>The power of the community.</Typography>
                </Box>
              </MotionBox>

            </Box>
          </Container>
        </Box>

        {/* Evolution Timeline */}
        <Box sx={{ py: '60px', background: 'linear-gradient(to bottom, transparent, rgba(230,57,70,0.03), transparent)' }}>
          <Container maxWidth="md">
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 900, mb: 6, fontSize: '36px' }}>
              Our <span style={{ color: '#E63946' }}>Trajectory</span>
            </Typography>
            <Box sx={{ position: 'relative', '&::before': { content: '""', position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '100%', background: 'linear-gradient(to bottom, #E63946, #FF9F1C, #00F5FF)' } }}>
              {[
                { year: '2020', title: 'The Spark', desc: 'Born from a single terminal in a warehouse gym.', color: '#E63946' },
                { year: '2022', title: 'Ignition', desc: 'Scaled to 500+ facilities with lightning-fast automation.', color: '#FF9F1C' },
                { year: '2025', title: 'The Command', desc: 'Defining the gold standard for global gym operations.', color: '#00F5FF' }
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 6, position: 'relative', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                  <Box sx={{ width: '45%', textAlign: index % 2 === 0 ? 'right' : 'left' }}>
                    <Typography sx={{ color: item.color, fontWeight: 900, fontSize: '24px' }}>{item.year}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'white', fontSize: '20px' }}>{item.title}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.5 }}>{item.desc}</Typography>
                  </Box>
                  <Box sx={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '15px',
                    transform: 'translateX(-50%)', 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    bgcolor: item.color,
                    boxShadow: `0 0 15px ${item.color}`,
                    zIndex: 2,
                    border: '3px solid #050505'
                  }} />
                  <Box sx={{ width: '45%' }} />
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Visionaries */}
        <Box sx={{ py: '60px' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 900, mb: 6, fontSize: '36px' }}>The Architects</Typography>
            <Grid container spacing={4} justifyContent="center">
              {[
                { name: 'Alex Rivers', role: 'CTO & ARCHITECT', color: '#E63946', bio: 'Coding at the speed of sound. Former powerlifter.' },
                { name: 'Sarah J. Thorne', role: 'PRODUCT CHIEF', color: '#00F5FF', bio: 'Ops veteran. Obsessed with user flow and friction removal.' }
              ].map((founder, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <MotionBox
                    whileHover={{ y: -5 }}
                    sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.08)',
                      transition: 'border-color 0.3s ease',
                      '&:hover': { borderColor: founder.color }
                    }}
                  >
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2.5, bgcolor: founder.color, fontSize: '28px', fontWeight: 900, boxShadow: `0 10px 30px ${founder.color}33` }}>
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontSize: '20px' }}>{founder.name}</Typography>
                    <Typography sx={{ color: founder.color, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '1px' }}>{founder.role}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>{founder.bio}</Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box sx={{ pb: '80px' }}>
          <Container maxWidth="md">
            <MotionBox 
              whileHover={{ scale: 1.01 }}
              sx={{ 
                p: { xs: 4, md: 6 }, 
                background: 'linear-gradient(135deg, rgba(230,57,70,0.2) 0%, rgba(255,159,28,0.2) 50%, rgba(0,245,255,0.1) 100%)', 
                borderRadius: '32px', 
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(30px)'
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '28px', md: '36px' } }}>Unleash the Beast.</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '16px', maxWidth: '600px', mx: 'auto', fontWeight: 500 }}>
                Don't settle for static. Get the energetic, high-performance command center your facility deserves.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  background: 'white', 
                  color: 'black',
                  py: 1.5, 
                  px: 4, 
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': { background: '#f0f0f0', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s ease'
                }}
              >
                Join the Network
              </Button>
            </MotionBox>
          </Container>
        </Box>
      </main>
      <Footer />
    </Box>
  );
}
