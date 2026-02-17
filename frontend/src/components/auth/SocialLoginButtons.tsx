import { useState } from 'react';
import api from '../../services/api';
import './SocialLoginButtons.css';

interface SocialLoginButtonsProps {
    onSuccess: (response: any) => void;
    onError: (error: string) => void;
    mode?: 'login' | 'signup';
}

// Google Icon SVG
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Facebook Icon SVG
const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

// Phone Icon for OTP login
const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
    </svg>
);

export default function SocialLoginButtons({ onSuccess, onError, mode = 'login' }: SocialLoginButtonsProps) {
    const [isLoading, setIsLoading] = useState<'google' | 'facebook' | 'phone' | null>(null);

    // Handle Google Sign-In (opens popup)
    const handleGoogleLogin = async () => {
        setIsLoading('google');
        try {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            if (!clientId) {
                onError('Google login not configured. Please contact support.');
                setIsLoading(null);
                return;
            }

            // Open Google OAuth popup
            const width = 500, height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;

            // Generate nonce for security
            const nonce = Math.random().toString(36).substring(2, 15);

            const popup = window.open(
                `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
                `response_type=id_token token&` +
                `scope=email profile openid&` +
                `nonce=${nonce}`,
                'google-login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Listen for callback message from popup
            const handleMessage = async (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;
                if (event.data?.type === 'google-auth') {
                    window.removeEventListener('message', handleMessage);
                    clearTimeout(timeoutId);
                    popup?.close();

                    if (event.data.error) {
                        onError(event.data.error);
                        setIsLoading(null);
                        return;
                    }

                    const token = event.data.accessToken || event.data.idToken;
                    if (!token) {
                        onError('No token received from Google');
                        setIsLoading(null);
                        return;
                    }

                    try {
                        // Send token to backend for verification
                        const response = await api.post('/auth/oauth/google', {
                            accessToken: event.data.accessToken,
                            idToken: event.data.idToken
                        });
                        onSuccess(response.data);
                    } catch (err: any) {
                        onError(err.response?.data?.message || err.response?.data?.error || 'Google login failed');
                    } finally {
                        setIsLoading(null);
                    }
                }
            };

            window.addEventListener('message', handleMessage);

            // Timeout after 2 minutes
            const timeoutId = setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                popup?.close();
                onError('Login timed out. Please try again.');
                setIsLoading(null);
            }, 120000);

            // Check if popup was blocked
            if (!popup || popup.closed) {
                window.removeEventListener('message', handleMessage);
                clearTimeout(timeoutId);
                onError('Popup was blocked. Please allow popups and try again.');
                setIsLoading(null);
            }

        } catch (err: any) {
            onError(err.message || 'Google login failed');
            setIsLoading(null);
        }
    };

    // Handle Facebook Login
    const handleFacebookLogin = async () => {
        setIsLoading('facebook');
        try {
            const appId = import.meta.env.VITE_FACEBOOK_APP_ID;

            if (!appId) {
                onError('Facebook login not configured. Please contact support.');
                return;
            }

            // Open Facebook OAuth popup
            const width = 500, height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;

            const popup = window.open(
                `https://www.facebook.com/v18.0/dialog/oauth?` +
                `client_id=${appId}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/facebook/callback')}&` +
                `response_type=token&` +
                `scope=email,public_profile`,
                'facebook-login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Listen for callback
            const handleMessage = async (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;
                if (event.data?.type === 'facebook-auth') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();

                    try {
                        const response = await api.post('/auth/oauth/facebook', {
                            accessToken: event.data.accessToken
                        });
                        onSuccess(response.data);
                    } catch (err: any) {
                        onError(err.response?.data?.message || 'Facebook login failed');
                    }
                }
            };

            window.addEventListener('message', handleMessage);

        } catch (err: any) {
            onError(err.message || 'Facebook login failed');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="social-login-buttons">
            <div className="social-divider">
                <span>or continue with</span>
            </div>

            <div className="social-buttons-row">
                <button
                    className="social-btn google-btn"
                    onClick={handleGoogleLogin}
                    disabled={isLoading !== null}
                >
                    {isLoading === 'google' ? (
                        <div className="social-spinner" />
                    ) : (
                        <>
                            <GoogleIcon />
                            <span>Google</span>
                        </>
                    )}
                </button>

                <button
                    className="social-btn facebook-btn"
                    onClick={handleFacebookLogin}
                    disabled={isLoading !== null}
                >
                    {isLoading === 'facebook' ? (
                        <div className="social-spinner" />
                    ) : (
                        <>
                            <FacebookIcon />
                            <span>Facebook</span>
                        </>
                    )}
                </button>
            </div>

            <p className="social-terms">
                By continuing, you agree to our{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>
            </p>
        </div>
    );
}
