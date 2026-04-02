"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
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
  Monitor,
  Wrench,
  ShieldCheck,
  Clock,
  Shield,
  Crown,
  CircleDot,
  Mail,
  MessageSquare,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Activity,
  CheckSquare,
  BadgeCheck,
  UserCheck,
  UserCog,
  BookOpen,
  CalendarDays,
  HeartPulse,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  BarChart3
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { useClickOutside } from "../../hooks"
import { superAdminApi } from "../../services/superAdminApi"
import { Logo } from "../ui/Logo"
import Avatar from "../ui/Avatar"

import "./CommandRail.css"
import { useFeatureContext } from "../../contexts/FeatureContext"
import { prefetchOnHover, cancelPrefetch } from "../../services/prefetchService"

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  key?: string;
  color?: string;
  id?: string;
  end?: boolean;
}

const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  members: Users,
  trainers: UserCheck,
  staff: UserCog,
  equipment: Dumbbell,
  classes: BookOpen,
  financials: CreditCard,
  attendance: CheckSquare,
  tasks: CheckSquare,
  profile: User,
  "my-membership": Crown,
  "my-progress": Activity,
  "my-attendance": CalendarCheck,
  "available-classes": Dumbbell,
  "my-trainer": UserCheck,
  "my-bookings": CalendarDays,
  notifications: MessageSquare,
  "my-members": Users,
  "member-attendance": ClipboardCheck,
  "my-classes": Dumbbell,
  "my-schedule": CalendarDays,
  "progress-notes": ClipboardList,
  reports: BarChart3
};

const defaultNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", id: "dashboard", key: "dashboard", color: "#f87171", end: true },
  { path: "/members", label: "Members", id: "members", key: "members", color: "#60a5fa" },
  { path: "/trainers", label: "Trainers", id: "trainers", key: "trainers", color: "#22d3ee" },
  { path: "/staff", label: "Staff", id: "staff", key: "staff", color: "#14b8a6" },
  { path: "/equipment", label: "Equipment", id: "equipment", key: "equipment", color: "#fbbf24" },
  { path: "/classes", label: "Classes", id: "classes", key: "classes", color: "#34d399" },
  { path: "/financials", label: "Finance", id: "billing", key: "financials", color: "#a78bfa" },
  { path: "/attendance", label: "Attendance", id: "attendance", key: "attendance", color: "#f472b6" },
  { path: "/tasks", label: "Tasks", id: "tasks", key: "tasks", color: "#38bdf8" },
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
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const role = isSuperAdmin ? 'SUPER ADMIN' : (user?.role || 'MEMBER').toUpperCase();
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [logoTooltipPos, setLogoTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [avatarTooltipPos, setAvatarTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  useClickOutside(profileMenuRef, () => setIsSlideUpOpen(false), isSlideUpOpen);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getSettingsPath = () => {
    if (isSuperAdmin) return '/superadmin';
    if (role === 'TRAINER') return '/trainer/settings';
    if (role === 'MEMBER' || role === 'CUSTOMER') return '/member/settings';
    return '/settings';
  };

  const getNotificationsPath = () => {
    if (isSuperAdmin) return '/superadmin/security';
    if (role === 'TRAINER') return '/trainer/notifications';
    if (role === 'MEMBER' || role === 'CUSTOMER') return '/member/notifications';
    return '/notifications';
  };

  const getRoleBadgeClass = () => {
    if (isSuperAdmin) return 'role-badge--owner';
    if (role === 'OWNER') return 'role-badge--owner';
    if (role === 'ADMIN') return 'role-badge--admin';
    if (role === 'TRAINER') return 'role-badge--trainer';
    return 'role-badge--member';
  };

  const getRoleIcon = () => {
    if (isSuperAdmin) return <Crown size={10} />;
    if (role === 'OWNER') return <Crown size={10} />;
    if (role === 'ADMIN') return <Shield size={10} />;
    if (role === 'TRAINER') return <Dumbbell size={10} />;
    return <User size={10} />;
  };



  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const displayName = isSuperAdmin ? 'Creator' : (user?.fullName || 'User');
  const displayEmail = isSuperAdmin ? 'creator@titan.dev' : (user?.email || '—');

  // Chat feature is permanently disabled
  // const { localFeatures } = useFeatureContext();
  // const isChatEnabled = localFeatures['chat-enabled'] !== false;

  const itemsToRender = navItems === defaultNavItems ? navItems.filter(item => {
    // Filter for role-based access
    if (role === 'OWNER' || role === 'ADMIN') return true;
    const restricted = ['/financials', '/reports'];
    return !restricted.includes(item.path);
  }) : navItems;

  const handleLogout = () => {
    if (isSuperAdmin) {
      superAdminApi.logout();
      navigate('/');
    } else {
      logout();
    }
  };

  // Prefetch handler for link hover - Stage 2 optimization
  const handleLinkHover = useCallback((path: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCollapsed) {
      setHoveredLink(path);
      // Calculate tooltip position - position it to the right of the icon
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12
      });
    }
    // Prefetch data for the route being hovered
    prefetchOnHover(path);
  }, [isCollapsed]);

  const handleLinkLeave = useCallback(() => {
    setHoveredLink(null);
    setTooltipPos(null);
    cancelPrefetch();
  }, []);

  const handleLogoHover = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCollapsed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setLogoTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12
      });
    }
  }, [isCollapsed]);

  const handleLogoLeave = useCallback(() => {
    setLogoTooltipPos(null);
  }, []);

  const handleAvatarHover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isCollapsed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setAvatarTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12
      });
    }
  }, [isCollapsed]);

  const handleAvatarLeave = useCallback(() => {
    setAvatarTooltipPos(null);
  }, []);

  return (
    <aside className={`command-rail ${isCollapsed ? "command-rail--collapsed" : ""}`}>
      <NavLink
        ref={logoRef}
        to="/"
        className="command-rail__logo"
        onMouseEnter={handleLogoHover}
        onMouseLeave={handleLogoLeave}
      >
        <Logo size={isCollapsed ? 28 : 36} showText={!isCollapsed} />
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
                style={{ color: isActive ? item.color : undefined } as React.CSSProperties}
                onMouseEnter={(e) => handleLinkHover(item.path, e as React.MouseEvent<HTMLAnchorElement>)}
                onMouseLeave={handleLinkLeave}
              >
                <span className="command-rail__icon">
                  {item.key ? (
                    (() => {
                      const IconComponent = iconMap[item.key];
                      return IconComponent ? (
                        <IconComponent
                          size={isActive ? 20 : 18}
                          className={isActive ? "opacity-100" : "opacity-80"}
                          style={{ color: item.color }}
                        />
                      ) : (
                        <div />
                      );
                    })()
                  ) : item.icon ? (
                    React.cloneElement(item.icon as React.ReactElement<any>, {
                      size: isActive ? 20 : 18,
                      strokeWidth: isActive ? 2.4 : 2,
                    })
                  ) : null}
                </span>
                {!isCollapsed && (
                  <span className="command-rail__label">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {isCollapsed && hoveredLink && tooltipPos && (
        <div
          ref={tooltipRef}
          className="command-rail__tooltip"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            color: itemsToRender.find(item => item.path === hoveredLink)?.color
          }}
        >
          {itemsToRender.find(item => item.path === hoveredLink)?.label}
        </div>
      )}

      {isCollapsed && logoTooltipPos && (
        <div
          className="command-rail__tooltip"
          style={{
            top: `${logoTooltipPos.top}px`,
            left: `${logoTooltipPos.left}px`,
            color: "#64b5f6"
          }}
        >
          Home
        </div>
      )}

      {isCollapsed && avatarTooltipPos && (
        <div
          className="command-rail__tooltip"
          style={{
            top: `${avatarTooltipPos.top}px`,
            left: `${avatarTooltipPos.left}px`,
            color: "#ec407a"
          }}
        >
          Profile
        </div>
      )}

      <div className="command-rail__footer">
        <div className="command-rail__user-menu" ref={profileMenuRef}>
          <button
            ref={avatarButtonRef}
            className={`command-rail__user-trigger ${isSlideUpOpen ? 'active' : ''}`}
            onClick={() => setIsSlideUpOpen(!isSlideUpOpen)}
            onMouseEnter={handleAvatarHover}
            onMouseLeave={handleAvatarLeave}
          >
            <div className="command-rail__user-avatar">
              <Avatar name={displayName} size="sm" />
            </div>
            {!isCollapsed && (
              <>
                <div className="command-rail__user-info">
                  <span className="command-rail__user-name">{displayName}</span>
                  <span className="command-rail__user-role">
                    <ShieldCheck size={10} />
                    {role}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className={`command-rail__chevron ${isSlideUpOpen ? 'command-rail__chevron--open' : ''}`}
                />
              </>
            )}
          </button>

          <AnimatePresence>
            {isSlideUpOpen && (
              <motion.div
                className={`command-rail__slide-panel ${isCollapsed ? 'command-rail__slide-panel--collapsed' : ''}`}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Premium Header */}
                <div className="slide-panel__header-premium">
                  <div className="slide-panel__header-bg" />
                  <div className="slide-panel__header-content">
                    <div className="slide-panel__avatar-wrapper">
                      <Avatar name={displayName} size="lg" />
                      <span className="slide-panel__status-dot" />
                    </div>
                    <div className="slide-panel__header-info">
                      <span className="slide-panel__greeting">
                        <Sparkles size={11} />
                        {getGreeting()}
                      </span>
                      <span className="slide-panel__title">{displayName}</span>
                      <span className="slide-panel__email">
                        <Mail size={11} />
                        {displayEmail}
                      </span>
                      <span className={`slide-panel__role-badge ${getRoleBadgeClass()}`}>
                        {getRoleIcon()}
                        {role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live clock strip */}
                <div className="slide-panel__clock-strip">
                  <div className="slide-panel__clock-item">
                    <Clock size={12} />
                    <span>{formatTime()}</span>
                  </div>
                  <div className="slide-panel__clock-divider" />
                  <div className="slide-panel__clock-item">
                    <Calendar size={12} />
                    <span>{formatDate()}</span>
                  </div>
                  <div className="slide-panel__clock-divider" />
                  <div className="slide-panel__clock-item slide-panel__clock-status">
                    <CircleDot size={10} />
                    <span>Online</span>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div className="slide-panel__section">
                  <span className="slide-panel__section-label">Quick Navigation</span>
                  <div className="slide-panel__nav-list">
                    <button className="slide-panel__nav-item" onClick={() => { setIsSlideUpOpen(false); navigate(getSettingsPath()); }}>
                      <div className="slide-panel__nav-icon slide-panel__nav-icon--settings">
                        <Settings size={15} />
                      </div>
                      <div className="slide-panel__nav-text">
                        <span className="slide-panel__nav-title">Settings</span>
                        <span className="slide-panel__nav-desc">Preferences & configuration</span>
                      </div>
                      <ChevronRight size={14} className="slide-panel__nav-arrow" />
                    </button>
                    <button className="slide-panel__nav-item" onClick={() => { setIsSlideUpOpen(false); navigate(getNotificationsPath()); }}>
                      <div className="slide-panel__nav-icon slide-panel__nav-icon--notifications">
                        <Bell size={15} />
                      </div>
                      <div className="slide-panel__nav-text">
                        <span className="slide-panel__nav-title">Notifications</span>
                        <span className="slide-panel__nav-desc">Alerts & updates</span>
                      </div>
                      <ChevronRight size={14} className="slide-panel__nav-arrow" />
                    </button>
                    <button className="slide-panel__nav-item" onClick={() => { setIsSlideUpOpen(false); navigate('/help'); }}>
                      <div className="slide-panel__nav-icon slide-panel__nav-icon--help">
                        <HelpCircle size={15} />
                      </div>
                      <div className="slide-panel__nav-text">
                        <span className="slide-panel__nav-title">Help & Support</span>
                        <span className="slide-panel__nav-desc">FAQs & contact</span>
                      </div>
                      <ChevronRight size={14} className="slide-panel__nav-arrow" />
                    </button>
                  </div>
                </div>

                {/* Appearance */}
                <div className="slide-panel__section">
                  <span className="slide-panel__section-label">Appearance</span>
                  <div className="theme-switcher">
                    <button
                      className={`theme-switcher__btn ${themeMode === 'light' ? 'theme-switcher__btn--active' : ''}`}
                      onClick={() => setThemeMode('light')}
                    >
                      <Sun size={14} />
                      <span className="theme-switcher__label">Light</span>
                    </button>
                    <button
                      className={`theme-switcher__btn ${themeMode === 'dark' ? 'theme-switcher__btn--active' : ''}`}
                      onClick={() => setThemeMode('dark')}
                    >
                      <Moon size={14} />
                      <span className="theme-switcher__label">Dark</span>
                    </button>
                    <button
                      className={`theme-switcher__btn ${themeMode === 'system' ? 'theme-switcher__btn--active' : ''}`}
                      onClick={() => setThemeMode('system')}
                    >
                      <Monitor size={14} />
                      <span className="theme-switcher__label">Auto</span>
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <div className="slide-panel__footer-actions">
                  <button className="slide-panel__logout-btn" onClick={handleLogout}>
                    <LogOut size={15} />
                    <span>Sign Out</span>
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
