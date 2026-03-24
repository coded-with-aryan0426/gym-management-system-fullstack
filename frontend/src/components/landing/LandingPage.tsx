"use client";
import '../../pages/superadmin/superadmin-portal.css';

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Problem from './Problem';
import PresentStruggle from './PresentStruggle';
import EmpoweredFuture from './EmpoweredFuture';
import ValueStack from './ValueStack';
import SocialProof from './SocialProof';
import Transformation from './Transformation';
import SecondaryCTA from './SecondaryCTA';
import PricingPlans from './PricingPlans';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import ScrollProgress from './ScrollProgress';
import { Box } from '@mui/material';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useKonamiCode } from '../../hooks/useKonamiCode';

export default function LandingPage() {
  const { openAuthModal } = useAuthModal();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleOpenSignup = () => openAuthModal('signup');

  const handleKonamiActivated = useCallback(() => {
    navigate('/portal');
  }, [navigate]);

  const { progress, total } = useKonamiCode(handleKonamiActivated);

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

        <section id="pricing">
          <PricingPlans />
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      {/* Konami Code progress hint — only visible when sequence started */}
      {progress > 0 && (
        <div className="portal__hint">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`portal__hint-dot ${i < progress ? 'portal__hint-dot--active' : ''}`} />
          ))}
        </div>
      )}
    </Box>
  );
}
