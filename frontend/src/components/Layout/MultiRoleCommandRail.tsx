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
  Monitor
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
  dashboard: LayoutDashboard,
  members: Users,
  trainers: UserCheck,
  sessions: Activity,
  billing: CreditCard,
  analytics: BarChart3,
  equipment: Dumbbell,
  settings: Settings,
  reports: FileText,
  staff: UserCog,
  profile: User,
  messages: Mail,
  notifications: Bell,
  classes: BookOpen,
  bookings: CalendarCheck,
  progress: HeartPulse,
  membership: CreditCard
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

  const getIcon = (id: string, color: string, isActive: boolean) => {
    const IconComponent = iconMap[id] || Settings
    return (
      <IconComponent 
        size={isActive ? 20 : 18} 
        strokeWidth={isActive ? 2.5 : 2}
        style={{ color: isActive ? color : 'inherit' }} 
      />
    )
  }

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
            {getIcon(item.id, color, isActive)}
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
        <Logo size={isCollapsed ? 28 : 32} showText={!isCollapsed} />
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
            <div className="command-rail__user-avatar">
              <div className="avatar avatar--sm avatar--initials" style={{ 
                background: 'var(--color-dashboard)', 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
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
                  <span className="slide-panel__title">{user?.fullName}</span>
                  <span className="slide-panel__subtitle">{user?.email || 'Member Account'}</span>
                </div>
                  <div className="slide-panel__content">
                    <button className="slide-panel__item" onClick={() => { setIsUserMenuOpen(false); navigate('/member/settings'); }}>
                      <Settings size={14} />
                      <span>Settings</span>
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
