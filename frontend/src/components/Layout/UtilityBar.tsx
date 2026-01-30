"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, Fragment } from "react"
import { useNavigate } from "react-router-dom"
import { Sun, Moon, Clock, Calendar, Users, UserPlus, TrendingUp, Dumbbell, Zap, LogOut, Settings, User as UserIcon, Bell } from "lucide-react"
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
  
    const getSettingsPath = () => {
      if (userRole === 'TRAINER') return '/trainer/settings';
      if (userRole === 'MEMBER' || userRole === 'CUSTOMER') return '/member/settings';
      return '/settings';
    };
  
    const getNotificationsPath = () => {
      if (userRole === 'TRAINER') return '/trainer/notifications';
      if (userRole === 'MEMBER' || userRole === 'CUSTOMER') return '/member/notifications';
      return '/notifications';
    };
  
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
                        const role = user?.role || 'MEMBER';
                        if (role === 'TRAINER') navigate('/trainer/profile');
                        else if (role === 'MEMBER' || role === 'CUSTOMER') navigate('/member/profile');
                        else navigate('/dashboard/profile'); // Default fallback
                      }}
                    >
                      <UserIcon size={16} /> Profile
                    </button>
                    <div className="utility-stat__divider" style={{ width: '100%', margin: '4px 0' }} />
                    <button
                      className="profile-panel__item profile-panel__item--danger"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} /> Log Out
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
