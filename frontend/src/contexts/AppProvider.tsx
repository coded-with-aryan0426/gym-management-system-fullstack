import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense, useState, useEffect } from 'react';
import { QueryProvider } from '../services/queryClient';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { CurrencyProvider } from './CurrencyContext';
import { MembersProvider } from './MembersContext';
import { TrainerProvider } from './TrainerContext';
import { ClassesProvider } from './ClassesContext';
import { NavbarProvider } from './NavbarContext';
import { EditorProvider } from './EditorContext';
import { AuthModalProvider } from './AuthModalContext';
import { FeatureProvider, useFeatureContext } from './FeatureContext';
import EditorOverlay from '../components/editor/EditorOverlay';
import AuthModal from '../components/auth/AuthModal';

interface AppProviderProps {
    children: ReactNode;
}

// Lazy-loaded ChatProvider wrapper - only renders if chat is enabled
const ChatProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isChatEnabled } = useFeatureContext();
    const [ChatContext, setChatContext] = useState<any>(null);

    useEffect(() => {
        if (isChatEnabled()) {
            // Dynamic import when enabled
            import('./ChatContext').then(module => {
                setChatContext(() => module.ChatProvider);
            });
        }
    }, [isChatEnabled]);

    if (!isChatEnabled()) {
        return <>{children}</>;
    }

    if (!ChatContext) {
        return <>{children}</>;
    }

    return <ChatContext>{children}</ChatContext>;
};

export function AppProvider({ children }: AppProviderProps) {
    return (
        <QueryProvider>
            <AuthProvider>
                <FeatureProvider>
                    <ThemeProvider>
                        <AuthModalProvider>
                            <CurrencyProvider>
                                <MembersProvider>
                                    <TrainerProvider>
                                        <ClassesProvider>
                                            <NavbarProvider>
                                                <ChatProviderWrapper>
                                                    <EditorProvider>
                                                        <Toaster
                                                            position="top-center"
                                                            toastOptions={{
                                                                duration: 4000,
                                                                className: 'modern-toast',
                                                                style: {
                                                                    background: '#1e1e24',
                                                                    color: '#fff',
                                                                    borderRadius: '12px',
                                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                                    padding: '14px 18px',
                                                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                                                    fontSize: '14px',
                                                                    fontWeight: 500,
                                                                    maxWidth: '380px',
                                                                    zIndex: 10500, // Ensures toasts appear above all modals (modals are at 1040-1100)
                                                                },
                                                                success: {
                                                                    iconTheme: {
                                                                        primary: '#22c55e',
                                                                        secondary: '#fff',
                                                                    },
                                                                    style: {
                                                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                    },
                                                                },
                                                                error: {
                                                                    duration: 5000,
                                                                    iconTheme: {
                                                                        primary: '#ef4444',
                                                                        secondary: '#fff',
                                                                    },
                                                                    style: {
                                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                    },
                                                                },
                                                                loading: {
                                                                    style: {
                                                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                                                    },
                                                                }
                                                            }}
                                                        />
                                                        <EditorOverlay />
                                                        <AuthModal />
                                                        {children}
                                                    </EditorProvider>
                                                </ChatProviderWrapper>
                                            </NavbarProvider>
                                        </ClassesProvider>
                                    </TrainerProvider>
                                </MembersProvider>
                            </CurrencyProvider>
                        </AuthModalProvider>
                    </ThemeProvider>
                </FeatureProvider>
            </AuthProvider>
        </QueryProvider>
    );
}