import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        background: '#0a0a0a', // Very dark base
        pointerEvents: 'none',
      }}
    >
      {/* 1. Moving Red Gradient Orb (Top Left) */}
      <Box
        component={motion.div}
        animate={{
          x: [-100, 100, -100],
          y: [-100, 50, -100],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 2. Moving Red Gradient Orb (Bottom Right) */}
      <Box
        component={motion.div}
        animate={{
          x: [100, -100, 100],
          y: [100, -50, 100],
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(153, 27, 27, 0.1) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* 3. Subtle Grid Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          opacity: 0.5,
        }}
      />
    </Box>
  );
}
