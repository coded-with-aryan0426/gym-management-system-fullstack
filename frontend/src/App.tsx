import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { MembersProvider } from './contexts/MembersContext';
import { TrainerProvider } from './contexts/TrainerContext';
import { ClassesProvider } from './contexts/ClassesContext';
import { NavbarProvider } from './contexts/NavbarContext';
import { AppShell } from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DevNavigation from './components/dev/DevNavigation';

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
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const ChangePasswordFirst = lazy(() => import('./pages/ChangePasswordFirst'));

// Static Pages
const AboutPage = lazy(() => import('./pages/static/AboutPage'));
const ContactPage = lazy(() => import('./pages/static/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/static/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/static/TermsPage'));
const MemberAppPage = lazy(() => import('./pages/static/MemberAppPage'));

// Trainer Dashboard Pages
const TrainerLayout = lazy(() => import('./pages/trainer/TrainerLayout'));
const TrainerDashboard = lazy(() => import('./pages/trainer/TrainerDashboard'));
const TrainerProfile = lazy(() => import('./pages/trainer/TrainerProfile'));
const MyMembers = lazy(() => import('./pages/trainer/MyMembers'));
const MySchedule = lazy(() => import('./pages/trainer/MySchedule'));
const MyClasses = lazy(() => import('./pages/trainer/MyClasses'));
const TrainerNotifications = lazy(() => import('./pages/trainer/TrainerNotifications'));
const ProgressNotes = lazy(() => import('./pages/trainer/ProgressNotes'));
const TrainerMessages = lazy(() => import('./pages/trainer/TrainerMessages'));
const TrainerReports = lazy(() => import('./pages/trainer/TrainerReports'));
const TrainerSettings = lazy(() => import('./pages/trainer/TrainerSettings'));

// Member Dashboard Pages
const MemberLayout = lazy(() => import('./pages/member/MemberLayout'));
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const MemberProfile = lazy(() => import('./pages/member/MemberProfile'));
const MyMembership = lazy(() => import('./pages/member/MyMembership'));
const MyProgress = lazy(() => import('./pages/member/MyProgress'));
const MyTrainer = lazy(() => import('./pages/member/MyTrainer'));
const MyBookings = lazy(() => import('./pages/member/MyBookings'));
const AvailableClasses = lazy(() => import('./pages/member/AvailableClasses'));
const MemberNotifications = lazy(() => import('./pages/member/MemberNotifications'));
const MemberMessages = lazy(() => import('./pages/member/MemberMessages'));
const MemberSettings = lazy(() => import('./pages/member/MemberSettings'));

// Loading spinner for page transitions
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CurrencyProvider>
          <MembersProvider>
            <TrainerProvider>
              <ClassesProvider>
                <NavbarProvider>
                  <Toaster
                    position="top-right"
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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                      <Route path="/change-password" element={<ChangePasswordFirst />} />

                      {/* Static Pages */}
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/member-app" element={<MemberAppPage />} />

                      {/* Trainer Dashboard Routes */}
                      <Route
                        path="/trainer/*"
                        element={
                          <ProtectedRoute allowedRoles={['TRAINER']}>
                            <TrainerLayout>
                              <Routes>
                                <Route index element={<TrainerDashboard />} />
                                <Route path="profile" element={<TrainerProfile />} />
                                <Route path="members" element={<MyMembers />} />
                                <Route path="classes" element={<MyClasses />} />
                                <Route path="schedule" element={<MySchedule />} />
                                <Route path="notifications" element={<TrainerNotifications />} />
                                <Route path="progress-notes" element={<ProgressNotes />} />
                                <Route path="messages" element={<TrainerMessages />} />
                                <Route path="reports" element={<TrainerReports />} />
                                <Route path="settings" element={<TrainerSettings />} />
                                <Route path="*" element={<Navigate to="/trainer" replace />} />
                              </Routes>
                            </TrainerLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Member Dashboard Routes */}
                      <Route
                        path="/member/*"
                        element={
                          <ProtectedRoute allowedRoles={['CUSTOMER', 'MEMBER']}>
                            <MemberLayout>
                              <Routes>
                                <Route index element={<MemberDashboard />} />
                                <Route path="profile" element={<MemberProfile />} />
                                <Route path="membership" element={<MyMembership />} />
                                <Route path="progress" element={<MyProgress />} />
                                <Route path="classes" element={<AvailableClasses />} />
                                <Route path="trainer" element={<MyTrainer />} />
                                <Route path="bookings" element={<MyBookings />} />
                                <Route path="notifications" element={<MemberNotifications />} />
                                <Route path="messages" element={<MemberMessages />} />
                                <Route path="settings" element={<MemberSettings />} />
                                <Route path="*" element={<Navigate to="/member" replace />} />
                              </Routes>
                            </MemberLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin/Owner Dashboard Routes */}
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
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
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Suspense>
                  <DevNavigation />
                </NavbarProvider>
              </ClassesProvider>
            </TrainerProvider>
          </MembersProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
