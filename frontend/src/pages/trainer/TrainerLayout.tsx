import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Trainer.css';

interface TrainerLayoutProps {
    children?: React.ReactNode;
}

const TrainerLayout: React.FC<TrainerLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/trainer', icon: 'home', label: 'Dashboard', exact: true },
        { path: '/trainer/profile', icon: 'user', label: 'My Profile' },
        { path: '/trainer/members', icon: 'users', label: 'My Members' },
        { path: '/trainer/schedule', icon: 'calendar', label: 'My Schedule' },
    ];

    const getIcon = (name: string) => {
        switch (name) {
            case 'home':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
            case 'user':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
            case 'users':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
            case 'calendar':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
            default:
                return null;
        }
    };

    return (
        <div className="trainer-layout">
            {/* Sidebar */}
            <aside className={`trainer-sidebar ${isSidebarCollapsed ? 'trainer-sidebar--collapsed' : ''}`}>
                <div className="trainer-sidebar__header">
                    <div className="trainer-sidebar__logo">
                        <span className="logo-icon">🏋️</span>
                        {!isSidebarCollapsed && <span className="logo-text">AthlonX</span>}
                    </div>
                    <button
                        className="trainer-sidebar__toggle"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className="trainer-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `trainer-nav-item ${isActive ? 'trainer-nav-item--active' : ''}`
                            }
                        >
                            {getIcon(item.icon)}
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="trainer-sidebar__footer">
                    <div className="trainer-user-info">
                        <div className="trainer-user-avatar">
                            {user?.fullName?.charAt(0) || 'T'}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="trainer-user-details">
                                <span className="trainer-user-name">{user?.fullName || 'Trainer'}</span>
                                <span className="trainer-user-role">Trainer</span>
                            </div>
                        )}
                    </div>
                    <button className="trainer-logout-btn" onClick={handleLogout} title="Logout">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="trainer-main">
                {children || <Outlet />}
            </main>
        </div>
    );
};

export default TrainerLayout;
