"use client";

import React from 'react';
import { Box, Typography, Button, Dialog, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Check } from 'lucide-react';
// Lottie animation removed to specific request/compatibility
// import dynamic from 'next/dynamic';
// const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
// import checkmarkAnimation from '../../public/animations/checkmark.json'; 

const deliverables = [
    'Full platform access for 14 days',
    'Free onboarding call with gym specialist',
    'Member app white-labeled with YOUR branding',
    'Import up to 1,000 members free',
    '24/7 priority support',
    'No credit card required',
];

interface SuccessModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 'var(--radius-2xl)',
                    padding: { xs: 4, md: 6 },
                    maxWidth: 560,
                    textAlign: 'center',
                    backgroundColor: 'var(--color-white)',
                    boxShadow: 'var(--shadow-xl)',
                },
            }}
        >
            {/* Lottie Checkmark Placeholder - Since we don't have the file, using a static icon fallback if Lottie fails or just the icon for now to ensure stability */}
            <Box sx={{ width: 80, height: 80, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                <Check size={40} color="var(--color-success)" />
            </Box>

            <Typography
                variant="h4"
                sx={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-gray-900)',
                    marginBottom: 2,
                }}
            >
                You're In! Welcome to the Revolution
            </Typography>

            <Typography
                sx={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-gray-600)',
                    marginBottom: 4,
                }}
            >
                Check your inbox for instant access credentials
            </Typography>

            <List sx={{ textAlign: 'left', marginBottom: 4 }}>
                {deliverables.map((item) => (
                    <ListItem
                        key={item}
                        sx={{
                            paddingY: 1,
                            paddingX: 0,
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check size={20} color="var(--color-success)" />
                        </ListItemIcon>
                        <ListItemText
                            primary={item}
                            primaryTypographyProps={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                color: 'var(--color-gray-700)',
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            <Button
                fullWidth
                variant="contained"
                onClick={onClose}
                sx={{
                    height: 52,
                    background: 'var(--gradient-cta)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: 'var(--color-primary-900)',
                    boxShadow: 'var(--shadow-glow-green)',
                }}
            >
                Continue to Dashboard
            </Button>
        </Dialog>
    );
}
