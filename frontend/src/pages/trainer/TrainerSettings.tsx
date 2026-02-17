import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Shield,
  Bell,
  Palette,
  Calendar,
  Clock,
  Save,
  Moon,
  Sun,
  Monitor,
  Check,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Dumbbell,
  Target,
  FileText,
  CreditCard,
  Mail,
  Phone,
  Award,
  Info,
  AlertCircle,
  Users,
  Timer,
  UserCheck,
  BarChart3,
  DollarSign,
  Briefcase,
} from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import { toast } from "react-hot-toast"
import "../Settings/Settings.css"

/* ── Types ── */
interface TrainerProfile {
  name: string
  email: string
  phone: string
  specialization: string
  experience: string
  bio: string
  certifications: string
  profileImage?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  classReminders: boolean
  memberUpdates: boolean
  scheduleChanges: boolean
  progressAlerts: boolean
  paymentAlerts: boolean
  newAssignments: boolean
}

interface AvailabilitySlot {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

/* ── Sidebar categories ── */
const settingsCategories = [
  { id: "profile",        label: "Trainer Profile",     icon: User,       desc: "Personal details & bio",       color: "#3b82f6" },
  { id: "specialization", label: "Specialization",      icon: Dumbbell,   desc: "Skills & certifications",      color: "#10b981" },
  { id: "availability",   label: "Availability",        icon: Calendar,   desc: "Working hours & schedule",     color: "#06b6d4" },
  { id: "clients",        label: "Client Preferences",  icon: Target,     desc: "Training & client settings",   color: "#8b5cf6" },
  { id: "appearance",     label: "Appearance",           icon: Palette,    desc: "Theme & display",              color: "#a855f7" },
  { id: "notifications",  label: "Notifications",       icon: Bell,       desc: "Alerts & reminders",           color: "#f97316" },
  { id: "security",       label: "Security",            icon: Shield,     desc: "Password & account safety",    color: "#ef4444" },
  { id: "billing",        label: "Earnings & Payouts",  icon: CreditCard, desc: "Payment info & history",       color: "#f59e0b" },
  { id: "reports",        label: "Reports & Logs",      icon: FileText,   desc: "Session logs & performance",   color: "#14b8a6" },
]

/* ── Defaults ── */
const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { day: "Monday",    enabled: true,  startTime: "06:00", endTime: "20:00" },
  { day: "Tuesday",   enabled: true,  startTime: "06:00", endTime: "20:00" },
  { day: "Wednesday", enabled: true,  startTime: "06:00", endTime: "20:00" },
  { day: "Thursday",  enabled: true,  startTime: "06:00", endTime: "20:00" },
  { day: "Friday",    enabled: true,  startTime: "06:00", endTime: "20:00" },
  { day: "Saturday",  enabled: true,  startTime: "08:00", endTime: "16:00" },
  { day: "Sunday",    enabled: false, startTime: "08:00", endTime: "12:00" },
]

/* ═══════════════════════════════════════════════════════════════════════════ */
const TrainerSettings: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme()
  const { user } = useAuth()

  const [activeSection, setActiveSection] = useState(() =>
    sessionStorage.getItem("trainer_settings_section") || "profile"
  )
  const [saving, setSaving] = useState(false)

  /* ── Profile state ── */
  const [profile, setProfile] = useState<TrainerProfile>({
    name: "", email: "", phone: "", specialization: "", experience: "", bio: "", certifications: "",
  })

  /* ── Notification state ── */
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true, classReminders: true, memberUpdates: true,
    scheduleChanges: true, progressAlerts: true, paymentAlerts: true, newAssignments: true,
  })

  /* ── Security state ── */
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  /* ── Availability state ── */
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITY)

  /* ── Client preferences state ── */
  const [maxClients, setMaxClients] = useState("20")
  const [sessionDuration, setSessionDuration] = useState("60")
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(true)
  const [allowGroupSessions, setAllowGroupSessions] = useState(true)
  const [maxGroupSize, setMaxGroupSize] = useState("8")
  const [restBetweenSessions, setRestBetweenSessions] = useState("15")

  /* ── Persist active section ── */
  useEffect(() => {
    sessionStorage.setItem("trainer_settings_section", activeSection)
  }, [activeSection])

  useEffect(() => {
    fetchProfile()
    fetchNotificationSettings()
    fetchAvailability()
  }, [])

  /* ── API calls ── */
  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/trainer/profile")
      if (response.data) {
        setProfile({
          name: response.data.name || user?.name || "",
          email: response.data.email || user?.email || "",
          phone: response.data.phone || "",
          specialization: response.data.specialization || "",
          experience: response.data.experience || "",
          bio: response.data.bio || "",
          certifications: response.data.certifications || "",
          profileImage: response.data.profileImage,
        })
      }
    } catch {
      setProfile(prev => ({ ...prev, name: user?.name || "", email: user?.email || "" }))
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const res = await api.get("/api/trainer/settings/notifications")
      if (res.data) setNotifications(res.data)
    } catch { /* defaults */ }
  }

  const fetchAvailability = async () => {
    try {
      const res = await api.get("/api/trainer/settings/availability")
      if (res.data?.slots) setAvailability(res.data.slots)
    } catch { /* defaults */ }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.put("/api/trainer/profile", profile)
      toast.success("Profile updated successfully")
    } catch { toast.error("Failed to update profile") }
    finally { setSaving(false) }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await api.put("/api/trainer/settings/notifications", notifications)
      toast.success("Notification preferences saved")
    } catch { toast.error("Failed to save notification preferences") }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return }
    setSaving(true)
    try {
      await api.put("/api/trainer/settings/password", { currentPassword, newPassword })
      toast.success("Password changed successfully")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch { toast.error("Failed to change password") }
    finally { setSaving(false) }
  }

  const handleSaveAvailability = async () => {
    setSaving(true)
    try {
      await api.put("/api/trainer/settings/availability", { slots: availability })
      toast.success("Availability updated")
    } catch { toast.error("Failed to update availability") }
    finally { setSaving(false) }
  }

  const handleSaveClientPreferences = async () => {
    setSaving(true)
    try {
      await api.put("/api/trainer/settings/client-preferences", {
        maxClients: Number(maxClients), sessionDuration: Number(sessionDuration),
        autoAcceptBookings, allowGroupSessions, maxGroupSize: Number(maxGroupSize),
        restBetweenSessions: Number(restBetweenSessions),
      })
      toast.success("Client preferences saved")
    } catch { toast.error("Failed to save client preferences") }
    finally { setSaving(false) }
  }

  /* ═══════════════════════════════════  SECTIONS  ═══════════════════════════════════ */

  const renderSection = () => {
    switch (activeSection) {
      case "profile":        return <ProfileSection />
      case "specialization": return <SpecializationSection />
      case "availability":   return <AvailabilitySection />
      case "clients":        return <ClientPreferencesSection />
      case "appearance":     return <AppearanceSection />
      case "notifications":  return <NotificationsSection />
      case "security":       return <SecuritySection />
      case "billing":        return <BillingSection />
      case "reports":        return <ReportsSection />
      default:               return <ProfileSection />
    }
  }

  /* ── Profile ── */
  const ProfileSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#3b82f6" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
          <User size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Trainer Profile</h2>
          <p className="settings-section__description">Update your personal details and trainer bio</p>
        </div>
        <div className="settings-section__actions">
          <button className="settings-btn settings-btn--primary" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save Changes
          </button>
        </div>
      </div>

      <div className="settings-section__content">
        {/* Avatar card */}
        <div className="form-group">
          <div style={{
            display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.25rem",
            background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border-primary)",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26,
              fontWeight: 700, position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              {profile.profileImage
                ? <img src={profile.profileImage} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (profile.name?.charAt(0)?.toUpperCase() || "T")
              }
              <button style={{
                position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%",
                background: "#3b82f6", border: "2px solid var(--bg-primary)", display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff",
              }} title="Change photo">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 2 }}>{profile.name || "Trainer"}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={13} /> {profile.email || "No email set"}
              </div>
              {profile.phone && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Phone size={13} /> {profile.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity fields */}
        <div className="form-group">
          <div className="form-group__header">
            <User size={16} />
            <h4 className="form-group__title">Personal Information</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper">
              <label className="field-label">
                Full Name
                <span className="field-label__required">*</span>
              </label>
              <input className="dense-input" type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your full name" />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Email Address
                <span className="field-label__required">*</span>
              </label>
              <input className="dense-input" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="trainer@example.com" />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Phone Number
                <div className="info-icon" data-tooltip="Used for member communication and scheduling">
                  <Info size={14} />
                </div>
              </label>
              <input className="dense-input" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Years of Experience
                <div className="info-icon" data-tooltip="Displayed on your trainer profile visible to members">
                  <Info size={14} />
                </div>
              </label>
              <input className="dense-input" type="text" value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} placeholder="e.g. 5 years" />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="form-group">
          <div className="form-group__header">
            <FileText size={16} />
            <h4 className="form-group__title">About You</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper field-wrapper--full">
              <label className="field-label">
                Bio / Description
                <div className="info-icon" data-tooltip="Tell members about your training style, philosophy, and background">
                  <Info size={14} />
                </div>
              </label>
              <textarea className="dense-input" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell members about yourself, your training philosophy, and expertise..." rows={4} style={{ resize: "vertical" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Specialization ── */
  const SpecializationSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#10b981" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          <Dumbbell size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Specialization & Skills</h2>
          <p className="settings-section__description">Manage your training expertise and certifications</p>
        </div>
        <div className="settings-section__actions">
          <button className="settings-btn settings-btn--primary" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Award size={16} />
            <h4 className="form-group__title">Training Expertise</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper field-wrapper--full">
              <label className="field-label">
                Specializations
                <span className="field-label__required">*</span>
                <div className="info-icon" data-tooltip="Separate multiple specializations with commas">
                  <Info size={14} />
                </div>
              </label>
              <input className="dense-input" type="text" value={profile.specialization} onChange={e => setProfile({ ...profile, specialization: e.target.value })} placeholder="e.g. Strength Training, Yoga, HIIT, CrossFit" />
              <div className="field-hint"><Check size={12} /> Separate multiple specializations with commas</div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group__header">
            <Briefcase size={16} />
            <h4 className="form-group__title">Qualifications</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper field-wrapper--full">
              <label className="field-label">
                Certifications
                <div className="info-icon" data-tooltip="List your professional certifications, each on a new line">
                  <Info size={14} />
                </div>
              </label>
              <textarea className="dense-input" value={profile.certifications} onChange={e => setProfile({ ...profile, certifications: e.target.value })} placeholder={"e.g.\nNASM-CPT\nACE Certified Personal Trainer\
CrossFit Level 2"} rows={4} style={{ resize: "vertical" }} />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Years of Experience
                <div className="info-icon" data-tooltip="Total years in the fitness industry">
                  <Info size={14} />
                </div>
              </label>
              <input className="dense-input" type="text" value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} placeholder="e.g. 5 years" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Availability ── */
  const AvailabilitySection = () => (
    <div className="settings-section" style={{ "--section-accent": "#06b6d4" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
          <Calendar size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Availability</h2>
          <p className="settings-section__description">Set your working hours and available days</p>
        </div>
        <div className="settings-section__actions">
          <button className="settings-btn settings-btn--primary" onClick={handleSaveAvailability} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Clock size={16} />
            <h4 className="form-group__title">Weekly Schedule</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {availability.map((slot, i) => (
              <div
                key={slot.day}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1rem",
                  borderBottom: i < availability.length - 1 ? "1px solid var(--border-primary)" : "none",
                  background: slot.enabled ? "transparent" : "var(--bg-secondary)",
                  borderRadius: i === 0 ? "8px 8px 0 0" : i === availability.length - 1 ? "0 0 8px 8px" : 0,
                  transition: "background 0.2s ease",
                }}
              >
                <label className="toggle-switch" style={{ flexShrink: 0 }}>
                  <input type="checkbox" checked={slot.enabled} onChange={e => {
                    const u = [...availability]; u[i] = { ...u[i], enabled: e.target.checked }; setAvailability(u)
                  }} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ width: 100, fontWeight: 600, fontSize: "0.9rem", color: slot.enabled ? "var(--text-primary)" : "var(--text-tertiary)" }}>{slot.day}</span>
                {slot.enabled ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <Clock size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                      <input className="dense-input" type="time" value={slot.startTime} style={{ flex: 1, maxWidth: 150 }} onChange={e => {
                        const u = [...availability]; u[i] = { ...u[i], startTime: e.target.value }; setAvailability(u)
                      }} />
                    </div>
                    <span style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", fontWeight: 500 }}>to</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <Clock size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                      <input className="dense-input" type="time" value={slot.endTime} style={{ flex: 1, maxWidth: 150 }} onChange={e => {
                        const u = [...availability]; u[i] = { ...u[i], endTime: e.target.value }; setAvailability(u)
                      }} />
                    </div>
                  </div>
                ) : (
                  <span style={{ color: "var(--text-tertiary)", fontStyle: "italic", fontSize: "0.85rem" }}>Day off</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Client Preferences ── */
  const ClientPreferencesSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#8b5cf6" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
          <Target size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Client Preferences</h2>
          <p className="settings-section__description">Configure training session and client management settings</p>
        </div>
        <div className="settings-section__actions">
          <button className="settings-btn settings-btn--primary" onClick={handleSaveClientPreferences} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Users size={16} />
            <h4 className="form-group__title">Session Configuration</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper">
              <label className="field-label">
                Max Active Clients
                <div className="info-icon" data-tooltip="Maximum number of clients you can take on at once">
                  <Info size={14} />
                </div>
              </label>
              <input className="dense-input" type="number" value={maxClients} onChange={e => setMaxClients(e.target.value)} min="1" max="100" placeholder="20" />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Default Session Duration
                <div className="info-icon" data-tooltip="Standard length of a training session in minutes">
                  <Info size={14} />
                </div>
              </label>
              <div style={{ position: "relative" }}>
                <input className="dense-input" type="number" value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} min="15" max="180" step="15" placeholder="60" />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontSize: "0.8rem", pointerEvents: "none" }}>min</span>
              </div>
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Rest Between Sessions
                <div className="info-icon" data-tooltip="Buffer time between consecutive sessions">
                  <Info size={14} />
                </div>
              </label>
              <div style={{ position: "relative" }}>
                <input className="dense-input" type="number" value={restBetweenSessions} onChange={e => setRestBetweenSessions(e.target.value)} min="0" max="60" step="5" placeholder="15" />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontSize: "0.8rem", pointerEvents: "none" }}>min</span>
              </div>
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Max Group Size
                <div className="info-icon" data-tooltip="Maximum members allowed in a single group session">
                  <Info size={14} />
                </div>
              </label>
              <input className="dense-input" type="number" value={maxGroupSize} onChange={e => setMaxGroupSize(e.target.value)} min="2" max="50" placeholder="8" />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group__header">
            <UserCheck size={16} />
            <h4 className="form-group__title">Booking Preferences</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem",
              borderBottom: "1px solid var(--border-primary)",
            }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Auto-Accept Bookings</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: 2 }}>Automatically accept new booking requests from members</div>
              </div>
              <label className="toggle-switch"><input type="checkbox" checked={autoAcceptBookings} onChange={e => setAutoAcceptBookings(e.target.checked)} /><span className="toggle-slider" /></label>
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem",
            }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Allow Group Sessions</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: 2 }}>Enable group training sessions alongside individual sessions</div>
              </div>
              <label className="toggle-switch"><input type="checkbox" checked={allowGroupSessions} onChange={e => setAllowGroupSessions(e.target.checked)} /><span className="toggle-slider" /></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Appearance ── */
  const AppearanceSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#a855f7" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)" }}>
          <Palette size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Appearance</h2>
          <p className="settings-section__description">Customize the look and feel of your dashboard</p>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Palette size={16} />
            <h4 className="form-group__title">Theme Mode</h4>
          </div>
          <div className="theme-options">
            {([
              { mode: "dark" as const, label: "Dark", icon: <Moon size={24} />, desc: "Easy on the eyes" },
              { mode: "light" as const, label: "Light", icon: <Sun size={24} />, desc: "Clean and bright" },
              { mode: "system" as const, label: "System", icon: <Monitor size={24} />, desc: "Match OS setting" },
            ]).map(t => (
              <button key={t.mode} className={`theme-option ${themeMode === t.mode ? "theme-option--active" : ""}`} onClick={() => setThemeMode(t.mode)}>
                <div className="theme-option__preview">
                  {t.icon}
                </div>
                <div className="theme-option__label">{t.label}</div>
                <div className="theme-option__desc">{t.desc}</div>
                {themeMode === t.mode && <div className="theme-option__check"><Check size={14} /></div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Notifications ── */
  const NotificationsSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#f97316" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
          <Bell size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Notifications</h2>
          <p className="settings-section__description">Configure how you receive alerts and updates</p>
        </div>
        <div className="settings-section__actions">
          <button className="settings-btn settings-btn--primary" onClick={handleSaveNotifications} disabled={saving}>
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Bell size={16} />
            <h4 className="form-group__title">Alert Preferences</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {([
              { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive updates and alerts via email", icon: <Mail size={16} /> },
              { key: "classReminders" as const, label: "Class Reminders", desc: "Get reminded before upcoming classes you teach", icon: <Clock size={16} /> },
              { key: "memberUpdates" as const, label: "Member Updates", desc: "Notifications about member activity and progress", icon: <Users size={16} /> },
              { key: "scheduleChanges" as const, label: "Schedule Changes", desc: "Alerts when your schedule is modified by admin", icon: <Calendar size={16} /> },
              { key: "progressAlerts" as const, label: "Progress Alerts", desc: "Notifications when members hit milestones", icon: <BarChart3 size={16} /> },
              { key: "paymentAlerts" as const, label: "Payment Alerts", desc: "Notifications about your earnings and payouts", icon: <DollarSign size={16} /> },
              { key: "newAssignments" as const, label: "New Assignments", desc: "Alerts when new clients are assigned to you", icon: <UserCheck size={16} /> },
            ]).map((item, idx, arr) => (
              <div key={item.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem",
                borderBottom: idx < arr.length - 1 ? "1px solid var(--border-primary)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ color: "var(--text-tertiary)", marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifications[item.key]} onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Security ── */
  const SecuritySection = () => (
    <div className="settings-section" style={{ "--section-accent": "#ef4444" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
          <Shield size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Security</h2>
          <p className="settings-section__description">Manage your password and account security</p>
        </div>
        <div className="settings-section__actions">
          <button className="settings-btn settings-btn--primary" onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
            {saving ? <Loader2 size={14} className="spin" /> : <Shield size={14} />} Update Password
          </button>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <Shield size={16} />
            <h4 className="form-group__title">Change Password</h4>
          </div>
          <div className="form-grid">
            <div className="field-wrapper field-wrapper--full">
              <label className="field-label">
                Current Password
                <span className="field-label__required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input className="dense-input" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={{ paddingRight: 40 }} />
                <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} type="button" style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)",
                  display: "flex", alignItems: "center", padding: 4,
                }}>
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                New Password
                <span className="field-label__required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input className="dense-input" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ paddingRight: 40 }} />
                <button onClick={() => setShowNewPassword(!showNewPassword)} type="button" style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)",
                  display: "flex", alignItems: "center", padding: 4,
                }}>
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && newPassword.length < 8 && (
                <div className="field-error"><AlertCircle size={12} /> Password must be at least 8 characters</div>
              )}
              {newPassword && newPassword.length >= 8 && (
                <div className="field-hint"><Check size={12} /> Password strength: Good</div>
              )}
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Confirm New Password
                <span className="field-label__required">*</span>
              </label>
              <input className="dense-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              {confirmPassword && confirmPassword !== newPassword && (
                <div className="field-error"><AlertCircle size={12} /> Passwords do not match</div>
              )}
              {confirmPassword && confirmPassword === newPassword && newPassword.length >= 8 && (
                <div className="field-hint"><Check size={12} /> Passwords match</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Billing / Earnings ── */
  const BillingSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#f59e0b" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
          <CreditCard size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Earnings & Payouts</h2>
          <p className="settings-section__description">View your payment information and earning history</p>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <DollarSign size={16} />
            <h4 className="form-group__title">Payout Information</h4>
          </div>
          <div style={{
            padding: "2.5rem 2rem", textAlign: "center",
            background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border-primary)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b20, #d9770620)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
            }}>
              <CreditCard size={28} style={{ color: "#f59e0b" }} />
            </div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, fontSize: "1.05rem" }}>Earnings & Payout Information</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", maxWidth: 400, margin: "0 auto", lineHeight: 1.5 }}>
              Your payout details and earning history are managed by the gym administration. Contact the gym owner for payout inquiries.
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Reports ── */
  const ReportsSection = () => (
    <div className="settings-section" style={{ "--section-accent": "#14b8a6" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
          <FileText size={20} />
        </div>
        <div>
          <h2 className="settings-section__title">Reports & Logs</h2>
          <p className="settings-section__description">View your session history and performance metrics</p>
        </div>
      </div>
      <div className="settings-section__content">
        <div className="form-group">
          <div className="form-group__header">
            <BarChart3 size={16} />
            <h4 className="form-group__title">Session & Performance Data</h4>
          </div>
          <div style={{
            padding: "2.5rem 2rem", textAlign: "center",
            background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border-primary)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #14b8a620, #0d948820)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
            }}>
              <BarChart3 size={28} style={{ color: "#14b8a6" }} />
            </div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, fontSize: "1.05rem" }}>Session Logs & Reports</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", maxWidth: 400, margin: "0 auto", lineHeight: 1.5 }}>
              View your completed sessions, client progress reports, and performance analytics from the Reports section of the dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ═══════════════════════════════════  RENDER  ═══════════════════════════════════ */
  return (
    <div className="settings-page">
      <div className="settings-layout">
        <aside className="settings-sidebar">
          {settingsCategories.map((category) => {
            const Icon = category.icon
            const isActive = activeSection === category.id
            return (
              <motion.button
                key={category.id}
                className={`settings-nav-item ${isActive ? "settings-nav-item--active" : ""}`}
                onClick={() => setActiveSection(category.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div
                  className="settings-nav-item__icon"
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                    color: "#fff",
                    boxShadow: `0 3px 10px ${category.color}55`,
                  } : {
                    color: category.color,
                    background: `${category.color}15`,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div className="settings-nav-item__text">
                  <div className="settings-nav-item__label">{category.label}</div>
                  <div className="settings-nav-item__desc">{category.desc}</div>
                </div>
              </motion.button>
            )
          })}
        </aside>

        <main className="settings-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default TrainerSettings