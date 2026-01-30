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
  ChevronRight,
  Gift,
  Clock,
  AlertTriangle,
  Star,
  Archive,
  MoreVertical,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Inbox
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Badge } from "../../components"
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
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
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

  return (
    <div className="mn-page">
      <header className="mn-header">
        <div className="mn-header__left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mn-header__title-wrapper"
          >
            <h1 className="mn-header__title">Notifications</h1>
            {unreadCount > 0 && <span className="mn-unread-pill">{unreadCount} New</span>}
          </motion.div>
          <p className="mn-header__subtitle">Your personalized activity feed and gym updates</p>
        </div>
        
        <div className="mn-header__actions">
          <div className="mn-search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="mn-action-btn mn-action-btn--primary" onClick={markAllAsRead}>
            <CheckCheck size={18} />
            <span>Mark all read</span>
          </button>
          <button className="mn-icon-btn" onClick={() => navigate("/member/settings")}>
            <Settings size={18} />
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
              <Inbox size={18} />
              <span>All Notifications</span>
              {unreadCount > 0 && <span className="mn-nav-count">{unreadCount}</span>}
            </button>
            <button 
              className={`mn-nav-item ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              <Bell size={18} />
              <span>Unread</span>
            </button>
            <button 
              className={`mn-nav-item ${filter === 'starred' ? 'active' : ''}`}
              onClick={() => setFilter('starred')}
            >
              <Star size={18} />
              <span>Starred</span>
            </button>
            <button 
              className={`mn-nav-item ${filter === 'archived' ? 'active' : ''}`}
              onClick={() => setFilter('archived')}
            >
              <Archive size={18} />
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
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mn-loading"
              >
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="mn-skeleton" />
                ))}
              </motion.div>
            ) : filteredAndSearched.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mn-empty"
              >
                <div className="mn-empty-illustration">
                  <div className="mn-empty-circle">
                    <Bell size={40} />
                  </div>
                  <div className="mn-empty-sparkle sparkle-1" />
                  <div className="mn-empty-sparkle sparkle-2" />
                </div>
                <h3>All caught up!</h3>
                <p>No notifications found matching your current filter.</p>
                {filter !== 'all' && (
                  <button onClick={() => setFilter('all')} className="mn-clear-filter">
                    Clear filters
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
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`mn-card ${!notif.isRead ? 'unread' : ''} ${notif.priority === 'urgent' ? 'urgent' : ''}`}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif.id)
                                if (notif.link) navigate(notif.link)
                              }}
                            >
                              <div className="mn-card-main">
                                <div className="mn-card-icon-box" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                                  <Icon size={20} />
                                </div>
                                <div className="mn-card-content">
                                  <div className="mn-card-top">
                                    <span className="mn-card-title">{notif.title}</span>
                                    <span className="mn-card-time">{formatDate(notif.createdAt)}</span>
                                  </div>
                                  <p className="mn-card-msg">{notif.message}</p>
                                  {notif.link && (
                                    <div className="mn-card-link" style={{ color: typeInfo.color }}>
                                      <span>View details</span>
                                      <ArrowRight size={14} />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mn-card-actions">
                                <button 
                                  className={`mn-card-action-btn star ${notif.isStarred ? 'active' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); toggleStar(notif.id); }}
                                >
                                  <Star size={16} fill={notif.isStarred ? "currentColor" : "none"} />
                                </button>
                                <button 
                                  className="mn-card-action-btn archive"
                                  onClick={(e) => { e.stopPropagation(); archiveNotification(notif.id); }}
                                  title="Archive"
                                >
                                  <Archive size={16} />
                                </button>
                                <button 
                                  className="mn-card-action-btn delete"
                                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
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

      <footer className="mn-footer">
        <div className="mn-quick-stats">
          <div className="mn-q-stat">
            <span className="value">{notifications.length}</span>
            <span className="label">Total Received</span>
          </div>
          <div className="mn-q-stat">
            <span className="value">{unreadCount}</span>
            <span className="label">Pending Review</span>
          </div>
          <div className="mn-q-stat">
            <span className="value">
              {notifications.filter(n => n.isStarred).length}
            </span>
            <span className="label">Starred Items</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MemberNotifications
