import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { MembersProvider } from './contexts/MembersContext';
import { TrainerProvider } from './contexts/TrainerContext';
import { NavbarProvider } from './contexts/NavbarContext';
import { AppShell } from './components/Layout';

// Import new design system
import './styles/global.css';

// Lazy load pages for faster initial load
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Trainers = lazy(() => import('./pages/Trainers/Trainers'));
const Members = lazy(() => import('./pages/Members/Members'));
const Classes = lazy(() => import('./pages/Classes/Classes'));
const Financials = lazy(() => import('./pages/Financials/Financials'));
const PTSessions = lazy(() => import('./pages/PTSessions/PTSessions'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

// Loading spinner for page transitions
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <MembersProvider>
                    <TrainerProvider>
                      <NavbarProvider>
                        <AppShell>
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/trainers" element={<Trainers />} />
                            <Route path="/members" element={<Members />} />
                            <Route path="/classes" element={<Classes />} />
                            <Route path="/financials" element={<Financials />} />
                            <Route path="/pt-sessions" element={<PTSessions />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </AppShell>
                      </NavbarProvider>
                    </TrainerProvider>
                  </MembersProvider>
                }
              />
            </Routes>
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'modern-toast',
              style: {
                background: '#1e1e24', // Darker cleaner background
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
                  primary: '#22c55e', // Emerald 500
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(34, 197, 94, 0.2)', // Subtle green border
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444', // Red 500
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.2)', // Subtle red border
                },
              },
              loading: {
                style: {
                  border: '1px solid rgba(59, 130, 246, 0.2)', // Subtle blue border
                },
              }
            }}
          />
        </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
