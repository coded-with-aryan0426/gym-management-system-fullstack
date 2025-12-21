import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LOGOS = [
    "Gold's Gym", "Anytime Fitness", "Equinox", "Planet Fitness", "Snap Fitness",
    "Crunch", "LA Fitness", "Orange Theory", "24 Hour Fitness"
];

const InfiniteMarquee = () => {
    return (
        <Box
            sx={{
                overflow: 'hidden',
                py: 8,
                background: '#000',
                position: 'relative',
                '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    width: '150px',
                    height: '100%',
                    zIndex: 2,
                },
                '&::before': {
                    left: 0,
                    background: 'linear-gradient(to right, #000, transparent)',
                },
                '&::after': {
                    right: 0,
                    background: 'linear-gradient(to left, #000, transparent)',
                }
            }}
        >
            <Box sx={{ display: 'flex', width: 'fit-content' }}>
                <motion.div
                    animate={{ x: [0, -1035] }} // Adjust based on content width
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity
                    }}
                    style={{ display: 'flex', gap: '4rem', paddingRight: '4rem' }}
                >
                    {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
                        <Typography
                            key={i}
                            className="text-gradient-primary" // Reuse existing class if available or fallback
                            sx={{
                                fontSize: '24px',
                                fontWeight: 800,
                                opacity: 0.5,
                                whiteSpace: 'nowrap',
                                transition: 'opacity 0.3s',
                                cursor: 'default',
                                '&:hover': { opacity: 1 }
                            }}
                        >
                            {logo}
                        </Typography>
                    ))}
                </motion.div>
            </Box>
        </Box>
    );
};

export default InfiniteMarquee;
