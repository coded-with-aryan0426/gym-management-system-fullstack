
import { AppBar, Toolbar, Button, Box, useScrollTrigger } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Header() {
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

  return (
    <AppBar
      position="fixed"
      elevation={0}
    sx={{
      height: trigger ? 60 : 80,
      backgroundColor: trigger ? 'rgba(13, 13, 13, 0.85)' : 'transparent',
      backdropFilter: trigger ? 'blur(16px)' : 'none',
      borderBottom: trigger ? '1px solid rgba(255,255,255,0.08)' : 'none',
      padding: { xs: '0 var(--space-4)', md: '0 var(--space-8)' },
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 1000,
    }}
  >
    <Toolbar sx={{ height: '100%', justifyContent: 'space-between' }}>
      {/* Logo */}
      <Box 
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
        onClick={() => navigate('/')}
      >
        <Box
          component="img"
          src="/images/logo.png"
          alt="AthlonX"
          sx={{
            height: trigger ? 32 : 40,
              width: 'auto',
              objectFit: 'contain',
              transition: 'height 0.4s ease',
            }}
          />
        </Box>

        {/* Nav Links - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {['Features', 'Testimonials', 'Pricing'].map((item) => (
            <Button
              key={item}
              variant="text"
              sx={{
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-premium-md)',
                '&:hover': { 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* CTA Buttons */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: 'var(--text-primary)',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: 14,
              '&:hover': { 
                color: 'var(--color-crimson)',
                backgroundColor: 'transparent'
              }
            }}
          >
            Log In
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/signup')}
            className="btn-premium btn-premium-primary"
            sx={{
              height: 44,
              padding: '0 24px',
              backgroundColor: 'var(--color-crimson)',
              borderRadius: 'var(--radius-premium-md)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: 'var(--shadow-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-crimson-hover)',
                boxShadow: 'var(--shadow-glow-primary)',
              }
            }}
          >
            Get Started
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
