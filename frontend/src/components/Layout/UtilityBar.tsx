"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, Fragment } from "react"
import { useNavigate } from "react-router-dom"
import { Sun, Moon, Clock, Calendar, Users, UserPlus, TrendingUp, Dumbbell, Zap, LogOut, Settings, User as UserIcon } from "lucide-react"
import api from "../../services/api"
import type { User } from "../../types/user"
import { useMembers } from '../../contexts/MembersContext'
import { useTrainers } from '../../contexts/TrainerContext'
import { useClasses } from '../../contexts/ClassesContext'
import { useNavbar } from '../../contexts/NavbarContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import "./UtilityBar.css"

interface Notification {
  id: number
  type: "member" | "payment" | "class" | "staff"
  title: string
  message: string
  time: string
  read: boolean
}

interface SearchResult {
  id: number
  name: string
  email: string
  type: "member" | "staff"
}

const UtilityBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { theme, toggleTheme } = useTheme()
  const { config } = useNavbar()
  const { user, logout } = useAuth()
  const { stats: memberStats } = useMembers()
  const { stats: staffStats } = useTrainers()
  const { stats: classStats } = useClasses()

  const getMetricValue = (key: string): string | number => {
    switch (config.metricType) {
      case 'members':
        return (memberStats as Record<string, number>)[key] ?? 0
      case 'staff':
        return (staffStats as Record<string, number>)[key] ?? 0
      case 'classes':
        const val = (classStats as unknown as Record<string, string | number>)[key]
        if (key === 'occupancyRate') return `${val}%`
        return val ?? 0
      case 'financial':
        const financialPlaceholders: Record<string, string> = {
          todayRevenue: '₹12,450',
          pending: '3',
          monthlyRevenue: '₹2.4L',
        }
        return financialPlaceholders[key] ?? '0'
      case 'sessions':
        const sessionPlaceholders: Record<string, number> = {
          todaySessions: 8,
          activeSessions: 3,
        }
        return sessionPlaceholders[key] ?? 0
      default:
        return 0
    }
  }

  const getMetricClass = (key: string): string => {
    switch (key) {
      case 'active': return 'utility-metric--active'
      case 'inactive': return 'utility-metric--expired'
      case 'expiringSoon': return 'utility-metric--warning'
      case 'newThisMonth': return 'utility-metric--new'
      default: return ''
    }
  }

  const getActivePercent = (): number => {
    if (config.metricType === 'members') {
      const total = memberStats.total || 0
      const active = memberStats.active || 0
      return total > 0 ? Math.round((active / total) * 100) : 0
    }
    if (config.metricType === 'staff') {
      const total = staffStats.total || 0
      const active = staffStats.active || 0
      return total > 0 ? Math.round((active / total) * 100) : 0
    }
    return 0
  }

  const [notifications] = useState<Notification[]>([
    { id: 1, type: "member", title: "New Member", message: "John Doe signed up.", time: "2 min ago", read: false },
    { id: 2, type: "payment", title: "Payment Failed", message: "Sarah Connor's renewal.", time: "15 min ago", read: false },
    { id: 3, type: "class", title: "Class Reminder", message: "HIIT Burn starts in 15m.", time: "1 hour ago", read: false },
    { id: 4, type: "staff", title: "Staff Alert", message: "Trainer John called in sick.", time: "3 hours ago", read: true },
    { id: 5, type: "staff", title: "Low inventory", message: "Protein Bars running low.", time: "Yesterday", read: true },
  ])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const userRole = user?.role || 'MEMBER';

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      let results: SearchResult[] = [];

      if (userRole === 'TRAINER') {
        const assignedMembers = await api.getTrainerCustomers(user?.id ? Number(user.id) : 0).catch(() => []);
        const lowerQuery = query.toLowerCase();
        const filtered = assignedMembers.filter(m =>
          m.fullName.toLowerCase().includes(lowerQuery) ||
          m.email.toLowerCase().includes(lowerQuery)
        );
        results = filtered.map(m => ({
          id: m.userId,
          name: m.fullName,
          email: m.email,
          type: "member" as const
        }));
      } else if (userRole === 'OWNER' || userRole === 'ADMIN') {
        const [members, staff] = await Promise.all([
          api.searchUsers("CUSTOMER", query).catch(() => []),
          api.searchUsers("TRAINER", query).catch(() => []),
        ])
        results = [
          ...members.map((m: User) => ({ id: m.userId, name: m.fullName, email: m.email, type: "member" as const })),
          ...staff.map((s: User) => ({ id: s.userId, name: s.fullName, email: s.email, type: "staff" as const })),
        ]
      }

      setSearchResults(results.slice(0, 10))
      setShowSearchResults(true)
    } catch (err) {
      console.error("Search failed:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [userRole, user?.id])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const handleResultClick = (result: SearchResult) => {
    setShowSearchResults(false)
    setSearchQuery("")
    if (result.type === "member") {
      navigate(`/members?userId=${result.id}`)
    } else {
      navigate(`/staff?userId=${result.id}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "member":
        return (
          <span className="notification-icon notification-icon--success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
            </svg>
          </span>
        )
      case "payment":
        return (
          <span className="notification-icon notification-icon--danger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
        )
      case "class":
        return (
          <span className="notification-icon notification-icon--warning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        )
      case "staff":
        return (
          <span className="notification-icon notification-icon--info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.querySelector('input')?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="utility-bar">
      <div className="utility-bar__search-container" ref={searchRef}>
        {(userRole === 'ADMIN' || userRole === 'OWNER' || userRole === 'TRAINER') && (
          <form className="utility-bar__search" onSubmit={handleSearchSubmit}>
            <svg
              className="utility-bar__search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="utility-bar__search-input"
              placeholder="Search... ⌘K"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            />
            {isSearching && <span className="utility-bar__spinner" />}
          </form>
        )}

        {showSearchResults && (
          <div className="utility-bar__search-results">
            {searchResults.length === 0 ? (
              <div className="search-results__empty">
                {isSearching ? "Searching..." : `No results for "${searchQuery}"`}
              </div>
            ) : (
              <>
                <div className="search-results__header">
                  Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </div>
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="search-results__item"
                    onClick={() => handleResultClick(result)}
                  >
                    <span className={`search-results__badge search-results__badge--${result.type}`}>
                      {result.type === "member" ? "M" : "S"}
                    </span>
                    <div className="search-results__info">
                      <span className="search-results__name">{result.name}</span>
                      <span className="search-results__email">{result.email}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="utility-bar__actions">

        <div className="utility-bar__dropdown" ref={notificationRef}>
          <button
            className={`utility-bar__icon-btn ${unreadCount > 0 ? 'utility-bar__icon-btn--has-notifications' : ''}`}
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="utility-bar__badge utility-bar__badge--pulse">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="utility-bar__dropdown-menu notifications-panel notifications-panel--premium">
              <div className="notifications-panel__header">
                <div className="notifications-panel__header-content">
                  <h3>Notifications</h3>
                  <span className="notifications-panel__count">{unreadCount} new</span>
                </div>
                <button className="notifications-panel__mark-all">Mark all read</button>
              </div>
              <div className="notifications-panel__list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item notification-item--premium ${!notification.read ? "notification-item--unread" : ""}`}
                  >
                    <div className="notification-item__icon-wrapper">
                      {getNotificationIcon(notification.type)}
                      {!notification.read && <span className="notification-item__unread-dot" />}
                    </div>
                    <div className="notification-item__content">
                      <p className="notification-item__title">
                        <span className="notification-item__category">{notification.title}</span>
                        <span className="notification-item__message">{notification.message}</span>
                      </p>
                      <div className="notification-item__meta">
                        <span className="notification-item__time">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {notification.time}
                        </span>
                        <span className={`notification-item__type notification-item__type--${notification.type}`}>
                          {notification.type}
                        </span>
                      </div>
                    </div>
                    <button className="notification-item__action">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="notifications-panel__footer">
                <button className="notifications-panel__view-all">
                  View All Notifications
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className="utility-bar__theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="theme-toggle__track">
            <Sun size={12} className="theme-toggle__icon theme-toggle__icon--sun" />
            <Moon size={12} className="theme-toggle__icon theme-toggle__icon--moon" />
            <div className={`theme-toggle__thumb ${theme === 'light' ? 'theme-toggle__thumb--light' : ''}`} />
          </div>
        </button>

        <div className="utility-bar__dropdown" ref={profileMenuRef}>
          <button
            className="utility-bar__avatar"
            title="Profile & Settings"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} alt="User" />
          </button>

          {showProfileMenu && (
            <div className="utility-bar__dropdown-menu profile-panel">
              <div className="profile-panel__header">
                <img
                  src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
                  alt="User"
                  className="profile-panel__avatar"
                />
                <div className="profile-panel__user-info">
                  <span className="profile-panel__name">{user?.fullName || "User"}</span>
                  <span className="profile-panel__role">{user?.role || "MEMBER"}</span>
                </div>
              </div>
              <div className="profile-panel__menu">
                <button
                  className="profile-panel__item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (userRole === 'TRAINER') navigate('/trainer/profile');
                    else if (userRole === 'MEMBER') navigate('/member/profile');
                    else navigate('/settings');
                  }}
                >
                  <UserIcon /> Profile
                </button>
                <button
                  className="profile-panel__item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                >
                  <Settings /> Settings
                </button>
                <div className="utility-stat__divider" style={{ width: '100%', margin: '4px 0' }} />
                <button
                  className="profile-panel__item profile-panel__item--danger"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                >
                  <LogOut /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default UtilityBar
