import { Box } from '@mui/material';
import Header from './Header';
import Hero from './Hero';
import InfiniteMarquee from './InfiniteMarquee';
import BentoGrid from './BentoGrid';
import SecondaryCTA from './SecondaryCTA';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <Box sx={{
      backgroundColor: '#000', // Deepest black for contrast
      minHeight: '100vh',
      color: 'white',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <Header />

      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="trusted-by">
          <InfiniteMarquee />
        </section>

        <section id="features">
          <BentoGrid />
        </section>

        <section id="cta">
          <SecondaryCTA />
        </section>
      </main>

      <Footer />
    </Box>
  );
}
