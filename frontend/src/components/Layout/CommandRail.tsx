"use client"

import React, { useRef, useState } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  User,
  Bell,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  Monitor,
  Wrench,
  ShieldCheck
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { useClickOutside } from "../../hooks"
import type { ThemeMode } from "../../contexts/ThemeContext"
import { Logo } from "../ui/Logo"
import Avatar from "../ui/Avatar"
import "./CommandRail.css"

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  end?: boolean;
}

const defaultNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, color: "#f87171", end: true },
  { path: "/members", label: "Members", icon: <Users size={20} />, color: "#60a5fa" },
  { path: "/trainers", label: "Trainers", icon: <Dumbbell size={20} />, color: "#22d3ee" },
  { path: "/equipment", label: "Equipment", icon: <Wrench size={20} />, color: "#fbbf24" },
  { path: "/classes", label: "Classes", icon: <Calendar size={20} />, color: "#34d399" },
  { path: "/pt-sessions", label: "Sessions", icon: <User size={20} />, color: "#f472b6" },
  { path: "/financials", label: "Finance", icon: <CreditCard size={20} />, color: "#a78bfa" },
  { path: "/reports", label: "Reports", icon: <FileText size={20} />, color: "#f472b6" },
];

interface CommandRailProps {
  isCollapsed?: boolean
  onToggle?: () => void
  navItems?: NavItem[]
}

const CommandRail: React.FC<CommandRailProps> = ({ isCollapsed = false, onToggle, navItems = defaultNavItems }) => {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const role = user?.role || 'MEMBER';
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const location = useLocation();

  const profileMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(profileMenuRef, () => setIsSlideUpOpen(false), isSlideUpOpen);

  const itemsToRender = navItems === defaultNavItems ? navItems.filter(item => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    const restricted = ['/financials', '/reports'];
    return !restricted.includes(item.path);
  }) : navItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`command-rail ${isCollapsed ? "command-rail--collapsed" : ""}`}>
      <NavLink to="/" className="command-rail__logo">
        <Logo size={isCollapsed ? 32 : 36} showText={!isCollapsed} />
      </NavLink>

      <nav className="command-rail__nav">
        {itemsToRender.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
              title={isCollapsed ? item.label : undefined}
              style={{ color: isActive ? item.color : 'var(--text-secondary)' } as React.CSSProperties}
            >
              <span className="command-rail__icon">
                {item.icon && React.cloneElement(item.icon as React.ReactElement, { 
                  size: isActive ? 22 : 20,
                  strokeWidth: isActive ? 2.5 : 2
                })}
              </span>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    className="command-rail__label"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      <div className="command-rail__footer">
        <div className="command-rail__user-menu" ref={profileMenuRef}>
          <button
            className={`command-rail__user-trigger ${isSlideUpOpen ? 'active' : ''}`}
            onClick={() => setIsSlideUpOpen(!isSlideUpOpen)}
          >
            <div className="command-rail__user-avatar">
              <Avatar name={user?.fullName || "User"} size="sm" />
            </div>
            {!isCollapsed && (
              <>
                <div className="command-rail__user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, overflow: 'hidden' }}>
                  <span className="command-rail__user-name" style={{ width: '100%', textAlign: 'left' }}>{user?.fullName || "User"}</span>
                  <span className="command-rail__user-role" style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <ShieldCheck size={10} style={{ marginRight: 4 }} />
                    {role}
                  </span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.5, transform: isSlideUpOpen ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s' }} />
              </>
            )}
          </button>

          <AnimatePresence>
            {isSlideUpOpen && (
              <motion.div 
                className={`command-rail__slide-panel ${isSlideUpOpen ? 'open' : ''}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: -12, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ bottom: '100%', left: isCollapsed ? '72px' : '12px', width: '220px', position: 'absolute' }}
              >
                <div className="slide-panel__header">
                  <div className="slide-panel__user-info">
                    <span className="slide-panel__title">{user?.fullName || "User"}</span>
                    <span className="slide-panel__subtitle">Account</span>
                  </div>
                </div>
                <div className="slide-panel__content">
                  <button className="slide-panel__item" onClick={() => navigate('/settings')}>
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="slide-panel__item" onClick={() => navigate('/profile')}>
                    <UserCircle size={16} />
                    <span>Profile</span>
                  </button>
                  <div className="slide-panel__divider" />
                  <div className="slide-panel__theme-section">
                    <span className="slide-panel__theme-label">Theme</span>
                    <div className="slide-panel__theme-options">
                      {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                        <button
                          key={mode}
                          className={`slide-panel__theme-btn slide-panel__theme-btn--${mode} ${themeMode === mode ? 'active' : ''}`}
                          onClick={() => setThemeMode(mode)}
                        >
                          {mode === 'system' && <Monitor size={14} />}
                          {mode === 'light' && <Sun size={14} />}
                          {mode === 'dark' && <Moon size={14} />}
                          <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="slide-panel__divider" />
                  <button className="slide-panel__item text-red" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          className="command-rail__toggle"
          onClick={onToggle}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <span className="command-rail__toggle-icon">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </span>
          {!isCollapsed && <span className="command-rail__label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default CommandRail
