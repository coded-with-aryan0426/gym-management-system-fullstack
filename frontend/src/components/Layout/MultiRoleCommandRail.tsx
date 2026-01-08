"use client"

import React, { useRef, useEffect } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import anime from "animejs"
import { Logo } from "../ui/Logo"
import { usePermissionBasedNavigation } from '../../contexts/MultiRoleAuthContext';
import type { NavItem } from '../../contexts/MultiRoleAuthContext';
import "./CommandRail.css"

// Icons as inline SVGs for better performance
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
  trainers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  ),
  sessions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  billing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.14 2.26.55 3 1.2 3 2.2 0 1.51-1.15 2.05-2.74 2.05-1.94 0-2.69-1.05-2.76-2.29H5.7c.07 1.96 1.55 3.51 3.51 3.96V21h3v-1.99c1.93-.41 3.48-1.57 3.48-3.66 0-2.36-1.94-3.51-4.89-4.45z" />
    </svg>
  ),
  analytics: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  ),
  equipment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 1.29 2.71 3.43 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 8.43 15.57 17 20.57 12 22 10.57 20.57 9.14 19.14 10.57 17.71 9.14 15.57 11.29 14.14 12.71 15.57 14.14 17 12.57 18.43 14 20.57 17.57 22 19.14 20.57 17.71 19.14 16.29 20.57 14.86z" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.82 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  ),
  collapse: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  expand: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  staff: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.001 2.001 0 0018.03 7h-1.06c-.8 0-1.54.5-1.85 1.26L12.5 16H15v6h5zm-12.5-11c.83 0 1.5-.67 1.5-1.5S8.33 8 7.5 8 6 8.67 6 9.5 6.67 11 7.5 11zm3.5 9.5v-6h2.5l-2.54-7.63A2.001 2.001 0 008.03 5H6.97c-.8 0-1.54.5-1.85 1.26L2.5 14H5v6h6z" />
    </svg>
  ),
  reports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" />
    </svg>
  ),
}

// Map icon names to components
const getIconForPath = (path: string): React.ReactNode => {
  if (path.includes('dashboard')) return icons.dashboard;
  if (path.includes('member')) return icons.members;
  if (path.includes('trainer')) return icons.trainers;
  if (path.includes('staff')) return icons.staff;
  if (path.includes('session')) return icons.sessions;
  if (path.includes('billing')) return icons.billing;
  if (path.includes('analytics')) return icons.analytics;
  if (path.includes('report')) return icons.reports;
  if (path.includes('equipment')) return icons.equipment;
  return icons.settings;
};

interface MultiRoleCommandRailProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

const MultiRoleCommandRail: React.FC<MultiRoleCommandRailProps> = ({ 
  isCollapsed = false, 
  onToggle 
}) => {
  const { getNavigationByCategory } = usePermissionBasedNavigation();
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get navigation filtered by permissions
  const navigationCategories = getNavigationByCategory();

  // Animation refs
  const handleIconHover = (e: React.MouseEvent, label: string) => {
    const target = e.currentTarget.querySelector('svg');
    if (!target) return;

    // Reset
    anime.remove(target);

    // Unique animation based on label
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('dashboard')) {
      anime({ 
        targets: target, 
        scale: [1, 1.2, 1], 
        rotate: [0, 5, -5, 0], 
        duration: 400, 
        easing: 'easeOutElastic(1, .6)' 
      });
    } else if (lowerLabel.includes('member')) {
      anime({ 
        targets: target, 
        translateY: [0, -3, 0], 
        scaleY: [1, 1.1, 1], 
        duration: 400, 
        easing: 'easeOutQuad' 
      });
    } else if (lowerLabel.includes('session') || lowerLabel.includes('schedule')) {
      anime({ 
        targets: target, 
        rotate: '1turn', 
        duration: 800, 
        easing: 'easeInOutBack' 
      });
    } else if (lowerLabel.includes('trainer') || lowerLabel.includes('staff')) {
      anime({ 
        targets: target, 
        rotate: [0, -10, 10, 0], 
        translateX: [0, -2, 2, 0], 
        duration: 500 
      });
    } else if (lowerLabel.includes('billing') || lowerLabel.includes('financial')) {
      anime({ 
        targets: target, 
        rotateY: '180deg', 
        duration: 600, 
        easing: 'easeInOutSine', 
        loop: 2, 
        direction: 'alternate' 
      });
    } else if (lowerLabel.includes('report') || lowerLabel.includes('analytics')) {
      anime({ 
        targets: target, 
        translateX: [0, 3, 0], 
        skewX: [0, -10, 0], 
        duration: 400 
      });
    } else if (lowerLabel.includes('settings')) {
      anime({ 
        targets: target, 
        rotate: '180deg', 
        duration: 800, 
        easing: 'spring(1, 80, 10, 0)' 
      });
    } else {
      // Default pop
      anime({ 
        targets: target, 
        scale: [1, 1.15, 1], 
        duration: 400, 
        easing: 'easeOutQuad' 
      });
    }
  };

  // Render navigation items with categories
  const renderNavigationItems = (items: any[]) => {
    return items.map((item) => (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
        title={isCollapsed ? item.label : undefined}
        style={{
          '--nav-accent': '#dc2626',
          position: 'relative',
          zIndex: 1,
        } as React.CSSProperties}
      >
        {({ isActive }) => (
          <>
            <span
              className={`command-rail__icon ${isActive ? 'active-icon' : ''}`}
              onMouseEnter={(e) => {
                if (isActive) return;
                handleIconHover(e, item.label);
              }}
            >
              {item.icon || getIconForPath(item.path)}
            </span>
            <span className={`command-rail__label ${isActive ? 'active-label' : ''}`}>
              {item.label}
              {item.badge && (
                <span className="command-rail__badge">{item.badge}</span>
              )}
            </span>
          </>
        )}
      </NavLink>
    ));
  };

  return (
    <aside className={`command-rail ${isCollapsed ? "command-rail--collapsed" : ""}`}>
      <NavLink to="/" className="command-rail__logo" title={isCollapsed ? "Home" : undefined}>
        <Logo size={isCollapsed ? 20 : 24} showText={!isCollapsed} />
      </NavLink>

      {/* Navigation with Categories */}
      <nav className="command-rail__nav" ref={navRef}>
        {Object.entries(navigationCategories).map(([category, items]) => (
          <div key={category} className="command-rail__category">
            {!isCollapsed && (
              <div className="command-rail__category-header">
                <span className="command-rail__category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </div>
            )}
            {renderNavigationItems(items)}
          </div>
        ))}
      </nav>

      {/* Footer with Settings and Toggle */}
      <div className="command-rail__footer">
        {/* Settings - only show if user has permissions */}
        {navigationCategories.system && navigationCategories.system.length > 0 && (
          <NavLink
            to="/settings"
            className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="command-rail__icon command-rail__avatar">
              {icons.settings}
            </span>
            <span className="command-rail__label">Settings</span>
          </NavLink>
        )}

        {/* Collapse Toggle Button */}
        <button
          className="command-rail__toggle"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="command-rail__toggle-icon">
            {isCollapsed ? icons.expand : icons.collapse}
          </span>
          <span className="command-rail__label">
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>
    </aside>
  )
}

export default MultiRoleCommandRail
