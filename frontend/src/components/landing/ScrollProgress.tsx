import { Box } from '@mui/material';
import { motion, useScroll, useSpring } from 'framer-motion';

const MotionBox = motion(Box);

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <MotionBox
            style={{ scaleX }}
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
                transformOrigin: 'left',
                zIndex: 9999
            }}
        />
    );
}
