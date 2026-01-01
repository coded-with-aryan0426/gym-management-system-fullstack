import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    X,
    Shield,
    Users,
    Dumbbell,
    LayoutDashboard,
    ChevronRight
} from 'lucide-react';
import './DevNavigation.css';

interface DashboardOption {
    role: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const dashboards: DashboardOption[] = [
    {
        role: 'ADMIN',
        label: 'Admin Dashboard',
        path: '/dashboard',
        icon: <Shield size={22} />,
        color: '#f59e0b',
        description: 'Full system access - Dashboard, Members, Trainers, Financials, Reports, Settings'
    },
    {
        role: 'TRAINER',
        label: 'Trainer Dashboard',
        path: '/trainer',
        icon: <Dumbbell size={22} />,
        color: '#22c55e',
        description: 'Trainer view - My Schedule, My Members, Classes, Profile'
    },
    {
        role: 'MEMBER',
        label: 'Member Dashboard',
        path: '/member',
        icon: <Users size={22} />,
        color: '#3b82f6',
        description: 'Member portal - Membership, Progress, Bookings, Classes'
    }
];

/**
 * DEV MODE Navigation Panel
 * Floating button that opens a panel to switch between different dashboards
 * without authentication. For development purposes only.
 */
const DevNavigation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path: string, role: string) => {
        // Set mock user in localStorage for any components that might need it
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            username: `dev_${role.toLowerCase()}`,
            fullName: `Dev ${role}`,
            email: `dev.${role.toLowerCase()}@gym.local`,
            role: role,
            staffRole: role === 'ADMIN' ? 'OWNER' : role,
            roles: [{ roleName: role }]
        }));
        localStorage.setItem('token', 'dev-mode-token');

        navigate(path);
        setIsOpen(false);
    };

    const getCurrentDashboard = () => {
        const path = location.pathname;
        if (path.startsWith('/trainer')) return 'TRAINER';
        if (path.startsWith('/member')) return 'MEMBER';
        if (path.startsWith('/dashboard') || path.startsWith('/trainers') ||
            path.startsWith('/members') || path.startsWith('/classes') ||
            path.startsWith('/financials') || path.startsWith('/pt-sessions') ||
            path.startsWith('/reports') || path.startsWith('/settings')) return 'ADMIN';
        return null;
    };

    const currentDashboard = getCurrentDashboard();

    return (
        <>
            {/* Floating Dev Button */}
            <motion.button
                className="dev-nav-trigger"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <LayoutDashboard size={20} />
                <span>DEV</span>
            </motion.button>

            {/* Panel Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="dev-nav-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="dev-nav-panel"
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="dev-nav-header">
                                <div className="dev-nav-title">
                                    <Settings className="spin-slow" size={18} />
                                    <span>Dev Mode</span>
                                </div>
                                <button className="dev-nav-close" onClick={() => setIsOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="dev-nav-subtitle">
                                Authentication bypassed. Select a dashboard to view:
                            </p>

                            <div className="dev-nav-options">
                                {dashboards.map((dashboard) => (
                                    <motion.button
                                        key={dashboard.role}
                                        className={`dev-nav-option ${currentDashboard === dashboard.role ? 'active' : ''}`}
                                        onClick={() => handleNavigate(dashboard.path, dashboard.role)}
                                        whileHover={{ x: 4 }}
                                        style={{ '--accent-color': dashboard.color } as React.CSSProperties}
                                    >
                                        <div className="dev-nav-option-icon" style={{ backgroundColor: dashboard.color + '20', color: dashboard.color }}>
                                            {dashboard.icon}
                                        </div>
                                        <div className="dev-nav-option-content">
                                            <span className="dev-nav-option-label">{dashboard.label}</span>
                                            <span className="dev-nav-option-desc">{dashboard.description}</span>
                                        </div>
                                        <ChevronRight size={16} className="dev-nav-option-arrow" />
                                    </motion.button>
                                ))}
                            </div>

                            <div className="dev-nav-footer">
                                <span className="dev-nav-warning">⚠️ For development only</span>
                                <span className="dev-nav-note">Re-enable auth before production</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default DevNavigation;
