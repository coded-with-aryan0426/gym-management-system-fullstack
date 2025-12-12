
import { Box, Typography, Container, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Star, Shield, Zap } from 'lucide-react';
import { AthlonXLogo } from '../ui/AthlonXLogo';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'var(--color-primary-900)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: 10,
        paddingBottom: 4,
        color: 'var(--color-gray-400)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} sx={{ marginBottom: 8 }}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <AthlonXLogo size="lg" showText />
            </Box>
            <Typography sx={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 3 }}>
              The comprehensive operating system for modern gyms. Built by gym owners, for gym owners.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                <IconButton
                  key={idx}
                  size="small"
                  sx={{
                    color: 'var(--color-gray-400)',
                    '&:hover': { color: 'var(--color-accent-blue)', backgroundColor: 'rgba(67, 97, 238, 0.1)' }
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
              title: 'Product',
              links: ['Features', 'Pricing', 'Member App', 'Trainer App', 'Integrations'],
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact'],
            },
            {
              title: 'Resources',
              links: ['Gym Owner Guide', 'Profit Calculators', 'Webinars', 'Help Center', 'API Docs'],
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service', 'Data Security', 'Cookie Policy'],
            }
          ].map((column) => (
            <Grid item xs={6} md={2} key={column.title}>
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  marginBottom: 3
                }}
              >
                {column.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {column.links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    underline="none"
                    sx={{
                      color: 'var(--color-gray-400)',
                      fontSize: 'var(--text-sm)',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'var(--color-accent-blue)' }
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 4 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography sx={{ fontSize: 'var(--text-sm)' }}>
            © {new Date().getFullYear()} AthlonX. All rights reserved. Made with ❤️ in India.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: Zap, text: '99.9% Uptime' },
              { icon: Star, text: 'Top Rated Support' },
            ].map((badge) => (
              <Box key={badge.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <badge.icon size={14} color="var(--color-gray-500)" />
                <Typography sx={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
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
