"use client";

import React from 'react';
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
import ScrollToTop from './ScrollToTop';
import ScrollProgress from './ScrollProgress';
import { Box } from '@mui/material';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function LandingPage() {
  const { openAuthModal } = useAuthModal();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleOpenSignup = () => openAuthModal('signup');

return (
      <Box component="div" sx={{ backgroundColor: isDark ? '#0A0A0A' : '#F8FAFC', minHeight: '100vh', overflowX: 'hidden', transition: 'background-color 0.3s ease' }}>
        <ScrollProgress />
        <Header />
      <main>
        <section id="hero">
          <Hero onSignupClick={handleOpenSignup} />
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
          <SecondaryCTA onSignupClick={handleOpenSignup} />
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </Box>
  );
}
