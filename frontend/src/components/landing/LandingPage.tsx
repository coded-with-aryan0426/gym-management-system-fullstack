
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Hero from './Hero';
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
        <Box component="main" sx={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
            <AnimatedBackground />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Header />
                {/* Hero and SecondaryCTA now handle navigation internally if no prop is passed, or we can explicitly pass navigation if needed. 
            For now, removing the onSignupClick prop will let them default to navigate('/signup') as per my Hero change. 
            Actually, let's keep the prop API flexible but for this request, I will remove it so they go to the real signup page.
        */}
                <Hero />
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
