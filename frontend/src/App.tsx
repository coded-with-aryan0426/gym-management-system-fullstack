import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AppShell } from './components/Layout';

// Import new design system
import './styles/global.css';

// Lazy load pages for faster initial load
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Staff = lazy(() => import('./pages/Staff/Staff'));
const Members = lazy(() => import('./pages/Members/Members'));
const Classes = lazy(() => import('./pages/Classes/Classes'));
const Financials = lazy(() => import('./pages/Financials/Financials'));
const PTSessions = lazy(() => import('./pages/PTSessions/PTSessions'));
const Settings = lazy(() => import('./pages/Settings/Settings'));

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
          <AppShell>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/members" element={<Members />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/financials" element={<Financials />} />
                <Route path="/pt-sessions" element={<PTSessions />} />
                <Route path="/reports" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppShell>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--button-radius)',
                border: '1px solid var(--border-primary)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-emerald)',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid var(--color-emerald)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-crimson)',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid var(--color-crimson)',
                },
              },
            }}
          />
        </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
