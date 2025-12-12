"use client";

import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import Problem from './Problem';
import ValueStack from './ValueStack';
import SocialProof from './SocialProof';
import Transformation from './Transformation';
import SecondaryCTA from './SecondaryCTA';
import Footer from './Footer';
import SuccessModal from './SuccessModal';
import { Box } from '@mui/material';

export default function LandingPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  // Example trigger - could be passed down to Hero/CTA later
  const handleOpenSuccess = () => setShowSuccess(true);
  const handleCloseSuccess = () => setShowSuccess(false);

  return (
    <Box component="main" sx={{ backgroundColor: 'var(--color-primary-900)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Header />
      <Hero onSignupClick={handleOpenSuccess} />
      <Problem />
      <ValueStack />
      <SocialProof />
      <Transformation />
      <SecondaryCTA onSignupClick={handleOpenSuccess} />
      <Footer />
      <SuccessModal open={showSuccess} onClose={handleCloseSuccess} />
    </Box>
  );
}
