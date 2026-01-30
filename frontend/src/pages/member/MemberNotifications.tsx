"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  CreditCard,
  Calendar,
  User,
  Trophy,
  CheckCheck,
  Trash2,
  Settings,
  ArrowRight,
  Search,
  Inbox,
  Star,
  Archive,
  AlertTriangle,
  Gift
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import "./MemberNotifications.css"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  priority: string
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  createdAt: string
  link?: string
  actionData?: string
}

type FilterType = "all" | "unread" | "starred" | "archived" | "membership" | "booking" | "achievement"

const MemberNotifications: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const userId = user?.id || user?.userId

  const fetchNotifications = async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/notifications/user/${userId}?filter=${filter === 'archived' ? 'archived' : 'all'}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId, filter])

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      }
    } catch (error) {
      toast.error("Failed to update notification")
    }
  }

  const toggleStar = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/star`, { method: "PUT" })
      if (response.ok) {
        const updated = await response.json()
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isStarred: updated.isStarred } : n))
        toast.success(updated.isStarred ? "Starred" : "Unstarred")
      }
    } catch (error) {
      toast.error("Action failed")
    }
  }

  const archiveNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/archive`, { method: "PUT" })
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        toast.success("Archived")
      }
    } catch (error) {
      toast.error("Failed to archive")
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        toast.success("Deleted")
      }
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/notifications/user/${userId}/read-all`, { method: "PUT" })
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast.success("All marked as read")
      }
    } catch (error) {
      toast.error("Failed to update all")
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getTypeInfo = (type: string, priority: string) => {
    if (priority === 'urgent' || priority === 'high') {
       return { icon: AlertTriangle, color: "#FF3B30", bg: "rgba(255, 59, 48, 0.12)" }
    }
    switch (type?.toUpperCase()) {
      case "MEMBERSHIP":
        return { icon: CreditCard, color: "#007AFF", bg: "rgba(0, 122, 255, 0.12)" }
      case "BOOKING":
      case "SCHEDULE":
        return { icon: Calendar, color: "#34C759", bg: "rgba(52, 199, 89, 0.12)" }
      case "TRAINER":
        return { icon: User, color: "#AF52DE", bg: "rgba(175, 82, 222, 0.12)" }
      case "ACHIEVEMENT":
        return { icon: Trophy, color: "#FF9500", bg: "rgba(255, 149, 0, 0.12)" }
      case "PROMO":
      case "ANNOUNCEMENT":
        return { icon: Gift, color: "#FF2D55", bg: "rgba(255, 45, 85, 0.12)" }
      default:
        return { icon: Bell, color: "#8E8E93", bg: "rgba(142, 142, 147, 0.12)" }
    }
  }

  const filteredAndSearched = useMemo(() => {
    return notifications
      .filter((n) => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.message.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false

        if (filter === "all") return !n.isArchived
        if (filter === "unread") return !n.isRead && !n.isArchived
        if (filter === "starred") return n.isStarred && !n.isArchived
        if (filter === "archived") return n.isArchived
        if (filter === "membership") return n.type === "MEMBERSHIP"
        if (filter === "booking") return n.type === "BOOKING" || n.type === "SCHEDULE"
        if (filter === "achievement") return n.type === "ACHIEVEMENT"
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, filter, searchQuery])

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: []
    }

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    filteredAndSearched.forEach(n => {
      const d = new Date(n.createdAt).toDateString()
      if (d === today) groups.Today.push(n)
      else if (d === yesterday) groups.Yesterday.push(n)
      else groups.Earlier.push(n)
    })

    return groups
  }, [filteredAndSearched])

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length
  const starredCount = notifications.filter(n => n.isStarred).length

  return (
    <div className="mn-page">
      <header className="mn-header">
        <div className="mn-header__left">
          <div className="mn-header__title-group">
            <div className="mn-header__title-wrapper">
              <h1 className="mn-header__title">Notifications</h1>
              {unreadCount > 0 && <span className="mn-unread-pill">{unreadCount}</span>}
            </div>
            
            <div className="mn-header-stats">
              <div className="mn-h-stat">
                <span className="value">{notifications.length}</span>
                <span className="label">Total</span>
              </div>
              <div className="mn-h-stat">
                <span className="value">{unreadCount}</span>
                <span className="label">Unread</span>
              </div>
              <div className="mn-h-stat">
                <span className="value">{starredCount}</span>
                <span className="label">Starred</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mn-header__actions">
          <div className="mn-search-bar">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="mn-action-btn mn-action-btn--primary" onClick={markAllAsRead}>
            <CheckCheck size={16} />
            <span>Mark all read</span>
          </button>
          <button className="mn-icon-btn" onClick={() => navigate("/member/settings")}>
            <Settings size={16} />
          </button>
        </div>
      </header>

      <div className="mn-layout">
        <aside className="mn-sidebar">
          <nav className="mn-nav">
            <button 
              className={`mn-nav-item ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <Inbox size={16} />
              <span>Inbox</span>
              {unreadCount > 0 && <span className="mn-nav-count">{unreadCount}</span>}
            </button>
            <button 
              className={`mn-nav-item ${filter === 'starred' ? 'active' : ''}`}
              onClick={() => setFilter('starred')}
            >
              <Star size={16} />
              <span>Starred</span>
            </button>
            <button 
              className={`mn-nav-item ${filter === 'archived' ? 'active' : ''}`}
              onClick={() => setFilter('archived')}
            >
              <Archive size={16} />
              <span>Archived</span>
            </button>
          </nav>

          <div className="mn-sidebar-divider" />

          <div className="mn-sidebar-section">
            <span className="mn-section-label">Categories</span>
            <div className="mn-category-list">
              <button onClick={() => setFilter('membership')} className={filter === 'membership' ? 'active' : ''}>
                <div className="mn-cat-icon blue"><CreditCard size={14} /></div>
                <span>Membership</span>
              </button>
              <button onClick={() => setFilter('booking')} className={filter === 'booking' ? 'active' : ''}>
                <div className="mn-cat-icon green"><Calendar size={14} /></div>
                <span>Classes</span>
              </button>
              <button onClick={() => setFilter('achievement')} className={filter === 'achievement' ? 'active' : ''}>
                <div className="mn-cat-icon orange"><Trophy size={14} /></div>
                <span>Goals</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="mn-main">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="mn-loading">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="mn-skeleton" />
                ))}
              </div>
            ) : filteredAndSearched.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mn-empty"
              >
                <div className="mn-empty-circle">
                  <Bell size={32} />
                </div>
                <h3>Clear for now</h3>
                <p>No notifications found matching your filters.</p>
                {filter !== 'all' && (
                  <button onClick={() => setFilter('all')} className="mn-clear-filter">
                    Back to Inbox
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="mn-scroll-area">
                {Object.entries(groupedNotifications).map(([group, items]) => (
                  items.length > 0 && (
                    <div key={group} className="mn-group">
                      <h3 className="mn-group-label">{group}</h3>
                      <div className="mn-items-stack">
                        {items.map((notif) => {
                          const typeInfo = getTypeInfo(notif.type, notif.priority)
                          const Icon = typeInfo.icon

                          return (
                            <motion.div
                              key={notif.id}
                              layout
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`mn-card ${!notif.isRead ? 'unread' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif.id)
                                if (notif.link) navigate(notif.link)
                              }}
                            >
                              <div className="mn-card-main">
                                <div className="mn-card-icon-box" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                                  <Icon size={18} />
                                </div>
                                <div className="mn-card-content">
                                  <div className="mn-card-top">
                                    <span className="mn-card-title">{notif.title}</span>
                                    <span className="mn-card-time">{formatDate(notif.createdAt)}</span>
                                  </div>
                                  <p className="mn-card-msg">{notif.message}</p>
                                  {notif.link && (
                                    <div className="mn-card-link" style={{ color: typeInfo.color }}>
                                      <span>View Details</span>
                                      <ArrowRight size={12} />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mn-card-actions">
                                <button 
                                  className={`mn-card-action-btn star ${notif.isStarred ? 'active' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); toggleStar(notif.id); }}
                                >
                                  <Star size={14} fill={notif.isStarred ? "currentColor" : "none"} />
                                </button>
                                <button 
                                  className="mn-card-action-btn archive"
                                  onClick={(e) => { e.stopPropagation(); archiveNotification(notif.id); }}
                                >
                                  <Archive size={14} />
                                </button>
                                <button 
                                  className="mn-card-action-btn delete"
                                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default MemberNotifications
