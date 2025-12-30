import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Member.css';

interface MemberLayoutProps {
    children?: React.ReactNode;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/member', icon: 'home', label: 'Dashboard', exact: true },
        { path: '/member/profile', icon: 'user', label: 'My Profile' },
        { path: '/member/membership', icon: 'card', label: 'My Membership' },
        { path: '/member/trainer', icon: 'trainer', label: 'My Trainer' },
        { path: '/member/bookings', icon: 'calendar', label: 'My Bookings' },
    ];

    const getIcon = (name: string) => {
        switch (name) {
            case 'home':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
            case 'user':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
            case 'card':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
            case 'trainer':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>;
            case 'calendar':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
            default:
                return null;
        }
    };

    return (
        <div className="member-layout">
            <aside className={`member-sidebar ${isSidebarCollapsed ? 'member-sidebar--collapsed' : ''}`}>
                <div className="member-sidebar__header">
                    <div className="member-sidebar__logo">
                        <span className="logo-icon">🏋️</span>
                        {!isSidebarCollapsed && <span className="logo-text">AthlonX</span>}
                    </div>
                    <button
                        className="member-sidebar__toggle"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className="member-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `member-nav-item ${isActive ? 'member-nav-item--active' : ''}`
                            }
                        >
                            {getIcon(item.icon)}
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="member-sidebar__footer">
                    <div className="member-user-info">
                        <div className="member-user-avatar">
                            {user?.fullName?.charAt(0) || 'M'}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="member-user-details">
                                <span className="member-user-name">{user?.fullName || 'Member'}</span>
                                <span className="member-user-role">Member</span>
                            </div>
                        )}
                    </div>
                    <button className="member-logout-btn" onClick={handleLogout} title="Logout">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            <main className="member-main">
                {children || <Outlet />}
            </main>
        </div>
    );
};

export default MemberLayout;
