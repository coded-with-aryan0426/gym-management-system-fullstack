"use client";

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function TermsPage() {
  return (
    <Box sx={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white' }}>
      <Header />
      <main>
        <Box sx={{ paddingTop: '160px', paddingBottom: '120px' }}>
          <Container maxWidth="md">
            <Typography variant="h1" sx={{ fontSize: '48px', fontWeight: 900, mb: 6 }}>
              Terms of Service
            </Typography>
            <Box sx={{ color: 'var(--color-gray-400)', lineHeight: 1.8 }}>
              <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4, fontWeight: 700 }}>1. Acceptance of Terms</Typography>
              <Typography sx={{ mb: 4 }}>
                By accessing or using AthlonX, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </Typography>
              
              <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4, fontWeight: 700 }}>2. Use License</Typography>
              <Typography sx={{ mb: 4 }}>
                Permission is granted to temporarily use our services for personal, non-commercial transitory viewing only.
              </Typography>

              <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4, fontWeight: 700 }}>3. Disclaimer</Typography>
              <Typography sx={{ mb: 4 }}>
                The materials on AthlonX are provided on an 'as is' basis. AthlonX makes no warranties, expressed or implied.
              </Typography>
            </Box>
          </Container>
        </Box>
      </main>
      <Footer />
    </Box>
  );
}
