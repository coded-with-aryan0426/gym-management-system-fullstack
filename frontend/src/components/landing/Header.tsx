"use client";

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, useScrollTrigger, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Avatar, Menu as MuiMenu, MenuItem } from '@mui/material';
import { Menu as LucideMenu, X, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useAuth } from '../../contexts/AuthContext';

// Navigation items - scroll sections on homepage
const scrollNavItems = [
  { label: 'Features', id: 'future' },
  { label: 'Problems We Solve', id: 'problems' },
  { label: 'Testimonials', id: 'social' },
  { label: 'Pricing', id: 'pricing' }
];

// Page link items
const pageNavItems = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { openAuthModal } = useAuthModal();
  const { user, isAuthenticated, logout } = useAuth();

  // Profile menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfileClick = () => {
    handleMenuClose();
    // All users go to their dashboard - no /portal route
    navigate('/dashboard');
  };

  // Custom scroll listener for smoother control
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (id: string) => {
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const navigateToPage = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            height: { xs: 64, md: 72 },
            // Floating Dock Logic
            width: scrolled ? 'calc(100% - 40px)' : '100%',
            top: scrolled ? '20px' : '0',
            left: scrolled ? '20px' : '0',
            right: scrolled ? '20px' : '0',
            borderRadius: scrolled ? '16px' : '0',
            backgroundColor: scrolled 
              ? (isDark ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.85)')
              : 'transparent',
            backdropFilter: 'blur(16px)',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: scrolled 
                ? (isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)')
                : 'none',

            // Transitions
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: { xs: '0 16px', sm: '0 24px', md: '0 40px' },
            zIndex: 1200,
            margin: '0 auto', // Center it when floating
            maxWidth: scrolled ? '1400px' : '100%', // Optional: Limit animation width on ultra-wide screens
          }}
        >
        <Toolbar sx={{ height: '100%', justifyContent: 'space-between', minHeight: 'unset !important', padding: '0 !important' }}>
          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Logo size={32} />
          </Box>

          {/* Nav Links - Desktop Only */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 2 }}>
              {/* Scroll sections */}
              {scrollNavItems.map((item) => (
                <Button
                  key={item.id}
                  variant="text"
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: isDark ? 'var(--color-gray-300)' : 'var(--text-secondary)',
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    padding: '8px 12px',
                    '&:hover': {
                      color: '#E63946',
                      backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Page links */}
              {pageNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="text"
                  onClick={() => navigateToPage(item.href)}
                  sx={{
                    color: isDark ? 'var(--color-gray-300)' : 'var(--text-secondary)',
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    padding: '8px 12px',
                    '&:hover': {
                      color: '#E63946',
                      backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

          {/* Right Side Actions */}
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
              {/* Theme Toggle Button */}
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: isDark ? 'white' : 'var(--text-primary)',
                  padding: '8px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>

              {isAuthenticated ? (
                /* Logged In - Show Profile */
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    onClick={handleMenuOpen}
                    sx={{
                      textTransform: 'none',
                      color: isDark ? 'white' : 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        backgroundColor: 'var(--color-crimson)',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.fullName || 'User'}
                    </Typography>
                  </Button>

                  <MuiMenu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <MenuItem onClick={handleProfileClick} sx={{ gap: 1.5, color: isDark ? 'white' : 'var(--text-primary)' }}>
                      <User size={16} />
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }} sx={{ gap: 1.5, color: isDark ? 'white' : 'var(--text-primary)' }}>
                      <Settings size={16} />
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main' }}>
                      <LogOut size={16} />
                      Log Out
                    </MenuItem>
                  </MuiMenu>
                </Box>
              ) : (
                /* Logged Out - Show Login/Signup */
                <>
                  <Button
                    variant="text"
                    onClick={() => openAuthModal('login')}
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      color: isDark ? 'white' : 'var(--text-primary)',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: { sm: 14, md: 16 },
                      padding: { sm: '6px 12px', md: '8px 16px' },
                      '&:hover': {
                        color: '#FF495C',
                        backgroundColor: 'rgba(255, 73, 92, 0.1)',
                      }
                    }}
                  >
                    Log In
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => openAuthModal('signup')}
                    sx={{
                      height: { xs: 40, sm: 44, md: 48 },
                      padding: { xs: '0 16px', sm: '0 20px', md: '0 28px' },
                      background: 'var(--gradient-cta)',
                      borderRadius: { xs: '10px', md: '12px' },
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: 13, sm: 14, md: 16 },
                      boxShadow: '0 4px 15px rgba(230, 57, 70, 0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)',
                      }
                    }}
                  >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Start Free Trial</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Start Free</Box>
                  </Button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <IconButton
                onClick={toggleMobileMenu}
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  color: isDark ? 'white' : 'var(--text-primary)',
                  padding: '8px',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  }
                }}
              >
                {mobileMenuOpen ? <X size={24} /> : <LucideMenu size={24} />}
              </IconButton>
            </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 320 },
            backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
            borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          },
        }}
      >
        {/* Close Button Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
            <Logo size={32} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme toggle in mobile menu */}
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: isDark ? 'white' : 'var(--text-primary)',
                padding: '8px',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(230, 57, 70, 0.1)' : 'rgba(230, 57, 70, 0.1)',
                }
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: isDark ? 'white' : 'var(--text-primary)',
                padding: '8px',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(230, 57, 70, 0.1)' : 'rgba(230, 57, 70, 0.1)',
                }
              }}
            >
              <X size={24} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ padding: 3 }}>
          {/* Navigation Links - Scroll Sections */}
          <Typography sx={{ fontSize: 12, color: isDark ? 'var(--color-gray-500)' : 'var(--text-tertiary)', fontWeight: 600, letterSpacing: 1, mb: 2, textTransform: 'uppercase' }}>
            Explore
          </Typography>
          <List sx={{ padding: 0 }}>
            {scrollNavItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ marginBottom: 1 }}>
                <ListItemButton
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    borderRadius: '12px',
                    padding: '14px 20px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        color: isDark ? 'white' : 'var(--text-primary)',
                        fontSize: 16,
                        fontWeight: 500,
                        fontFamily: 'var(--font-heading)',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', marginY: 2 }} />

          {/* Page Links */}
          <Typography sx={{ fontSize: 12, color: isDark ? 'var(--color-gray-500)' : 'var(--text-tertiary)', fontWeight: 600, letterSpacing: 1, mb: 2, textTransform: 'uppercase' }}>
            Company
          </Typography>
          <List sx={{ padding: 0 }}>
            {pageNavItems.map((item) => (
              <ListItem key={item.href} disablePadding sx={{ marginBottom: 1 }}>
                <ListItemButton
                  onClick={() => navigateToPage(item.href)}
                  sx={{
                    borderRadius: '12px',
                    padding: '14px 20px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        color: isDark ? 'white' : 'var(--text-primary)',
                        fontSize: 16,
                        fontWeight: 500,
                        fontFamily: 'var(--font-heading)',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', marginY: 3 }} />

          {isAuthenticated ? (
            /* Logged In - Show Profile Options */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'var(--color-crimson)',
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: isDark ? 'white' : 'var(--text-primary)', fontWeight: 600, fontSize: 16, wordBreak: 'break-word' }}>
                    {user?.fullName || 'User'}
                  </Typography>
                  <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)', fontSize: 13 }}>
                    {user?.email || ''}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() => { handleProfileClick(); setMobileMenuOpen(false); }}
                sx={{
                  height: 52,
                  background: 'var(--gradient-cta)',
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '12px',
                }}
              >
                Dashboard
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                sx={{
                  height: 52,
                  borderColor: 'error.main',
                  color: 'error.main',
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: 'error.main',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }
                }}
              >
                Log Out
              </Button>
            </Box>
          ) : (
            /* Logged Out - Show Login/Signup */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                sx={{
                  height: 52,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  color: isDark ? 'white' : 'var(--text-primary)',
                  fontSize: 16,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: '#E63946',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                  }
                }}
              >
                Log In
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                sx={{
                height: 52,
                background: 'var(--gradient-cta)',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(230, 57, 70, 0.3)',
              }}
            >
              Start Free Trial
            </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
