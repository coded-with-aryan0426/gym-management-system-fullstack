import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Users, CreditCard, Activity, TrendingUp, Shield, Smartphone } from 'lucide-react';

const BentoCard = ({ children, className, colSpan = 4, rowSpan = 1, delay = 0 }: any) => (
    <Grid item xs={12} md={colSpan} sx={{ height: '100%', minHeight: { xs: 300, md: rowSpan === 2 ? 624 : 300 } }}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            style={{ height: '100%' }}
        >
            <Paper
                className={`glass-effect-heavy ${className}`}
                sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(10, 10, 10, 0.6)',
                    transition: 'all 0.4s ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        background: 'rgba(20, 20, 20, 0.8)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                    },
                    '&:hover::before': { opacity: 1 }
                }}
            >
                {children}
            </Paper>
        </motion.div>
    </Grid>
);

const BentoGrid = () => {
    return (
        <Box sx={{ py: 15, position: 'relative' }}>
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '32px', md: '56px' },
                            fontWeight: 800,
                            textAlign: 'center',
                            mb: 8,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Everything You Need. <br />
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Nothing You Don't.</span>
                    </Typography>
                </motion.div>

                <Grid container spacing={3}>
                    {/* Main Large Card */}
                    <BentoCard colSpan={8} rowSpan={2}>
                        <Box sx={{ zIndex: 2 }}>
                            <Box sx={{ mb: 3, p: 1.5, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', width: 'fit-content' }}>
                                <Activity color="#3b82f6" size={24} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Live Member Tracking</Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 400 }}>
                                Real-time insights into who is in your gym right now. Track peak hours, occupancy rates, and member retention flow with beautiful visualizations.
                            </Typography>
                        </Box>
                        <Box sx={{
                            position: 'absolute',
                            right: -50,
                            bottom: -50,
                            width: '60%',
                            height: '80%',
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), transparent)',
                            filter: 'blur(60px)',
                            zIndex: 1
                        }} />
                    </BentoCard>

                    {/* Secondary Card - Finance */}
                    <BentoCard colSpan={4} rowSpan={1} delay={0.2}>
                        <Box>
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', width: 'fit-content' }}>
                                <CreditCard color="#10b981" size={20} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Auto-Billing</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                Automated recurring payments and invoice generation. Never chase dues again.
                            </Typography>
                        </Box>
                    </BentoCard>

                    {/* Secondary Card - Mobile */}
                    <BentoCard colSpan={4} rowSpan={1} delay={0.3}>
                        <Box>
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(236, 72, 153, 0.1)', borderRadius: '10px', width: 'fit-content' }}>
                                <Smartphone color="#ec4899" size={20} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Member App</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                White-labeled mobile experience for your members to book classes and track progress.
                            </Typography>
                        </Box>
                    </BentoCard>

                    {/* Wide Card - Analytics */}
                    <BentoCard colSpan={6} rowSpan={1} delay={0.4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', width: 'fit-content' }}>
                                <TrendingUp color="#f59e0b" size={20} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Growth Analytics</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                Deep dive into revenue streams and member acquisition channels.
                            </Typography>
                        </Box>
                    </BentoCard>

                    {/* Wide Card - Security */}
                    <BentoCard colSpan={6} rowSpan={1} delay={0.5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', width: 'fit-content' }}>
                                <Shield color="#8b5cf6" size={20} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Role-Based Access</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                Granular permission controls for gym staff, trainers, and admins.
                            </Typography>
                        </Box>
                    </BentoCard>

                </Grid>
            </Container>
        </Box>
    );
};

export default BentoGrid;
