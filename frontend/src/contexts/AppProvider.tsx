import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '../services/queryClient';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { CurrencyProvider } from './CurrencyContext';
import { MembersProvider } from './MembersContext';
import { TrainerProvider } from './TrainerContext';
import { ClassesProvider } from './ClassesContext';
import { NavbarProvider } from './NavbarContext';
import { ChatProvider } from './ChatContext';
import { EditorProvider } from './EditorContext';
import { AuthModalProvider } from './AuthModalContext';
import { FeatureProvider } from './FeatureContext';
import EditorOverlay from '../components/editor/EditorOverlay';
import AuthModal from '../components/auth/AuthModal';

interface AppProviderProps {
    children: ReactNode;
}

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
                                                <ChatProvider>
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
                                                </ChatProvider>
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
