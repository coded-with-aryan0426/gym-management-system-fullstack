"use client";

import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import Problem from './Problem';
import PresentStruggle from './PresentStruggle';
import EmpoweredFuture from './EmpoweredFuture';
import ValueStack from './ValueStack';
import SocialProof from './SocialProof';
import Transformation from './Transformation';
import SecondaryCTA from './SecondaryCTA';
import Footer from './Footer';
import SuccessModal from './SuccessModal';
import ScrollToTop from './ScrollToTop';
import { Box } from '@mui/material';

export default function LandingPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOpenSuccess = () => setShowSuccess(true);
  const handleCloseSuccess = () => setShowSuccess(false);

  return (
    <Box component="div" sx={{ backgroundColor: '#0A0A0A', minHeight: '100vh', overflowX: 'hidden' }}>
      <Header />
      <main>
        <section id="hero">
          <Hero onSignupClick={handleOpenSuccess} />
        </section>

        <section id="problems">
          <Problem />
        </section>

        <section id="present">
          <PresentStruggle />
        </section>

        <section id="future">
          <EmpoweredFuture />
        </section>

        <section id="social">
          <SocialProof />
        </section>

        <section id="transformation">
          <Transformation />
        </section>

        <section id="value">
          <ValueStack />
        </section>

        <section id="cta">
          <SecondaryCTA onSignupClick={handleOpenSuccess} />
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      <SuccessModal open={showSuccess} onClose={handleCloseSuccess} />
    </Box>
  );
}
