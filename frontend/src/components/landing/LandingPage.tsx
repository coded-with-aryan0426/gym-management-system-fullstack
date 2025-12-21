
import { Box } from '@mui/material';
import Header from './Header';
import Hero from './Hero';
import QuickMetrics from './QuickMetrics';
import Problem from './Problem';
import Transformation from './Transformation';
import ValueStack from './ValueStack';
import SocialProof from './SocialProof';
import SecondaryCTA from './SecondaryCTA';
import Footer from './Footer';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <Box sx={{ 
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'var(--bg-mesh-gradient)',
      minHeight: '100vh',
      color: 'white',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Premium Progress Bar */}
      <motion.div
        className="progress-bar"
        style={{ 
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--color-crimson)',
          transformOrigin: '0%',
          zIndex: 2000,
          boxShadow: '0 0 10px var(--color-crimson)'
        }}
      />

      <Header />
      
      <main>
        {/* HERO: Capture attention immediately */}
        <section id="hero">
          <Hero />
        </section>

        {/* TRUST: Immediate validation */}
        <section id="metrics">
          <QuickMetrics />
        </section>

        {/* PAIN: Emotional connection with the problem */}
        <section id="problem">
          <Problem />
        </section>

        {/* ROADMAP: The journey from current state to desired state */}
        <section id="transformation">
          <Transformation />
        </section>

        {/* SOLUTION & PRICING: High-value disclosure */}
        <section id="value">
          <ValueStack />
        </section>

        {/* PROOF: Peer validation and results */}
        <section id="proof">
          <SocialProof />
        </section>

        {/* FINAL PUSH: The decision point */}
        <section id="cta">
          <SecondaryCTA />
        </section>
      </main>

      <Footer />

      {/* Global Decorative Gradients for depth */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% -20%, rgba(220, 38, 38, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
    </Box>
  );
}
