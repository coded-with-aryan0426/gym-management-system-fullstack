"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  Lock,
  Shield,
  CreditCard,
  Target,
  Smartphone,
  Info,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Globe,
  Mail,
  Phone,
  Calendar,
  Heart,
  Eye,
  Settings,
  Dumbbell,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Toggle, Badge } from "../../components"
import "./MemberSettings.css"

type SettingSection =
  | "profile"
  | "notifications"
  | "membership"
  | "fitness"
  | "security"
  | "appearance"
  | "privacy"
  | "about"

const MemberSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingSection>("profile")
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const [notifications, setNotifications] = useState({
    classReminders: true,
    trainerMessages: true,
    achievements: true,
    marketing: false,
    security: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: false,
    shareData: true,
  })

  const handleToggle = (key: string, value: boolean, setter: any) => {
    setter((prev: any) => ({ ...prev, [key]: value }))
    toast.success("Preference updated")
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "membership", label: "Plan", icon: CreditCard },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "fitness", label: "Goals", icon: Target },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Theme", icon: theme === "dark" ? Moon : Sun },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "about", label: "About", icon: Info },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Personal Information</h3>
              <p>Manage your account details and contact info</p>
            </div>
            <div className="settings-grid">
              <div className="settings-item">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input type="text" defaultValue="Barbara Robinson" />
                </div>
              </div>
              <div className="settings-item">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input type="email" defaultValue="barbara.r@gmail.com" />
                </div>
              </div>
              <div className="settings-item">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input type="tel" defaultValue="+91 98765 43210" />
                </div>
              </div>
              <div className="settings-item">
                <label>Birth Date</label>
                <div className="input-with-icon">
                  <Calendar size={16} />
                  <input type="date" defaultValue="1995-03-10" />
                </div>
              </div>
            </div>
            <button className="save-btn" onClick={() => toast.success("Profile saved")}>
              Update Profile
            </button>
          </div>
        )
      case "membership":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Current Membership</h3>
              <p>View and manage your subscription</p>
            </div>
            <div className="membership-card">
              <div className="membership-card__main">
                <div className="plan-info">
                  <span className="plan-badge">Premium Plan</span>
                  <h2>₹2,999<span>/month</span></h2>
                </div>
                <CreditCard size={32} className="card-icon" />
              </div>
              <div className="membership-details">
                <div className="detail">
                  <span>Expires</span>
                  <strong>March 10, 2026</strong>
                </div>
                <div className="detail">
                  <span>Auto-renew</span>
                  <span className="text-green">Active</span>
                </div>
              </div>
              <div className="membership-actions">
                <button className="outline-btn">Change Plan</button>
                <button className="text-btn">Cancel Subscription</button>
              </div>
            </div>
          </div>
        )
      case "notifications":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Notification Preferences</h3>
              <p>Choose what you want to be notified about</p>
            </div>
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="info">
                  <span>Class Reminders</span>
                  <p>Get alerts 1 hour before your classes</p>
                </div>
                <Toggle
                  checked={notifications.classReminders}
                  onChange={(val) => handleToggle("classReminders", val, setNotifications)}
                />
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Trainer Messages</span>
                  <p>Notifications for new messages from trainers</p>
                </div>
                <Toggle
                  checked={notifications.trainerMessages}
                  onChange={(val) => handleToggle("trainerMessages", val, setNotifications)}
                />
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Achievements</span>
                  <p>When you hit goals or unlock badges</p>
                </div>
                <Toggle
                  checked={notifications.achievements}
                  onChange={(val) => handleToggle("achievements", val, setNotifications)}
                />
              </div>
            </div>
          </div>
        )
      case "fitness":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Fitness Goals</h3>
              <p>Set your targets and preferences</p>
            </div>
            <div className="settings-grid">
              <div className="settings-item">
                <label>Weekly Workout Goal</label>
                <div className="input-with-icon">
                  <Dumbbell size={16} />
                  <select defaultValue="4">
                    <option value="1">1 time</option>
                    <option value="2">2 times</option>
                    <option value="3">3 times</option>
                    <option value="4">4 times</option>
                    <option value="5">5+ times</option>
                  </select>
                </div>
              </div>
              <div className="settings-item">
                <label>Weight Unit</label>
                <div className="segmented-control">
                  <button className="active">kg</button>
                  <button>lbs</button>
                </div>
              </div>
            </div>
          </div>
        )
      case "appearance":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>App Appearance</h3>
              <p>Customize how the app looks for you</p>
            </div>
            <div className="appearance-grid">
              <button className={`appearance-btn ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
                <div className="preview light" />
                <Sun size={14} />
                <span>Light</span>
              </button>
              <button className={`appearance-btn ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
                <div className="preview dark" />
                <Moon size={14} />
                <span>Dark</span>
              </button>
            </div>
          </div>
        )
      default:
        return <div className="settings-panel-empty">Coming Soon</div>
    }
  }

  return (
    <div className="member-settings">
      <header className="member-settings__header">
        <div className="user-profile">
          <div className="avatar-placeholder">BR</div>
          <div className="info">
            <h1>Barbara Robinson</h1>
            <Badge variant="blue">Premium Member</Badge>
          </div>
        </div>
        <button className="logout-btn" onClick={() => toast.success("Logged out")}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="member-settings__main">
        <aside className="settings-nav">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id as SettingSection)}
              >
                <Icon size={18} />
                <span>{section.label}</span>
                <ChevronRight size={14} className="chevron" />
              </button>
            )
          })}
        </aside>

        <section className="settings-content">{renderContent()}</section>
      </main>
    </div>
  )
}

export default MemberSettings
