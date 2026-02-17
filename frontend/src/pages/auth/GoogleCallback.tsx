import { useEffect } from 'react';

/**
 * OAuth Callback Handler
 * This page receives the OAuth callback in the popup window,
 * extracts the token, sends it to the parent window, and closes.
 */
export default function GoogleCallback() {
    useEffect(() => {
        // Get token from URL hash (Google returns it as #access_token=...)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
            // Send error to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'google-auth',
                    error: error
                }, window.location.origin);
                window.close();
            }
            return;
        }

        if (accessToken || idToken) {
            // Send token to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'google-auth',
                    accessToken: accessToken,
                    idToken: idToken
                }, window.location.origin);
                window.close();
            } else {
                // If no opener (direct navigation), redirect to home
                window.location.href = '/?openAuth=true';
            }
        } else {
            // No token found, might need to exchange code
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get('code');

            if (code) {
                // Authorization code flow - send to parent
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'google-auth',
                        code: code
                    }, window.location.origin);
                    window.close();
                }
            }
        }
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#0D0D0D',
            color: '#F9FAFB',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #333',
                    borderTop: '3px solid #DC2626',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                }} />
                <p>Completing sign in...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
