"use client";

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function PrivacyPage() {
  return (
    <Box sx={{ backgroundColor: '#050505', minHeight: '100vh', color: 'white' }}>
      <Header />
      <main>
        <Box sx={{ paddingTop: '160px', paddingBottom: '120px' }}>
          <Container maxWidth="md">
            <Typography variant="h1" sx={{ fontSize: '48px', fontWeight: 900, mb: 6 }}>
              Privacy Policy
            </Typography>
            <Box sx={{ color: 'var(--color-gray-400)', lineHeight: 1.8 }}>
              <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4, fontWeight: 700 }}>1. Data Collection</Typography>
              <Typography sx={{ mb: 4 }}>
                We collect information you provide directly to us when you create an account, use our services, or communicate with us.
              </Typography>
              
              <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4, fontWeight: 700 }}>2. How We Use Data</Typography>
              <Typography sx={{ mb: 4 }}>
                We use the information we collect to provide, maintain, and improve our services, and to develop new ones.
              </Typography>

              <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4, fontWeight: 700 }}>3. Data Security</Typography>
              <Typography sx={{ mb: 4 }}>
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
              </Typography>
            </Box>
          </Container>
        </Box>
      </main>
      <Footer />
    </Box>
  );
}
