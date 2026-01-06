import { Box, Typography, Container } from '@mui/material';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import './StaticPages.css';

export default function PrivacyPage() {
    return (
        <Box className="static-page">
            <Header />
            <Box className="static-page__hero">
                <Container maxWidth="md">
                    <Typography variant="h1" className="static-page__title">
                        Privacy Policy
                    </Typography>
                    <Box className="legal-content">
                        <Typography variant="h5" className="legal-content__heading">1. Data Collection</Typography>
                        <Typography className="legal-content__text">
                            We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, phone number, gym membership details, and usage data.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">2. How We Use Data</Typography>
                        <Typography className="legal-content__text">
                            We use the information we collect to provide, maintain, and improve our services, and to develop new ones. This includes processing transactions, sending notifications, and personalizing your experience.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">3. Data Security</Typography>
                        <Typography className="legal-content__text">
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All data is encrypted in transit and at rest using industry-standard protocols.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">4. Data Sharing</Typography>
                        <Typography className="legal-content__text">
                            We do not sell your personal information. We may share data with your gym owner as necessary to provide services, and with service providers who assist in our operations.
                        </Typography>

                        <Typography variant="h5" className="legal-content__heading">5. Your Rights</Typography>
                        <Typography className="legal-content__text">
                            You have the right to access, correct, or delete your personal information. You may also request a copy of your data in a portable format. Contact us at privacy@athlonx.com for any requests.
                        </Typography>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
}
