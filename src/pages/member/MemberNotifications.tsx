"use client"

import type React from "react"
import { useState } from "react"
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
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Badge } from "../../components"
import "./MemberNotifications.css"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  action?: { label: string; path: string }
}

type FilterType = "all" | "unread" | "membership" | "booking" | "achievement"

const MemberNotifications: React.FC = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Class Reminder",
      message: "Your Yoga class starts in 1 hour. Room A at 9:00 AM.",
      type: "BOOKING",
      isRead: false,
      createdAt: new Date().toISOString(),
      action: { label: "View Class", path: "/member/bookings" },
    },
    {
      id: 2,
      title: "Payment Successful",
      message: "Your monthly membership payment of ₹2,999 was processed successfully.",
      type: "MEMBERSHIP",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      action: { label: "View Receipt", path: "/member/membership" },
    },
    {
      id: 3,
      title: "New Achievement!",
      message: 'Congratulations! You unlocked the "7 Day Streak" badge.',
      type: "ACHIEVEMENT",
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 4,
      title: "Trainer Feedback",
      message: 'John Smith left feedback on your progress: "Great improvement on form!"',
      type: "TRAINER",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      action: { label: "View Progress", path: "/member/progress" },
    },
    {
      id: 5,
      title: "Membership Expiring",
      message: "Your Premium plan expires in 7 days. Renew now to keep your benefits.",
      type: "MEMBERSHIP",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      action: { label: "Renew Now", path: "/member/membership" },
    },
    {
      id: 6,
      title: "Class Cancelled",
      message: "HIIT Training on Jan 5 has been cancelled. Your slot has been freed.",
      type: "BOOKING",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 7,
      title: "Special Offer!",
      message: "Get 20% off on PT sessions this week. Limited time offer!",
      type: "PROMO",
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ])
  const [filter, setFilter] = useState<FilterType>("all")

  const markAsRead = (notificationId: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast.success("All marked as read")
  }

  const deleteNotification = (notificationId: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    toast.success("Notification deleted")
  }

  const clearAll = () => {
    setNotifications([])
    toast.success("All notifications cleared")
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 5) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getTypeInfo = (type: string) => {
    switch (type?.toUpperCase()) {
      case "MEMBERSHIP":
        return { icon: CreditCard, color: "#007AFF", bg: "rgba(0, 122, 255, 0.12)" }
      case "BOOKING":
        return { icon: Calendar, color: "#34C759", bg: "rgba(52, 199, 89, 0.12)" }
      case "TRAINER":
        return { icon: User, color: "#AF52DE", bg: "rgba(175, 82, 222, 0.12)" }
      case "ACHIEVEMENT":
        return { icon: Trophy, color: "#FF9500", bg: "rgba(255, 149, 0, 0.12)" }
      case "PROMO":
        return { icon: Gift, color: "#FF2D55", bg: "rgba(255, 45, 85, 0.12)" }
      case "URGENT":
        return { icon: AlertTriangle, color: "#FF3B30", bg: "rgba(255, 59, 48, 0.12)" }
      default:
        return { icon: Bell, color: "#8E8E93", bg: "rgba(142, 142, 147, 0.12)" }
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.isRead
    if (filter === "membership") return n.type === "MEMBERSHIP"
    if (filter === "booking") return n.type === "BOOKING"
    if (filter === "achievement") return n.type === "ACHIEVEMENT"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="mn-page">
      <header className="mn-header">
        <div className="mn-header__left">
          <h1 className="mn-header__title">
            Notifications
            {unreadCount > 0 && <Badge variant="blue" className="ml-2">{unreadCount}</Badge>}
          </h1>
          <p className="mn-header__subtitle">Stay updated with your gym activity</p>
        </div>
        <div className="mn-header__actions">
          <button className="mn-icon-btn" onClick={markAllAsRead} title="Mark all read">
            <CheckCheck size={18} />
          </button>
          <button className="mn-icon-btn" onClick={clearAll} title="Clear all">
            <Trash2 size={18} />
          </button>
          <button className="mn-icon-btn" onClick={() => navigate("/member/settings")} title="Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="mn-toolbar">
        <div className="mn-filters">
          <button
            className={`mn-filter-btn ${filter === "all" ? "mn-filter-btn--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`mn-filter-btn ${filter === "unread" ? "mn-filter-btn--active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadCount > 0 && <span className="mn-filter-btn__count">{unreadCount}</span>}
          </button>
          <button
            className={`mn-filter-btn ${filter === "membership" ? "mn-filter-btn--active" : ""}`}
            onClick={() => setFilter("membership")}
          >
            Plans
          </button>
          <button
            className={`mn-filter-btn ${filter === "booking" ? "mn-filter-btn--active" : ""}`}
            onClick={() => setFilter("booking")}
          >
            Classes
          </button>
          <button
            className={`mn-filter-btn ${filter === "achievement" ? "mn-filter-btn--active" : ""}`}
            onClick={() => setFilter("achievement")}
          >
            Goals
          </button>
        </div>
      </div>

      <main className="mn-content">
        <div className="mn-list">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mn-empty"
              >
                <div className="mn-empty__icon">
                  <Bell size={32} />
                </div>
                <h3 className="mn-empty__title">No notifications</h3>
                <p className="mn-empty__text">We'll notify you when something important happens.</p>
              </motion.div>
            ) : (
              <div className="mn-group">
                <div className="mn-group__items">
                  {filteredNotifications.map((notif) => {
                    const typeInfo = getTypeInfo(notif.type)
                    const Icon = typeInfo.icon

                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`mn-item ${!notif.isRead ? "mn-item--unread" : ""}`}
                        onClick={() => !notif.isRead && markAsRead(notif.id)}
                      >
                        <div className="mn-item__indicator" style={{ backgroundColor: typeInfo.color }} />
                        <div
                          className="mn-item__icon"
                          style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="mn-item__content">
                          <div className="mn-item__header">
                            <span className="mn-item__title">{notif.title}</span>
                            <span className="mn-item__time">{formatDate(notif.createdAt)}</span>
                          </div>
                          <p className="mn-item__message">{notif.message}</p>
                          {notif.action && (
                            <button
                              className="mn-item__action"
                              style={{ color: typeInfo.color }}
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(notif.action!.path)
                              }}
                            >
                              {notif.action.label}
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                        <div className="mn-item__actions">
                          {!notif.isRead && <div className="mn-item__dot" />}
                          <button
                            className="mn-item__delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notif.id)
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mn-stats">
        <div className="mn-stat">
          <span className="mn-stat__value">{notifications.length}</span>
          <span className="mn-stat__label">Total</span>
        </div>
        <div className="mn-stat">
          <span className="mn-stat__value">{unreadCount}</span>
          <span className="mn-stat__label">Unread</span>
        </div>
        <div className="mn-stat">
          <span className="mn-stat__value">
            {notifications.filter((n) => n.createdAt.includes(new Date().toISOString().split("T")[0])).length}
          </span>
          <span className="mn-stat__label">Today</span>
        </div>
      </footer>
    </div>
  )
}

export default MemberNotifications
