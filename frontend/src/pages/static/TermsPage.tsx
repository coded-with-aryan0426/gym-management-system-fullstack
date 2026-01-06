import { Box, Typography, Container } from '@mui/material';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import './StaticPages.css';

export default function TermsPage() {
    return (
        <Box className="static-page">
            <Header />
            <Box className="static-page__hero">
                <Container maxWidth="md">
                    <Typography variant="h1" className="static-page__title">
                        Terms of Service
                    </Typography>
                    <Box className="legal-content">
                        <Typography variant="h5" className="legal-content__heading">1. Acceptance of Terms</Typography>
                        <Typography className="legal-content__text">
                            By accessing or using AthlonX, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">2. Use License</Typography>
                        <Typography className="legal-content__text">
                            Permission is granted to use our services for personal and commercial gym management purposes. This license shall automatically terminate if you violate any of these restrictions.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">3. Service Availability</Typography>
                        <Typography className="legal-content__text">
                            We strive for 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to modify or discontinue the service with reasonable notice.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">4. Account Responsibilities</Typography>
                        <Typography className="legal-content__text">
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">5. Limitation of Liability</Typography>
                        <Typography className="legal-content__text">
                            AthlonX shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use our services.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">6. Governing Law</Typography>
                        <Typography className="legal-content__text">
                            These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be resolved in the courts of Bangalore, Karnataka.
                        </Typography>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
}
