"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import anime from "animejs"
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
  Wrench
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
  end?: boolean;  // For exact path matching
}

const defaultNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, color: "#EF4444", end: true }, // Red
  { path: "/members", label: "Members", icon: <Users size={20} />, color: "#3B82F6" }, // Blue
  { path: "/trainers", label: "Trainers", icon: <Dumbbell size={20} />, color: "#8B5CF6" }, // Purple
  { path: "/equipment", label: "Equipment", icon: <Wrench size={20} />, color: "#F97316" }, // Orange
  { path: "/classes", label: "Classes", icon: <Calendar size={20} />, color: "#10B981" }, // Emerald
  { path: "/pt-sessions", label: "Sessions", icon: <User size={20} />, color: "#F59E0B" }, // Amber
  { path: "/financials", label: "Finance", icon: <CreditCard size={20} />, color: "#06B6D4" }, // Cyan
  { path: "/reports", label: "Reports", icon: <FileText size={20} />, color: "#EC4899" }, // Pink
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(profileMenuRef, () => setIsSlideUpOpen(false), isSlideUpOpen);

  // Mock Notification Fetch
  useEffect(() => {
    // Simulate fetching notifications
    setNotifications([
      { id: 1, text: "New member signup", time: "2m ago" },
      { id: 2, text: "Trainer capacity alert", time: "1h ago" },
      { id: 3, text: "System update scheduled", time: "1d ago" }
    ]);
    setUnreadCount(3);
  }, []);

  // Filter items based on role
  const itemsToRender = navItems === defaultNavItems ? navItems.filter(item => {
    // 1. Owner and Admin see everything
    if (role === 'OWNER' || role === 'ADMIN') return true;

    // 2. Trainer (Staff) sees Operations but NOT Financials/Reports
    const restricted = ['/financials', '/reports'];
    return !restricted.includes(item.path);
  }) : navItems;

  const filteredNavItems = itemsToRender;

  // Animation refs
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`command-rail ${isCollapsed ? "command-rail--collapsed" : ""}`}>
      <NavLink to="/" className="command-rail__logo" title={isCollapsed ? "Home" : undefined}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%' }}>
          <Logo size={isCollapsed ? 24 : 28} showText={!isCollapsed} />
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="command-rail__nav" ref={navRef}>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
            title={isCollapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`command-rail__icon ${isActive ? 'active-icon' : ''}`}
                  style={{ color: item.color }}
                >{item.icon}</span>
                <span className={`command-rail__label ${isActive ? 'active-label' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: Notifications & User Profile */}
      <div className="command-rail__bottom">
        {/* Notification Bell */}
        <button
          className="command-rail__link command-rail__notification-btn"
          title="Notifications"
          onClick={() => {
            const notifPath = role === 'TRAINER'
              ? '/trainer/notifications'
              : role === 'MEMBER'
                ? '/member/notifications'
                : '/notifications';
            navigate(notifPath);
          }}
        >
          <div className="command-rail__icon">
            <Bell size={24} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
          <span className="command-rail__label">Notifications</span>
        </button>

        {/* User Profile Menu Wrapper */}
        <div className="command-rail__user-menu" ref={profileMenuRef}>
          {/* User Profile Trigger */}
          <button
            className={`command-rail__user-trigger ${isSlideUpOpen ? 'active' : ''}`}
            onClick={() => setIsSlideUpOpen(!isSlideUpOpen)}
            title="User Menu"
          >
            <div className="command-rail__user-avatar">
              <Avatar name={user?.fullName || "User"} size="sm" />
            </div>
            <span className="command-rail__label command-rail__user-name">{user?.fullName || "User"}</span>
            <ChevronRight size={14} className={`command-rail__user-arrow ${isSlideUpOpen ? 'rotated' : ''}`} />
          </button>

          {/* Slide-Up Panel */}
          <div className={`command-rail__slide-panel ${isSlideUpOpen ? 'open' : ''}`}>
            <div className="slide-panel__header">
              <div className="slide-panel__user-info">
                <span className="slide-panel__title">{user?.fullName || "User"}</span>
                <span className="slide-panel__subtitle">Account</span>
              </div>
              <button onClick={() => setIsSlideUpOpen(false)} className="slide-panel__close"><ChevronLeft size={14} /></button>
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
                      {mode === 'system' && <Monitor size={16} />}
                      {mode === 'light' && <Sun size={16} />}
                      {mode === 'dark' && <Moon size={16} />}
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
          </div>
        </div>
      </div>

      {/* Footer with Toggle */}
      <div className="command-rail__footer">
        <button
          className="command-rail__toggle"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}

export default CommandRail
