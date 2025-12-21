
import { Box, Typography, Container, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Star, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 12,
        paddingBottom: 6,
        color: 'var(--text-secondary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} sx={{ marginBottom: 10 }}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ display: 'flex', alignItems: 'center', marginBottom: 4, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="AthlonX"
                sx={{ height: 40, width: 'auto' }}
              />
            </Box>
            <Typography sx={{ fontSize: '15px', lineHeight: 1.6, marginBottom: 4, maxWidth: 300 }}>
              The elite operating system for precision-driven gym management. Built for performance. Scaled for growth.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                <IconButton
                  key={idx}
                  size="small"
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      color: 'var(--color-crimson)', 
                      borderColor: 'var(--color-crimson)',
                      backgroundColor: 'rgba(220, 38, 38, 0.05)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <Icon size={18} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Columns */}
          {[
            {
              title: 'Platform',
              links: ['Features', 'Pricing', 'Member App', 'Staff Portal', 'Integrations'],
            },
            {
              title: 'Intelligence',
              links: ['Profit Analytics', 'Lead Systems', 'Marketing Hub', 'Automation', 'API'],
            },
            {
              title: 'Support',
              links: ['Success Center', 'Documentation', 'Case Studies', 'Community', 'Security'],
            },
            {
              title: 'Legal',
              links: ['Privacy', 'Terms', 'SLA', 'Cookies', 'Compliance'],
            }
          ].map((column) => (
            <Grid item xs={6} md={2} key={column.title}>
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 4
                }}
              >
                {column.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {column.links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    underline="none"
                    sx={{
                      color: 'var(--text-tertiary)',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      '&:hover': { color: 'white', transform: 'translateX(4px)' }
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'var(--border-subtle)', marginBottom: 6 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} AthlonX Elite. All rights reserved. Precision-engineered in India.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { icon: Shield, text: 'PCI Compliant' },
              { icon: Zap, text: '99.99% Uptime' },
              { icon: Star, text: '24/7 Priority Support' },
            ].map((badge) => (
              <Box key={badge.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <badge.icon size={14} color="var(--color-crimson)" />
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {badge.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
