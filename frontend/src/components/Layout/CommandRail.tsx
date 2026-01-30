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
import { Logo } from "../ui/Logo"
import Avatar from "../ui/Avatar"
import "./CommandRail.css"

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  id?: string;
  end?: boolean;
}

const defaultNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", id: "dashboard", icon: <LayoutDashboard size={18} />, color: "#f87171", end: true },
  { path: "/members", label: "Members", id: "members", icon: <Users size={18} />, color: "#60a5fa" },
  { path: "/trainers", label: "Trainers", id: "trainers", icon: <Dumbbell size={18} />, color: "#22d3ee" },
  { path: "/equipment", label: "Equipment", id: "equipment", icon: <Wrench size={18} />, color: "#fbbf24" },
  { path: "/classes", label: "Classes", id: "classes", icon: <Calendar size={18} />, color: "#34d399" },
  { path: "/pt-sessions", label: "Sessions", id: "sessions", icon: <User size={18} />, color: "#f472b6" },
  { path: "/financials", label: "Finance", id: "billing", icon: <CreditCard size={18} />, color: "#a78bfa" },
  { path: "/reports", label: "Reports", id: "reports", icon: <FileText size={18} />, color: "#f472b6" },
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
    const role = (user?.role || 'MEMBER').toUpperCase();
    const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
    const location = useLocation();
  
    const profileMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(profileMenuRef, () => setIsSlideUpOpen(false), isSlideUpOpen);
  
    const getSettingsPath = () => {
      if (role === 'TRAINER') return '/trainer/settings';
      if (role === 'MEMBER' || role === 'CUSTOMER') return '/member/settings';
      return '/settings';
    };
  
    const getNotificationsPath = () => {
      if (role === 'TRAINER') return '/trainer/notifications';
      if (role === 'MEMBER' || role === 'CUSTOMER') return '/member/notifications';
      return '/notifications';
    };

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
        <Logo size={isCollapsed ? 28 : 32} showText={!isCollapsed} />
      </NavLink>

      <nav className="command-rail__nav">
        <div className="command-rail__category">
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
                    size: isActive ? 20 : 18,
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
        </div>
      </nav>

      <div className="command-rail__footer">
        <div className="command-rail__user-menu" ref={profileMenuRef} style={{ position: 'relative' }}>
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
                  <span className="command-rail__user-role">
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
                className="command-rail__slide-panel"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ 
                    bottom: '100%', 
                    left: '0', 
                    width: '220px', 
                    position: 'absolute' 
                  }}
                >
                  <div className="slide-panel__header">
                    <div className="slide-panel__header-avatar">
                      <Avatar name={user?.fullName || "User"} size="md" />
                    </div>
                    <div className="slide-panel__header-info">
                      <span className="slide-panel__title">{user?.fullName || "User"}</span>
                      <span className="slide-panel__subtitle">{user?.email || "Account Settings"}</span>
                    </div>
                  </div>
                    <div className="slide-panel__content">
                      <button className="slide-panel__item" onClick={() => { setIsSlideUpOpen(false); navigate(getSettingsPath()); }}>
                        <Settings size={14} />
                        <span>Settings</span>
                      </button>

                      <button className="slide-panel__item" onClick={() => { setIsSlideUpOpen(false); navigate(getNotificationsPath()); }}>
                        <Bell size={14} />
                        <span>Notifications</span>
                      </button>
                    
                    <div className="slide-panel__divider" />
                  
                  <div className="theme-switcher">
                    <button 
                      className={`theme-switcher__btn ${themeMode === 'light' ? 'theme-switcher__btn--active' : ''}`}
                      onClick={() => setThemeMode('light')}
                      title="Light Mode"
                    >
                      <Sun size={14} />
                    </button>
                    <button 
                      className={`theme-switcher__btn ${themeMode === 'dark' ? 'theme-switcher__btn--active' : ''}`}
                      onClick={() => setThemeMode('dark')}
                      title="Dark Mode"
                    >
                      <Moon size={14} />
                    </button>
                    <button 
                      className={`theme-switcher__btn ${themeMode === 'system' ? 'theme-switcher__btn--active' : ''}`}
                      onClick={() => setThemeMode('system')}
                      title="System Theme"
                    >
                      <Monitor size={14} />
                    </button>
                  </div>

                  <div className="slide-panel__divider" />
                  
                  <button className="slide-panel__item text-red" onClick={handleLogout}>
                    <LogOut size={14} />
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
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!isCollapsed && <span className="command-rail__label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

export default CommandRail
