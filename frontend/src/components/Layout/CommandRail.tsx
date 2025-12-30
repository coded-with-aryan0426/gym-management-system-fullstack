"use client"

import type React from "react"
import { NavLink } from "react-router-dom"
import { Logo } from "../ui/Logo"
import "./CommandRail.css"

// Icons as inline SVGs for better performance - FILLED VARIANT for "More Detail"
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  members: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  classes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  ),
  staff: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  ),
  financials: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.14 2.26.55 3 1.2 3 2.2 0 1.51-1.15 2.05-2.74 2.05-1.94 0-2.69-1.05-2.76-2.29H5.7c.07 1.96 1.55 3.51 3.51 3.96V21h3v-1.99c1.93-.41 3.48-1.57 3.48-3.66 0-2.36-1.94-3.51-4.89-4.45z" />
    </svg>
  ),
  reports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.82 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  ),
  collapse: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  ),
  expand: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  ),
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: icons.dashboard, color: "#dc2626" },
  { path: "/members", label: "Members", icon: icons.members, color: "#dc2626" },
  { path: "/staff", label: "Staff", icon: icons.staff, color: "#dc2626" },
  { path: "/classes", label: "Classes", icon: icons.classes, color: "#dc2626" },
  { path: "/financials", label: "Financials", icon: icons.financials, color: "#dc2626" },
  { path: "/reports", label: "Reports", icon: icons.reports, color: "#dc2626" },
]

interface CommandRailProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

const CommandRail: React.FC<CommandRailProps> = ({ isCollapsed = false, onToggle }) => {
  // Get user role from storage
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);

      // Return specific role
      // V1 Pivot: Only handle STAFF context
      if (user.context === 'STAFF') {
        return user.staffRole || 'TRAINER';
      }
      return 'TRAINER'; // Default fallback
    } catch (e) {
      return 'TRAINER';
    }
  };

  const role = getUserRole();

  // Filter items based on role
  const filteredNavItems = navItems.filter(item => {
    // 1. Owner sees everything
    if (role === 'OWNER') return true;

    // 2. Trainer (Staff) sees Operations but NOT Financials/Reports
    const restricted = ['/financials', '/reports'];
    return !restricted.includes(item.path);
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <aside className={`command-rail ${isCollapsed ? "command-rail--collapsed" : ""}`}>
      <NavLink to="/" className="command-rail__logo" title={isCollapsed ? "Home" : undefined}>
        <Logo size={isCollapsed ? 24 : 32} showText={!isCollapsed} />
      </NavLink>

      {/* Navigation */}
      <nav className="command-rail__nav">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
            title={isCollapsed ? item.label : undefined}
            style={{ '--nav-accent': item.color } as React.CSSProperties}
          >
            <span className="command-rail__icon">{item.icon}</span>
            <span className="command-rail__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer with Account Settings, Logout, and Toggle */}
      <div className="command-rail__footer">
        {/* Only Owner gets "Account Settings" (Gym config) - Members/Trainers get Profile via TopBar or hidden for V1 */}
        {role === 'OWNER' && (
          <NavLink
            to="/settings"
            className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
            title={isCollapsed ? "Account Settings" : undefined}
          >
            <span className="command-rail__icon">{icons.settings}</span>
            <span className="command-rail__label">Account Settings</span>
          </NavLink>
        )}

        {/* Logout Button */}
        <button
          className="command-rail__link command-rail__logout"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <span className="command-rail__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </span>
          <span className="command-rail__label">Logout</span>
        </button>

        {/* Collapse Toggle Button */}
        <button
          className="command-rail__toggle"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="command-rail__toggle-icon">{isCollapsed ? icons.expand : icons.collapse}</span>
          <span className="command-rail__label">{isCollapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>
    </aside>
  )
}

export default CommandRail
