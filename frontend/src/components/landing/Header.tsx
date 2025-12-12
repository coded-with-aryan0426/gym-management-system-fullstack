
import { AppBar, Toolbar, Button, Box, useScrollTrigger } from '@mui/material';
import { AthlonXLogo } from '../ui/AthlonXLogo';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 90, // Increased height
        backgroundColor: trigger ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
        backdropFilter: 'blur(12px)',
        borderBottom: trigger ? '1px solid rgba(255,255,255,0.05)' : 'none',
        padding: { xs: '0 var(--space-4)', md: '0 var(--space-10)' },
        transition: 'all 0.3s ease',
        zIndex: 50,
      }}
    >
      <Toolbar sx={{ height: '100%', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box
            component="img"
            src="/images/logo.png"
            alt="AthlonX"
            sx={{
              height: 48, // Adjusted size for header
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </Box>

        {/* Nav Links - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
          {['Features', 'Testimonials', 'Pricing'].map((item) => (
            <Button
              key={item}
              variant="text"
              sx={{
                color: 'var(--color-gray-300)',
                fontSize: 15,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { color: 'white' }
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* CTA Button */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { color: 'var(--color-accent-blue)' }
            }}
          >
            Log In
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/signup')}
            sx={{
              height: 44,
              padding: '0 24px',
              backgroundColor: 'var(--color-accent-blue)',
              borderRadius: 'var(--radius-lg)',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
              '&:hover': {
                backgroundColor: 'var(--color-accent-blue-hover)',
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)',
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
