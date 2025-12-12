
import React from 'react';
import { Dialog, Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Check, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 'var(--radius-xl)',
          padding: 0,
          maxWidth: 500,
          backgroundColor: 'var(--color-white)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-2xl)',
        },
      }}
    >
      <Box sx={{ position: 'relative', padding: 4 }}>
        {/* Close Button */}
        <Button
            onClick={onClose}
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                minWidth: 'auto',
                padding: 1,
                borderRadius: '50%',
                color: 'var(--color-gray-400)',
                '&:hover': {
                    backgroundColor: 'var(--color-gray-50)',
                    color: 'var(--color-gray-600)',
                }
            }}
        >
            <X size={20} />
        </Button>

        {/* Header Animation Canvas */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
           <Box 
            sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 2
            }}
           >
             <Check size={40} color="var(--color-success)" />
           </Box>
          </motion.div>
          
          <Typography
            variant="h4"
            sx={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-gray-900)',
              textAlign: 'center',
              marginBottom: 1,
            }}
          >
            Welcome to the Empire!
          </Typography>
          <Typography
            sx={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-gray-500)',
              textAlign: 'center',
            }}
          >
            Your account has been successfully created.
          </Typography>
        </Box>

        {/* Deliverables */}
        <Box
          sx={{
            backgroundColor: 'var(--color-gray-50)',
            borderRadius: 'var(--radius-lg)',
            padding: 3,
            marginBottom: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-gray-500)',
              marginBottom: 2,
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            What happens next:
          </Typography>
          <List dense disablePadding>
            {[
              'Instant access to your Admin Dashboard',
              'Welcome email with setup guide sent',
              '14-Day Free Trial activated',
            ].map((text, index) => (
              <ListItem key={index} disableGutters sx={{ paddingY: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Check size={16} color="var(--color-success)" />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-gray-700)',
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CTA */}
        <Button
            fullWidth
            variant="contained"
            onClick={onClose} 
            sx={{
                height: 56,
                background: 'var(--gradient-cta)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                textTransform: 'none',
                color: 'var(--color-primary-900)',
                boxShadow: 'var(--shadow-glow-green)',
                '&:hover': {
                    filter: 'brightness(1.05)',
                }
            }}
            endIcon={<ArrowRight size={20} />}
        >
            Go to Dashboard
        </Button>
      </Box>
    </Dialog>
  );
}
