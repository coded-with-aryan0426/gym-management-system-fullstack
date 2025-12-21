
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Hero from './Hero';
import QuickMetrics from './QuickMetrics';
import Problem from './Problem';
import ValueStack from './ValueStack';
import SocialProof from './SocialProof';
import Transformation from './Transformation';
import SecondaryCTA from './SecondaryCTA';
import Footer from './Footer';
import SuccessModal from './SuccessModal';
import AnimatedBackground from './AnimatedBackground';

export default function LandingPage() {
    const [showSuccess, setShowSuccess] = useState(false);

    const handleOpenSuccess = () => {
        setShowSuccess(true);
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    };

    return (
        <Box 
            component="main" 
            sx={{ 
                backgroundColor: 'var(--bg-primary)', 
                color: 'var(--text-primary)',
                minHeight: '100vh', 
                overflowX: 'hidden', 
                position: 'relative',
                backgroundImage: 'var(--bg-mesh-gradient)',
                backgroundAttachment: 'fixed',
            }}
        >
            <AnimatedBackground />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Header />
                <Hero />
                <QuickMetrics />
                <Problem />
                <ValueStack />
                <SocialProof />
                <Transformation />
                <SecondaryCTA />
                <Footer />
            </Box>
            <SuccessModal open={showSuccess} onClose={handleCloseSuccess} />
        </Box>
    );
}
