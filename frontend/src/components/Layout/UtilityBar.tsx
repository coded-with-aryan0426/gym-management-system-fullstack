"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { CreateUserModal } from "../index"
import api from "../../services/api"
import type { User } from "../../types/user"
import { useMembers } from '../../contexts/MembersContext'
import { useStaff } from '../../contexts/StaffContext'
import { useNavbar } from '../../contexts/NavbarContext'
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const navigate = useNavigate()
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get navbar configuration based on current route
  const { config } = useNavbar()

  // Get data from contexts
  const { stats: memberStats } = useMembers()
  const { stats: staffStats } = useStaff()

  // Get the appropriate stats based on metric type
  const getMetricValue = (key: string): string | number => {
    switch (config.metricType) {
      case 'members':
        return (memberStats as Record<string, number>)[key] ?? 0
      case 'staff':
        return (staffStats as Record<string, number>)[key] ?? 0
      case 'financial':
        // Placeholder for financial stats - would come from FinancialContext
        const financialPlaceholders: Record<string, string> = {
          todayRevenue: '₹12,450',
          pending: '3',
          monthlyRevenue: '₹2.4L',
        }
        return financialPlaceholders[key] ?? '0'
      case 'sessions':
        // Placeholder for PT sessions stats
        const sessionPlaceholders: Record<string, number> = {
          todaySessions: 8,
          activeSessions: 3,
        }
        return sessionPlaceholders[key] ?? 0
      default:
        return 0
    }
  }

  const [notifications] = useState<Notification[]>([
    { id: 1, type: "member", title: "New Member", message: "John Doe signed up.", time: "2 months ago", read: false },
    {
      id: 2,
      type: "payment",
      title: "Payment Failed",
      message: "Sarah Connor's renewal.",
      time: "7 months ago",
      read: false,
    },
    {
      id: 3,
      type: "class",
      title: "Class Reminder",
      message: "HIIT Burn starts in 15m.",
      time: "2 months ago",
      read: false,
    },
    {
      id: 4,
      type: "staff",
      title: "Staff Alert",
      message: "Trainer John called in sick.",
      time: "2 months ago",
      read: true,
    },
    { id: 5, type: "staff", title: "Low inventory", message: "Protein Bars", time: "2 month ago", read: true },
  ])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      // Search both members and staff
      const [members, staff] = await Promise.all([
        api.searchUsers("CUSTOMER", query).catch(() => []),
        api.searchUsers("TRAINER", query).catch(() => []),
      ])

      const results: SearchResult[] = [
        ...members.map((m: User) => ({ id: m.userId, name: m.fullName, email: m.email, type: "member" as const })),
        ...staff.map((s: User) => ({ id: s.userId, name: s.fullName, email: s.email, type: "staff" as const })),
      ]

      setSearchResults(results.slice(0, 10)) // Limit to 10 results
      setShowSearchResults(true)
    } catch (err) {
      console.error("Search failed:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
            </svg>
          </span>
        )
      case "payment":
        return (
          <span className="notification-icon notification-icon--danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
        )
      case "class":
        return (
          <span className="notification-icon notification-icon--warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        )
      case "staff":
        return (
          <span className="notification-icon notification-icon--info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
        )
      default:
        return null
    }
  }

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
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
      {/* Search */}
      <div className="utility-bar__search-container" ref={searchRef}>
        <form className="utility-bar__search" onSubmit={handleSearchSubmit}>
          <svg
            className="utility-bar__search-icon"
            width="16"
            height="16"
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
            placeholder="Search (Cmd + K)"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          />
          {isSearching && (
            <span className="utility-bar__spinner" />
          )}
        </form>

        {/* Search Results Dropdown */}
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

      {/* Dynamic Stats - Only show if metrics exist for this route */}
      {config.metrics.length > 0 && (
        <div className="utility-bar__stats utility-bar__stats--animated">
          {config.metrics.map((metric) => (
            <div key={metric.key} className="utility-stat">
              <span className="utility-stat__value">
                {metric.prefix || ''}{getMetricValue(metric.key)}
              </span>
              <span className="utility-stat__label">{metric.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="utility-bar__actions">
        <div>
          <button className="utility-bar__create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create
          </button>
        </div>

        <div className="utility-bar__dropdown" ref={notificationRef}>
          <button
            className="utility-bar__icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="utility-bar__badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="utility-bar__dropdown-menu notifications-panel">
              <div className="notifications-panel__header">
                <h3>Notifications</h3>
              </div>
              <div className="notifications-panel__list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? "notification-item--unread" : ""}`}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="notification-item__content">
                      <p className="notification-item__title">
                        <strong>{notification.title}:</strong> {notification.message}
                      </p>
                      <span className="notification-item__time">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button className="utility-bar__avatar" title="Profile" onClick={() => navigate("/settings")}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="User" />
        </button>
      </div>
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </header>
  )
}

export default UtilityBar
