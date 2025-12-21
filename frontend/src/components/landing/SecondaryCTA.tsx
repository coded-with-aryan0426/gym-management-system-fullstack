
import React from 'react';
import { Box, Typography, Button, Container, Avatar } from '@mui/material';
import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const avatars = [
  'https://ui-avatars.com/api/?name=User+1&background=DC2626&color=fff',
  'https://ui-avatars.com/api/?name=User+2&background=DC2626&color=fff',
  'https://ui-avatars.com/api/?name=User+3&background=DC2626&color=fff',
  'https://ui-avatars.com/api/?name=User+4&background=DC2626&color=fff',
];

interface SecondaryCTAProps {
  onSignupClick?: () => void;
}

export default function SecondaryCTA({ onSignupClick }: SecondaryCTAProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onSignupClick) {
      onSignupClick();
    } else {
      navigate('/signup');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        paddingY: { xs: '120px', md: '180px' },
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      {/* Dynamic Background Glows */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '38px', md: '64px' },
              fontWeight: 900,
              fontFamily: 'var(--font-family-display)',
              color: 'white',
              marginBottom: 3,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Stop Playing Gym Owner.<br />
            Start Being a <span className="text-gradient-primary">CEO.</span>
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '18px', md: '22px' },
              color: 'var(--text-secondary)',
              marginBottom: 8,
              maxWidth: 700,
              marginX: 'auto',
              lineHeight: 1.6,
            }}
          >
            Join the elite circle of 5,000+ gyms that transformed their operations with AthlonX. Precision is just 15 minutes away.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              marginBottom: 8,
            }}
          >
            <Button
              variant="contained"
              className="btn-premium btn-premium-primary animate-pulse-glow"
              sx={{
                height: 72,
                minWidth: 320,
                paddingX: 6,
                fontSize: '20px',
              }}
              endIcon={<ArrowRight size={24} />}
              onClick={handleClick}
            >
              Yes, Transform My Gym
            </Button>
            
            <Typography
              sx={{
                fontSize: '14px',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                fontWeight: 600,
              }}
            >
              <Shield size={16} color="var(--color-accent-emerald)" />
              14-Day Performance Guarantee • Cancel Anytime
            </Typography>
          </Box>

          {/* Social Proof Mini */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {avatars.map((src, index) => (
                <Avatar
                  key={index}
                  src={src}
                  sx={{
                    width: 44,
                    height: 44,
                    border: '3px solid var(--bg-primary)',
                    marginLeft: index > 0 ? -1.5 : 0,
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                  }}
                />
              ))}
              <Box sx={{ 
                width: 44, 
                height: 44, 
                borderRadius: '50%', 
                backgroundColor: 'var(--bg-tertiary)', 
                border: '3px solid var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -1.5,
                zIndex: 1,
              }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>+5k</Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              backgroundColor: 'rgba(255,255,255,0.03)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}>
              <CheckCircle size={18} color="var(--color-accent-emerald)" />
              <Typography sx={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>
                12 gyms launched with AthlonX today
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
