import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/unified-design-system.css';

type Role = 'admin' | 'trainer' | 'member';

interface DashboardHeaderProps {
    role: Role;
    userName: string;
    greeting?: string;
    subtitle?: string;
    notificationCount?: number;
    showSettings?: boolean;
}

const roleConfig = {
    admin: {
        label: 'Admin Portal',
        color: '#DC2626',
        gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
    },
    trainer: {
        label: 'Trainer Portal',
        color: '#4F46E5',
        gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)'
    },
    member: {
        label: 'Member Portal',
        color: '#007AFF',
        gradient: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)'
    }
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    role,
    userName,
    greeting,
    subtitle,
    notificationCount = 0,
    showSettings = true
}) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const config = roleConfig[role];
    const firstName = userName.split(' ')[0];
    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const displayGreeting = greeting || getGreeting();

    const handleLogout = () => {
        logout();
    };

    const getNotificationPath = () => {
        switch (role) {
            case 'admin': return '/notifications';
            case 'trainer': return '/trainer/notifications';
            case 'member': return '/member/notifications';
        }
    };

    const getSettingsPath = () => {
        switch (role) {
            case 'admin': return '/settings';
            case 'trainer': return '/trainer/settings';
            case 'member': return '/member/profile';
        }
    };

    return (
        <motion.header 
            className="dashboard-header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="dashboard-header__left">
                <motion.div 
                    className="dashboard-header__role-badge"
                    style={{ 
                        background: `${config.color}15`,
                        borderColor: `${config.color}30`,
                        color: config.color 
                    }}
                    whileHover={{ scale: 1.02 }}
                >
                    <motion.span 
                        className="dashboard-header__role-dot"
                        style={{ background: config.color }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    {config.label}
                </motion.div>

                <div className="dashboard-header__greeting">
                    <span className="dashboard-header__greeting-text">{displayGreeting},</span>
                    <h1 className="dashboard-header__name">{firstName}</h1>
                    {subtitle && <p className="dashboard-header__subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="dashboard-header__right">
                <motion.button 
                    className="dashboard-header__action"
                    onClick={() => navigate(getNotificationPath())}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ position: 'relative' }}
                >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                        <motion.span 
                            className="dashboard-header__badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </motion.span>
                    )}
                </motion.button>

                {showSettings && (
                    <motion.button 
                        className="dashboard-header__action"
                        onClick={() => navigate(getSettingsPath())}
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Settings size={20} />
                    </motion.button>
                )}

                <div className="dashboard-header__profile">
                    <motion.div 
                        className="dashboard-header__avatar"
                        style={{ background: config.gradient }}
                        whileHover={{ scale: 1.05 }}
                    >
                        {initials}
                    </motion.div>
                    
                    <div className="dashboard-header__profile-menu">
                        <motion.button 
                            className="dashboard-header__profile-item"
                            whileHover={{ x: 4 }}
                            onClick={() => navigate(role === 'admin' ? '/settings' : `/${role}/profile`)}
                        >
                            <User size={16} />
                            My Profile
                        </motion.button>
                        <motion.button 
                            className="dashboard-header__profile-item dashboard-header__profile-item--logout"
                            whileHover={{ x: 4 }}
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            Sign Out
                        </motion.button>
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 0 24px;
                    margin-bottom: 8px;
                }

                .dashboard-header__left {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .dashboard-header__role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: 1px solid;
                    width: fit-content;
                }

                .dashboard-header__role-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .dashboard-header__greeting {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .dashboard-header__greeting-text {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .dashboard-header__name {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .dashboard-header__subtitle {
                    font-size: 14px;
                    color: var(--text-tertiary);
                    margin: 4px 0 0;
                }

                .dashboard-header__right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .dashboard-header__action {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: var(--bg-glass);
                    border: 1px solid var(--border-default);
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .dashboard-header__action:hover {
                    background: var(--bg-glass-hover);
                    color: var(--text-primary);
                }

                .dashboard-header__badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 9px;
                    background: var(--error);
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .dashboard-header__profile {
                    position: relative;
                }

                .dashboard-header__avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                }

                .dashboard-header__profile-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-default);
                    border-radius: 12px;
                    padding: 8px;
                    min-width: 160px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-8px);
                    transition: all 0.2s;
                    z-index: 100;
                }

                .dashboard-header__profile:hover .dashboard-header__profile-menu {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .dashboard-header__profile-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .dashboard-header__profile-item:hover {
                    background: var(--bg-glass);
                    color: var(--text-primary);
                }

                .dashboard-header__profile-item--logout {
                    color: var(--error);
                }

                .dashboard-header__profile-item--logout:hover {
                    background: var(--error-bg);
                    color: var(--error);
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .dashboard-header__right {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .dashboard-header__name {
                        font-size: 24px;
                    }
                }
            `}</style>
        </motion.header>
    );
};

export default DashboardHeader;
