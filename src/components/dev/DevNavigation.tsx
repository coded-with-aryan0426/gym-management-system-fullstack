import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    X,
    Shield,
    Users,
    Dumbbell,
    LayoutDashboard,
    ChevronRight,
    GripVertical,
    Minimize2,
    Maximize2
} from 'lucide-react';
import './DevNavigation.css';

interface DashboardOption {
    role: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    subPages: { name: string; path: string }[];
}

const dashboards: DashboardOption[] = [
    {
        role: 'ADMIN',
        label: 'Admin',
        path: '/dashboard',
        icon: <Shield size={18} />,
        color: '#f59e0b',
        description: 'Full system access',
        subPages: [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Members', path: '/members' },
            { name: 'Trainers', path: '/trainers' },
            { name: 'Classes', path: '/classes' },
            { name: 'PT Sessions', path: '/pt-sessions' },
            { name: 'Financials', path: '/financials' },
            { name: 'Reports', path: '/reports' },
            { name: 'Settings', path: '/settings' }
        ]
    },
    {
        role: 'TRAINER',
        label: 'Trainer',
        path: '/trainer',
        icon: <Dumbbell size={18} />,
        color: '#22c55e',
        description: 'Trainer portal',
        subPages: [
            { name: 'Dashboard', path: '/trainer' },
            { name: 'Schedule', path: '/trainer/schedule' },
            { name: 'Members', path: '/trainer/members' },
            { name: 'Classes', path: '/trainer/classes' },
            { name: 'Messages', path: '/trainer/messages' },
            { name: 'Profile', path: '/trainer/profile' }
        ]
    },
    {
        role: 'MEMBER',
        label: 'Member',
        path: '/member',
        icon: <Users size={18} />,
        color: '#3b82f6',
        description: 'Member portal',
        subPages: [
            { name: 'Dashboard', path: '/member' },
            { name: 'Membership', path: '/member/membership' },
            { name: 'Progress', path: '/member/progress' },
            { name: 'Bookings', path: '/member/bookings' },
            { name: 'Classes', path: '/member/classes' },
            { name: 'Messages', path: '/member/messages' },
            { name: 'Notifications', path: '/member/notifications' },
            { name: 'Settings', path: '/member/settings' },
            { name: 'Profile', path: '/member/profile' }
        ]
    }
];

const DevNavigation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('devNavPosition');
        return saved ? JSON.parse(saved) : { x: window.innerWidth - 100, y: window.innerHeight - 80 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        localStorage.setItem('devNavPosition', JSON.stringify(position));
    }, [position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            const newX = Math.max(60, Math.min(window.innerWidth - 60, dragRef.current.startPosX + dx));
            const newY = Math.max(40, Math.min(window.innerHeight - 40, dragRef.current.startPosY + dy));
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragRef.current = null;
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleNavigate = (path: string, role: string) => {
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            username: `dev_${role.toLowerCase()}`,
            fullName: `Dev ${role}`,
            email: `dev.${role.toLowerCase()}@gym.local`,
            role: role,
            context: role === 'MEMBER' ? 'MEMBER' : 'STAFF',
            staffRole: role === 'ADMIN' ? 'OWNER' : role,
            roles: [{ roleName: role }]
        }));
        localStorage.setItem('token', 'dev-mode-token');
        navigate(path);
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

    const getPanelPosition = () => {
        const panelWidth = isCompact ? 280 : 340;
        const panelHeight = isCompact ? 200 : 420;
        let left = position.x + 20;
        let top = position.y - panelHeight / 2;

        if (left + panelWidth > window.innerWidth - 10) {
            left = position.x - panelWidth - 20;
        }
        if (top < 10) top = 10;
        if (top + panelHeight > window.innerHeight - 10) {
            top = window.innerHeight - panelHeight - 10;
        }
        return { left, top };
    };

    const panelPos = getPanelPosition();

    return (
        <>
            <div
                className={`dev-nav-trigger ${isDragging ? 'dragging' : ''}`}
                style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
            >
                <div
                    className="dev-nav-drag-handle"
                    onMouseDown={handleMouseDown}
                    title="Drag to move"
                >
                    <GripVertical size={14} />
                </div>
                <button
                    className="dev-nav-btn"
                    onClick={() => !isDragging && setIsOpen(true)}
                >
                    <LayoutDashboard size={16} />
                    <span>DEV</span>
                </button>
            </div>

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
                            className={`dev-nav-panel ${isCompact ? 'compact' : ''}`}
                            style={{ left: panelPos.left, top: panelPos.top }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        >
                            <div className="dev-nav-header">
                                <div className="dev-nav-title">
                                    <Settings className="spin-slow" size={14} />
                                    <span>Dev Navigation</span>
                                </div>
                                <div className="dev-nav-header-actions">
                                    <button
                                        className="dev-nav-action-btn"
                                        onClick={() => setIsCompact(!isCompact)}
                                        title={isCompact ? 'Expand' : 'Compact'}
                                    >
                                        {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                    </button>
                                    <button className="dev-nav-close" onClick={() => setIsOpen(false)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="dev-nav-options">
                                {dashboards.map((dashboard) => (
                                    <div key={dashboard.role} className="dev-nav-group">
                                        <button
                                            className={`dev-nav-option ${currentDashboard === dashboard.role ? 'active' : ''}`}
                                            onClick={() => {
                                                if (isCompact) {
                                                    handleNavigate(dashboard.path, dashboard.role);
                                                    setIsOpen(false);
                                                } else {
                                                    setExpandedRole(expandedRole === dashboard.role ? null : dashboard.role);
                                                }
                                            }}
                                            style={{ '--accent-color': dashboard.color } as React.CSSProperties}
                                        >
                                            <div className="dev-nav-option-icon" style={{ backgroundColor: dashboard.color + '20', color: dashboard.color }}>
                                                {dashboard.icon}
                                            </div>
                                            <div className="dev-nav-option-content">
                                                <span className="dev-nav-option-label">{dashboard.label}</span>
                                                {!isCompact && <span className="dev-nav-option-desc">{dashboard.description}</span>}
                                            </div>
                                            {!isCompact && (
                                                <ChevronRight
                                                    size={14}
                                                    className={`dev-nav-option-arrow ${expandedRole === dashboard.role ? 'expanded' : ''}`}
                                                />
                                            )}
                                        </button>
                                        {!isCompact && expandedRole === dashboard.role && (
                                            <motion.div
                                                className="dev-nav-subpages"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                {dashboard.subPages.map((page) => (
                                                    <button
                                                        key={page.path}
                                                        className={`dev-nav-subpage ${location.pathname === page.path ? 'active' : ''}`}
                                                        onClick={() => {
                                                            handleNavigate(page.path, dashboard.role);
                                                            setIsOpen(false);
                                                        }}
                                                        style={{ '--accent-color': dashboard.color } as React.CSSProperties}
                                                    >
                                                        {page.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="dev-nav-footer">
                                <span className="dev-nav-warning">⚠️ Dev only</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default DevNavigation;
