"use client"

import React, { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Activity, 
  CreditCard, 
  BarChart3, 
  Dumbbell, 
  Settings, 
  FileText, 
  UserCog,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  Bell,
  CalendarDays,
  LogOut,
  ShieldCheck,
  CalendarCheck,
  HeartPulse,
  BookOpen,
  Mail,
  Moon,
  Sun,
  Monitor,
  CheckSquare,
  Building2,
  CalendarRange,
  Landmark,
  PieChart,
  Target,
  NotepadText,
  Home,
  Award,
  Flame,
  Handshake,
  Clock,
  ClipboardCheck,
  TrendingUp,
  LineChart,
  Wrench,
  UserPlus,
  CalendarPlus,
  Receipt
} from "lucide-react"
import { Logo } from "../ui/Logo"
import { usePermissionBasedNavigation } from '../../contexts/MultiRoleAuthContext'
import { useMultiRoleAuth } from '../../contexts/MultiRoleAuthContext'
import { useTheme } from '../../contexts/ThemeContext'

import "./CommandRail.css"

interface MultiRoleCommandRailProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

const iconMap: Record<string, any> = {
  // Common / Multiple
  profile: User,
  settings: Settings,
  messages: Mail,
  notifications: Bell,
  tasks: CheckSquare,

  // Owner / Admin Dashboard
  dashboard: Building2,
  "admin-dashboard": Building2,
  "owner-dashboard": Building2,

  // Owner Management
  members: Users,
  "member-management": Users,
  "member-registration": UserPlus,
  "membership-plans": Award,
  trainers: UserCheck,
  "trainer-management": UserCheck,
  "trainer-assignments": Handshake,
  staff: UserCog,
  "staff-management": UserCog,
  "staff-schedules": CalendarDays,
  equipment: Dumbbell,
  "equipment-management": Dumbbell,
  maintenance: Wrench,
  "pt-sessions": Activity,
  "session-management": CalendarRange,
  "my-sessions": HeartPulse,
  "schedule-session": CalendarPlus,
  classes: CalendarRange,
  attendance: ClipboardCheck,

  // Finance & Reporting
  billing: Landmark,
  "financial-management": Landmark,
  payments: CreditCard,
  refunds: Receipt,
  financials: Landmark,
  analytics: PieChart,
  reports: FileText,
  performance: TrendingUp,

  // Trainer
  "trainer-dashboard": Target,
  "my-members": Users,
  "my-classes": CalendarRange,
  "my-schedule": Clock,
  schedule: Clock,
  "progress-notes": NotepadText,
  notes: NotepadText,
  "progress-tracking": LineChart,
  "trainer-progress": LineChart,
  "trainer-profile": User,

  // Member
  "member-dashboard": Home,
  membership: Award,
  progress: Flame,
  bookings: CalendarDays,
  "my-profile": User,
}

const colorMap: Record<string, string> = {
  dashboard: '#f87171', // Red-400
  profile: '#60a5fa', // Blue-400
  membership: '#a78bfa', // Purple-400
  progress: '#34d399', // Emerald-400
  classes: '#fbbf24', // Amber-400
  trainer: '#22d3ee', // Cyan-400
  trainers: '#22d3ee',
  bookings: '#f472b6', // Pink-400
  messages: '#818cf8', // Indigo-400
  notifications: '#fb923c', // Orange-400
  settings: '#94a3b8', // Slate-400
  members: '#60a5fa',
  sessions: '#34d399',
  analytics: '#34d399',
  equipment: '#fbbf24',
  reports: '#f472b6',
  staff: '#60a5fa'
}

const MultiRoleCommandRail: React.FC<MultiRoleCommandRailProps> = ({ 
  isCollapsed = false, 
  onToggle 
}) => {
  const { getNavigationByCategory } = usePermissionBasedNavigation()
  const { user, logout } = useMultiRoleAuth()
  const { themeMode, setThemeMode } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    const navigationCategories = getNavigationByCategory()
  
    const role = (user?.primaryRole || 'MEMBER').toUpperCase();
  
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
  


  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
      const color = colorMap[item.id] || colorMap[item.label.toLowerCase().split(' ').pop() || ''] || 'var(--text-secondary)'
      
      return (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => `command-rail__link ${isActive ? "command-rail__link--active" : ""}`}
          title={isCollapsed ? item.label : undefined}
          style={({ isActive }) => ({ 
            color: isActive ? color : 'var(--text-secondary)',
            '--active-color': color 
          } as React.CSSProperties)}
        >
          <span className="command-rail__icon">
            {(() => {
              const IconComponent = iconMap[item.id] || Settings;
              return (
                <IconComponent
                  size={isActive ? 20 : 18}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? color : 'inherit' }}
                />
              );
            })()}
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
                {item.badge && (
                  <span className="command-rail__badge">{item.badge}</span>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      )
    })
  }

  return (
    <aside className={`command-rail ${isCollapsed ? "command-rail--collapsed" : ""}`}>
      <NavLink to="/" className="command-rail__logo">
        <Logo size={isCollapsed ? 28 : 36} showText={!isCollapsed} />
      </NavLink>

      <nav className="command-rail__nav">
        {Object.entries(navigationCategories).map(([category, items]) => (
          <div key={category} className="command-rail__category">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className="command-rail__category-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="command-rail__category-title">
                    {category}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {renderNavItems(items as any[])}
          </div>
        ))}
      </nav>

      <div className="command-rail__footer">
        <div className="command-rail__user-menu" style={{ position: 'relative' }}>
          <button 
            className={`command-rail__user-trigger ${isUserMenuOpen ? 'active' : ''}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
              <div className="command-rail__user-avatar" style={{ width: '32px', height: '32px' }}>
                <div className="avatar avatar--sm avatar--initials" style={{ 
                  background: 'var(--color-dashboard)', 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(248, 113, 113, 0.25)'
                }}>
                  <span className="avatar__initials">{user?.fullName?.charAt(0) || 'U'}</span>
                </div>
              </div>
            {!isCollapsed && (
              <>
                <div className="command-rail__user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, overflow: 'hidden' }}>
                  <span className="command-rail__user-name" style={{ width: '100%' }}>{user?.fullName || 'User'}</span>
                  <span className="command-rail__user-role">
                    <ShieldCheck size={10} style={{ marginRight: 4 }} />
                    {user?.primaryRole}
                  </span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.5, transform: isUserMenuOpen ? 'rotate(-90deg)' : 'none', transition: 'transform 0.3s' }} />
              </>
            )}
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div 
                className="command-rail__slide-panel"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ 
                  bottom: '100%', 
                  left: isCollapsed ? '54px' : '0', 
                  width: isCollapsed ? '200px' : '100%', 
                  position: 'absolute' 
                }}
              >
                  <div className="slide-panel__header">
                    <div className="slide-panel__header-avatar">
                      <div className="avatar avatar--md avatar--initials" style={{ 
                        background: 'var(--color-dashboard)', 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)'
                      }}>
                        <span className="avatar__initials">{user?.fullName?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    <div className="slide-panel__header-info">
                      <span className="slide-panel__title">{user?.fullName}</span>
                      <span className="slide-panel__subtitle">{user?.email || 'Member Account'}</span>
                      <div className="command-rail__user-role" style={{ marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                        <ShieldCheck size={10} style={{ marginRight: 4 }} />
                        {user?.primaryRole}
                      </div>
                    </div>
                  </div>
                    <div className="slide-panel__content">
                      <button className="slide-panel__item" onClick={() => { setIsUserMenuOpen(false); navigate(getSettingsPath()); }}>
                        <Settings size={14} />
                        <span>Settings</span>
                      </button>

                      <button className="slide-panel__item" onClick={() => { setIsUserMenuOpen(false); navigate(getNotificationsPath()); }}>
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
                  
                  <button className="slide-panel__item text-red" onClick={logout}>
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
  )
}

export default MultiRoleCommandRail
