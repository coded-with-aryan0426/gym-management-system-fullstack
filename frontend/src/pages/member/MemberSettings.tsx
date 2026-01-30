"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Bell,
  Lock,
  Shield,
  CreditCard,
  Target,
  Info,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Globe,
  Mail,
  Phone,
  Calendar,
  Settings,
  Dumbbell,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Monitor,
  RefreshCcw,
  Smartphone,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Toggle, Badge } from "../../components"
import { useAuth } from "../../contexts/AuthContext"
import { memberSettingsApi, type MemberSettingsDTO } from "../../services/memberSettingsApi"
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
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState<SettingSection>("profile")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<MemberSettingsDTO | null>(null)
  
  // Local state for forms
  const [profileForm, setProfileForm] = useState<any>({})
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [sessions, setSessions] = useState<any[]>([])

    useEffect(() => {
      const id = user?.userId || (user?.id ? parseInt(String(user.id)) : null)
      if (id) {
        fetchSettings(id)
        fetchSessions(id)
      }
    }, [user?.userId, user?.id])

    const fetchSettings = async (id: number) => {
      try {
        setIsLoading(true)
        const data = await memberSettingsApi.getSettings(id)
        setSettings(data)
        setProfileForm(data.profile || {})
      } catch (error) {
        toast.error("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSessions = async (id: number) => {
      try {
        const data = await memberSettingsApi.getSessions(id)
        setSessions(data)
      } catch (error) {
        console.error("Failed to fetch sessions")
      }
    }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await memberSettingsApi.updateProfile(user!.userId!, profileForm)
      toast.success("Profile updated successfully")
      fetchSettings()
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceUpdate = async (key: string, value: any) => {
    try {
      const updatedPrefs = { ...settings?.preferences, [key]: value }
      await memberSettingsApi.updatePreferences(user!.userId!, updatedPrefs)
      setSettings(prev => prev ? { ...prev, preferences: updatedPrefs } : null)
      toast.success("Preference updated")
    } catch (error) {
      toast.error("Failed to update preference")
    }
  }

  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      const updatedNotifs = { ...settings?.notifications, [key]: value }
      await memberSettingsApi.updateNotifications(user!.userId!, updatedNotifs)
      setSettings(prev => prev ? { ...prev, notifications: updatedNotifs } : null)
      toast.success("Notification setting updated")
    } catch (error) {
      toast.error("Failed to update notification settings")
    }
  }

  const handlePrivacyToggle = async (key: string, value: any) => {
    try {
      const updatedPrivacy = { ...settings?.privacy, [key]: value }
      await memberSettingsApi.updatePrivacy(user!.userId!, updatedPrivacy)
      setSettings(prev => prev ? { ...prev, privacy: updatedPrivacy } : null)
      toast.success("Privacy setting updated")
    } catch (error) {
      toast.error("Failed to update privacy settings")
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    try {
      setIsSaving(true)
      await memberSettingsApi.changePassword(user!.userId!, passwordForm)
      toast.success("Password changed successfully")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password")
    } finally {
      setIsSaving(false)
    }
  }

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "membership", label: "Plan", icon: CreditCard },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "fitness", label: "Goals", icon: Target },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Theme", icon: settings?.preferences?.theme === "DARK" ? Moon : Sun },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "about", label: "About", icon: Info },
  ]

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="settings-loader">
          <Loader2 className="animate-spin" size={48} />
          <p>Loading your settings...</p>
        </div>
      )
    }

    switch (activeSection) {
      case "profile":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Personal Information</h3>
              <p>Manage your account details and contact info</p>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="settings-grid">
                <div className="settings-item">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input 
                      type="text" 
                      value={profileForm.fullName || ""} 
                      onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div className="settings-item">
                  <label>Email Address</label>
                  <div className="input-with-icon disabled">
                    <Mail size={16} />
                    <input type="email" value={profileForm.email || ""} disabled />
                  </div>
                </div>
                <div className="settings-item">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input 
                      type="tel" 
                      value={profileForm.phone || ""} 
                      onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                <div className="settings-item">
                  <label>Birth Date</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input 
                      type="date" 
                      value={profileForm.dateOfBirth ? profileForm.dateOfBirth.split('T')[0] : ""} 
                      onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <button className="save-btn" type="submit" disabled={isSaving}>
                {isSaving ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        )
      case "membership":
        const membership = settings?.profile?.membership;
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Current Membership</h3>
              <p>View your subscription status and plan details</p>
            </div>
            {membership ? (
              <div className="membership-card">
                <div className="membership-card__main">
                  <div className="plan-info">
                    <span className="plan-badge">{membership.planName}</span>
                    <h2>Premium Plan</h2>
                  </div>
                  <CreditCard size={32} className="card-icon" />
                </div>
                <div className="membership-details">
                  <div className="detail">
                    <span>Expires On</span>
                    <strong>{new Date(membership.endDate).toLocaleDateString()}</strong>
                  </div>
                  <div className="detail">
                    <span>Status</span>
                    <span className={membership.status === 'ACTIVE' ? "text-green" : "text-red"}>
                      {membership.status}
                    </span>
                  </div>
                  <div className="detail">
                    <span>Days Remaining</span>
                    <strong>{membership.daysRemaining} Days</strong>
                  </div>
                  <div className="detail">
                    <span>Joined On</span>
                    <strong>{new Date(membership.startDate).toLocaleDateString()}</strong>
                  </div>
                </div>
                <div className="membership-actions">
                  <button className="outline-btn">Renew Now</button>
                  <button className="text-btn">Manage Payments</button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>No active membership found.</p>
                <button className="save-btn">View Plans</button>
              </div>
            )}
          </div>
        )
      case "notifications":
        const notifs = settings?.notifications;
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Notification Preferences</h3>
              <p>Choose what you want to be notified about</p>
            </div>
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="info">
                  <span>Workout Reminders</span>
                  <p>Get alerts for your scheduled workouts</p>
                </div>
                <Toggle
                  label=""
                  name="workoutReminders"
                  checked={notifs?.workoutReminders ?? true}
                  onChange={(val) => handleNotificationToggle("workoutReminders", val)}
                />
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Class Schedule</span>
                  <p>Notifications for new classes and schedule changes</p>
                </div>
                <Toggle
                  label=""
                  name="classSchedule"
                  checked={notifs?.classSchedule ?? true}
                  onChange={(val) => handleNotificationToggle("classSchedule", val)}
                />
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Trainer Messages</span>
                  <p>When you receive a new message from your trainer</p>
                </div>
                <Toggle
                  label=""
                  name="trainerMessages"
                  checked={notifs?.trainerMessages ?? true}
                  onChange={(val) => handleNotificationToggle("trainerMessages", val)}
                />
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Marketing & Offers</span>
                  <p>Stay updated on new deals and gym updates</p>
                </div>
                <Toggle
                  label=""
                  name="marketingEmails"
                  checked={notifs?.marketingEmails ?? false}
                  onChange={(val) => handleNotificationToggle("marketingEmails", val)}
                />
              </div>
            </div>
          </div>
        )
      case "fitness":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Fitness Preferences</h3>
              <p>Set your level and preferences for a better experience</p>
            </div>
            <div className="settings-grid">
              <div className="settings-item">
                <label>Skill Level</label>
                <div className="input-with-icon">
                  <Target size={16} />
                  <select 
                    value={settings?.preferences?.skillLevel || "BEGINNER"} 
                    onChange={e => handlePreferenceUpdate("skillLevel", e.target.value)}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ELITE">Elite</option>
                  </select>
                </div>
              </div>
              <div className="settings-item">
                <label>Workout Preferences</label>
                <div className="input-with-icon">
                  <Dumbbell size={16} />
                  <input 
                    type="text" 
                    value={settings?.preferences?.workoutPreferences || ""} 
                    onChange={e => setSettings(prev => prev ? {...prev, preferences: {...prev.preferences, workoutPreferences: e.target.value}} : null)}
                    onBlur={e => handlePreferenceUpdate("workoutPreferences", e.target.value)}
                    placeholder="e.g. Strength, Yoga, Cardio"
                  />
                </div>
              </div>
              <div className="settings-item">
                <label>Weight Unit</label>
                <div className="segmented-control">
                  <button className="active">kg</button>
                  <button disabled>lbs</button>
                </div>
              </div>
            </div>
          </div>
        )
      case "security":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Account Security</h3>
              <p>Secure your account and manage active sessions</p>
            </div>
            
            <div className="security-section">
              <h4>Change Password</h4>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="settings-item">
                  <label>Current Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input 
                      type={showPasswords.current ? "text" : "password"} 
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                    <button type="button" className="icon-btn" onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}>
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="settings-grid">
                  <div className="settings-item">
                    <label>New Password</label>
                    <div className="input-with-icon">
                      <Lock size={16} />
                      <input 
                        type={showPasswords.new ? "text" : "password"} 
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                      />
                      <button type="button" className="icon-btn" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}>
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-item">
                    <label>Confirm Password</label>
                    <div className="input-with-icon">
                      <CheckCircle2 size={16} />
                      <input 
                        type={showPasswords.confirm ? "text" : "password"} 
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                      <button type="button" className="icon-btn" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}>
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button className="save-btn" type="submit" disabled={isSaving}>Update Password</button>
              </form>
            </div>

            <div className="security-section">
              <h4>Active Sessions</h4>
              <div className="session-list">
                {sessions.map((session, idx) => (
                  <div key={idx} className="session-item">
                    <div className="session-icon">
                      {session.device === 'Mobile' ? <Smartphone size={20} /> : <Monitor size={20} />}
                    </div>
                    <div className="session-info">
                      <span>{session.device} • {session.location}</span>
                      <p>{session.isCurrent ? "Current Session" : `Last active ${new Date(session.lastActive).toLocaleString()}`}</p>
                    </div>
                    {session.isCurrent ? <Badge variant="success">Active</Badge> : <button className="text-btn">Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case "privacy":
        const priv = settings?.privacy;
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>Privacy Controls</h3>
              <p>Manage who can see your information and progress</p>
            </div>
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="info">
                  <span>Profile Visibility</span>
                  <p>Choose who can see your profile on the leaderboard</p>
                </div>
                <select 
                  className="minimal-select"
                  value={priv?.profileVisibility || "PUBLIC"}
                  onChange={e => handlePrivacyToggle("profileVisibility", e.target.value)}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FRIENDS">Friends Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Show Progress Photos</span>
                  <p>Allow your progress photos to be visible in your feed</p>
                </div>
                <Toggle
                  label=""
                  name="showProgressPhotos"
                  checked={priv?.showProgressPhotos ?? true}
                  onChange={(val) => handlePrivacyToggle("showProgressPhotos", val)}
                />
              </div>
              <div className="toggle-item">
                <div className="info">
                  <span>Allow Trainer Access</span>
                  <p>Grant your assigned trainer full access to your stats</p>
                </div>
                <Toggle
                  label=""
                  name="allowTrainerAccess"
                  checked={priv?.allowTrainerAccess ?? true}
                  onChange={(val) => handlePrivacyToggle("allowTrainerAccess", val)}
                />
              </div>
            </div>
          </div>
        )
      case "appearance":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>App Appearance</h3>
              <p>Customize your visual experience</p>
            </div>
            <div className="appearance-grid">
              <button 
                className={`appearance-btn ${settings?.preferences?.theme === "LIGHT" ? "active" : ""}`} 
                onClick={() => handlePreferenceUpdate("theme", "LIGHT")}
              >
                <div className="preview light" />
                <Sun size={14} />
                <span>Light Mode</span>
              </button>
              <button 
                className={`appearance-btn ${settings?.preferences?.theme === "DARK" ? "active" : ""}`} 
                onClick={() => handlePreferenceUpdate("theme", "DARK")}
              >
                <div className="preview dark" />
                <Moon size={14} />
                <span>Dark Mode</span>
              </button>
            </div>
            <div className="settings-item mt-8">
              <label>App Language</label>
              <div className="input-with-icon">
                <Globe size={16} />
                <select 
                  value={settings?.preferences?.language || "en"} 
                  onChange={e => handlePreferenceUpdate("language", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>
        )
      case "about":
        return (
          <div className="settings-panel">
            <div className="settings-panel__header">
              <h3>About AthlonX</h3>
              <p>App information and legal details</p>
            </div>
            <div className="about-content">
              <div className="app-logo-large">AX</div>
              <h2>AthlonX v2.4.0</h2>
              <p>Your Ultimate Gym Management Companion</p>
              <div className="legal-links">
                <button className="text-btn">Terms of Service</button>
                <button className="text-btn">Privacy Policy</button>
                <button className="text-btn">Contact Support</button>
              </div>
              <p className="copyright">© 2026 AthlonX Systems. All rights reserved.</p>
            </div>
          </div>
        )
      default:
        return <div className="settings-panel-empty">Section under development</div>
    }
  }

  return (
    <div className="member-settings">
      <header className="member-settings__header">
        <div className="user-profile">
          <div className="avatar-placeholder">
            {user?.fullName?.split(' ').map(n => n[0]).join('') || "U"}
          </div>
          <div className="info">
            <h1>{user?.fullName || "User Name"}</h1>
            <Badge variant="info">
              {settings?.profile?.membership?.planName || "Standard Member"}
            </Badge>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
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

        <section className="settings-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}

export default MemberSettings
