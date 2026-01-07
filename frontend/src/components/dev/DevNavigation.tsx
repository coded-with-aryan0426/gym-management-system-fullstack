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
    Maximize2,
    Wand2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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

    // Position detection with safe defaults
    const [position, setPosition] = useState(() => {
        try {
            const saved = localStorage.getItem('devNavPosition');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Simple validation to ensure it's on screen
                if (parsed.x >= 0 && parsed.x <= window.innerWidth && parsed.y >= 0 && parsed.y <= window.innerHeight) {
                    return parsed;
                }
            }
        } catch {
            // Ignore errors
        }
        // Default to bottom-right
        return { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    });

    // Drag detection state
    const dragRef = useRef<{
        startX: number;
        startY: number;
        startPosX: number;
        startPosY: number;
        hasMoved: boolean;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Use AuthContext hook
    const { devLogin } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    // Persist position
    useEffect(() => {
        localStorage.setItem('devNavPosition', JSON.stringify(position));
    }, [position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only trigger on left click
        if (e.button !== 0) return;

        e.preventDefault();

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y,
            hasMoved: false
        };

        // Add listeners to window to capture moves outside element
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // If moved beyond threshold, consider it a drag
        if (!dragRef.current.hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            dragRef.current.hasMoved = true;
            setIsDragging(true);
        }

        if (dragRef.current.hasMoved) {
            const newX = Math.max(30, Math.min(window.innerWidth - 30, dragRef.current.startPosX + dx));
            const newY = Math.max(30, Math.min(window.innerHeight - 30, dragRef.current.startPosY + dy));
            setPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        // Clean up listeners
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        if (dragRef.current) {
            // If it wasn't a drag interaction (clicked without moving), toggle menu
            if (!dragRef.current.hasMoved) {
                setIsOpen(prev => !prev);
            }
            dragRef.current = null;
            setIsDragging(false);
        }
    };

    const handleNavigate = (path: string, role: string) => {
        devLogin(role as any);
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

        // Default to showing to the left and above
        let left = position.x - panelWidth - 20;
        let top = position.y - panelHeight + 40;

        // Adjust if off-screen (basic collision detection)
        if (left < 10) left = position.x + 20; // Flip to right if too far left
        if (left + panelWidth > window.innerWidth) left = window.innerWidth - panelWidth - 10;

        if (top < 10) top = 10;
        if (top + panelHeight > window.innerHeight) top = window.innerHeight - panelHeight - 10;

        return { left, top };
    };

    const panelPos = getPanelPosition();

    return (
        <>
            <div
                className={`dev-nav-trigger ${isDragging ? 'dragging' : ''}`}
                style={{ left: position.x, top: position.y, zIndex: 999999 }}
                onMouseDown={handleMouseDown}
            >
                <div className="dev-nav-glow-ring" />
                <button
                    className="dev-nav-btn"
                    // Prevent default click propagation since we handle it in MouseUp
                    onClick={(e) => e.stopPropagation()}
                >
                    <Wand2 size={24} className="text-white" />
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
                                    <span>Dev Mode</span>
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
