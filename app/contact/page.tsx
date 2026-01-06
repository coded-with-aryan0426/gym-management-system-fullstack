"use client";

import React from 'react';
import { Box, Typography, Container, TextField, Button, Grid } from '@mui/material';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <Box sx={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white' }}>
      <Header />
      <main>
        <Box sx={{ paddingTop: '160px', paddingBottom: '120px' }}>
          <Container maxWidth="lg">
            <Grid container spacing={8}>
              <Grid size={{ xs: 12, md: 5 }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography variant="h1" sx={{ fontSize: '48px', fontWeight: 900, mb: 3 }}>
                    Let's Talk.
                  </Typography>
                  <Typography sx={{ fontSize: '18px', color: 'var(--color-gray-400)', mb: 6 }}>
                    Ready to scale your gym? Our experts are here to help you set up the perfect OS for your business.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(230,57,70,0.1)', color: '#E63946' }}><Mail size={24} /></Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>Email Us</Typography>
                        <Typography sx={{ color: 'var(--color-gray-500)' }}>sales@athlonx.com</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(67,97,238,0.1)', color: '#4361EE' }}><Phone size={24} /></Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>Call Us</Typography>
                        <Typography sx={{ color: 'var(--color-gray-500)' }}>+91 98765 43210</Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  sx={{
                    p: { xs: 4, md: 6 },
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '32px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Full Name" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } }} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Work Email" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } }} /></Grid>
                    <Grid size={{ xs: 12 }}><TextField fullWidth label="Gym Name" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } }} /></Grid>
                    <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={4} label="How can we help?" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } }} /></Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ height: 56, borderRadius: '14px', background: 'var(--gradient-cta)', fontWeight: 700, textTransform: 'none' }}
                        endIcon={<Send size={20} />}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </main>
      <Footer />
    </Box>
  );
}
