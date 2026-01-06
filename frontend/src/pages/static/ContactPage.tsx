import { Box, Typography, Container, TextField, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Send, Mail, Phone } from 'lucide-react';
import Header from '../../components/landing/Header';
import Footer from '../../components/landing/Footer';
import './StaticPages.css';

export default function ContactPage() {
    return (
        <Box className="static-page">
            <Header />
            <Box className="static-page__hero">
                <Container maxWidth="lg">
                    <Grid container spacing={8}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h1" className="static-page__title">
                                    Let's Talk.
                                </Typography>
                                <Typography className="static-page__subtitle">
                                    Ready to scale your gym? Our experts are here to help you set up the perfect OS for your business.
                                </Typography>

                                <Box className="contact-info">
                                    <Box className="contact-info__item">
                                        <Box className="contact-info__icon contact-info__icon--red"><Mail size={24} /></Box>
                                        <Box>
                                            <Typography className="contact-info__label">Email Us</Typography>
                                            <Typography className="contact-info__value">sales@athlonx.com</Typography>
                                        </Box>
                                    </Box>
                                    <Box className="contact-info__item">
                                        <Box className="contact-info__icon contact-info__icon--blue"><Phone size={24} /></Box>
                                        <Box>
                                            <Typography className="contact-info__label">Call Us</Typography>
                                            <Typography className="contact-info__value">+91 98765 43210</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>

                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="contact-form"
                            >
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Full Name" variant="outlined" className="contact-form__input" />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Work Email" variant="outlined" className="contact-form__input" />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth label="Gym Name" variant="outlined" className="contact-form__input" />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth multiline rows={4} label="How can we help?" variant="outlined" className="contact-form__input" />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            className="contact-form__submit"
                                            endIcon={<Send size={20} />}
                                        >
                                            Send Message
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
}
