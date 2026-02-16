"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import {
  Building2,
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  Info,
  AlertCircle,
  Dumbbell,
} from "lucide-react"
import api from "../../../services/api"
import type { GymHoursDTO, PTConfigDTO, BlackoutDayDTO } from "../../../types/gymSettings"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

const GymProfileSection: React.FC = () => {
  const [gymHours, setGymHours] = useState<GymHoursDTO[]>([])
  const [ptConfig, setPtConfig] = useState<PTConfigDTO>({
    defaultDurationMinutes: 60,
    maxSessionsPerDay: 8,
    slotIntervalMinutes: 30,
  })
  const [blackoutDays, setBlackoutDays] = useState<BlackoutDayDTO[]>([])
  const [newBlackoutDate, setNewBlackoutDate] = useState("")
  const [newBlackoutReason, setNewBlackoutReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [savingHours, setSavingHours] = useState(false)
  const [savingPT, setSavingPT] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [hoursRes, ptRes, blackoutRes] = await Promise.allSettled([
        api.get<GymHoursDTO[]>("/settings/gym/gym-hours"),
        api.get<PTConfigDTO>("/settings/gym/pt-config"),
        api.get<BlackoutDayDTO[]>("/settings/gym/blackout-days"),
      ])

      if (hoursRes.status === "fulfilled" && hoursRes.value.data) {
        const hours = hoursRes.value.data
        // Ensure all 7 days are present
        const fullWeek = DAYS.map((day) => {
          const existing = hours.find((h: GymHoursDTO) => h.dayOfWeek === day)
          return existing || { dayOfWeek: day, openTime: "06:00", closeTime: "22:00", isClosed: false }
        })
        setGymHours(fullWeek)
      } else {
        setGymHours(
          DAYS.map((day) => ({ dayOfWeek: day, openTime: "06:00", closeTime: "22:00", isClosed: false }))
        )
      }

      if (ptRes.status === "fulfilled" && ptRes.value.data) {
        setPtConfig(ptRes.value.data)
      }

      if (blackoutRes.status === "fulfilled" && blackoutRes.value.data) {
        setBlackoutDays(blackoutRes.value.data)
      }
    } catch (err) {
      console.error("Failed to load gym profile:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleHoursChange = (index: number, field: keyof GymHoursDTO, value: string | boolean) => {
    setGymHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
  }

  const saveHours = async () => {
    setSavingHours(true)
    try {
      for (const h of gymHours) {
        await api.put("/settings/gym/gym-hours", h)
      }
      toast.success("Gym hours updated")
    } catch {
      toast.error("Failed to update gym hours")
    } finally {
      setSavingHours(false)
    }
  }

  const savePTConfig = async () => {
    setSavingPT(true)
    try {
      await api.put("/settings/gym/pt-config", ptConfig)
      toast.success("PT configuration updated")
    } catch {
      toast.error("Failed to update PT config")
    } finally {
      setSavingPT(false)
    }
  }

  const addBlackoutDay = async () => {
    if (!newBlackoutDate) {
      toast.error("Please select a date")
      return
    }
    try {
      const params = new URLSearchParams({ date: newBlackoutDate })
      if (newBlackoutReason) params.append("reason", newBlackoutReason)
      const res = await api.post<BlackoutDayDTO>(`/settings/gym/blackout-days?${params.toString()}`)
      setBlackoutDays((prev) => [...prev, res.data])
      setNewBlackoutDate("")
      setNewBlackoutReason("")
      toast.success("Blackout day added")
    } catch {
      toast.error("Failed to add blackout day")
    }
  }

  const removeBlackoutDay = async (date: string) => {
    try {
      await api.delete(`/settings/gym/blackout-days?date=${date}`)
      setBlackoutDays((prev) => prev.filter((b) => b.date !== date))
      toast.success("Blackout day removed")
    } catch {
      toast.error("Failed to remove blackout day")
    }
  }

  if (isLoading) {
    return (
      <div className="settings-section">
        <div className="settings-section__loading">
          <div className="settings-section__loading-spinner" />
          <span>Loading gym profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section" style={{ "--section-accent": "#10b981" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">Gym Profile</h2>
            <p className="settings-section__description">Operating hours, PT configuration & holidays</p>
          </div>
        </div>
      </div>

      <div className="settings-section__content">
        {/* Gym Hours */}
        <div className="form-group">
          <div className="form-group__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} />
              <h4 className="form-group__title" style={{ margin: 0 }}>Operating Hours</h4>
            </div>
            <button className="settings-save-btn" onClick={saveHours} disabled={savingHours} style={{ padding: "6px 14px", fontSize: 13 }}>
              <Save size={14} />
              {savingHours ? "Saving..." : "Save Hours"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {gymHours.map((h, i) => (
              <div
                key={h.dayOfWeek}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: h.isClosed ? "var(--bg-tertiary, #f3f4f6)" : "var(--bg-secondary, #f9fafb)",
                  opacity: h.isClosed ? 0.6 : 1,
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 13, textTransform: "capitalize" }}>
                  {h.dayOfWeek.charAt(0) + h.dayOfWeek.slice(1).toLowerCase()}
                </span>
                <input
                  type="time"
                  className="dense-input"
                  value={h.openTime}
                  onChange={(e) => handleHoursChange(i, "openTime", e.target.value)}
                  disabled={h.isClosed}
                  style={{ padding: "6px 10px", fontSize: 13 }}
                />
                <input
                  type="time"
                  className="dense-input"
                  value={h.closeTime}
                  onChange={(e) => handleHoursChange(i, "closeTime", e.target.value)}
                  disabled={h.isClosed}
                  style={{ padding: "6px 10px", fontSize: 13 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <input
                    type="checkbox"
                    checked={!!h.isClosed}
                    onChange={(e) => handleHoursChange(i, "isClosed", e.target.checked)}
                  />
                  Closed
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* PT Configuration */}
        <div className="form-group">
          <div className="form-group__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Dumbbell size={16} />
              <h4 className="form-group__title" style={{ margin: 0 }}>PT Session Configuration</h4>
            </div>
            <button className="settings-save-btn" onClick={savePTConfig} disabled={savingPT} style={{ padding: "6px 14px", fontSize: 13 }}>
              <Save size={14} />
              {savingPT ? "Saving..." : "Save Config"}
            </button>
          </div>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field-wrapper">
              <label className="field-label">
                Default Duration (minutes)
                <div className="info-icon" data-tooltip="Default length of a PT session">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="number"
                className="dense-input"
                min={15}
                max={180}
                step={15}
                value={ptConfig.defaultDurationMinutes}
                onChange={(e) => setPtConfig((p) => ({ ...p, defaultDurationMinutes: +e.target.value }))}
              />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Max Sessions / Day
                <div className="info-icon" data-tooltip="Maximum PT sessions a trainer can have per day">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="number"
                className="dense-input"
                min={1}
                max={20}
                value={ptConfig.maxSessionsPerDay}
                onChange={(e) => setPtConfig((p) => ({ ...p, maxSessionsPerDay: +e.target.value }))}
              />
            </div>
            <div className="field-wrapper">
              <label className="field-label">
                Slot Interval (minutes)
                <div className="info-icon" data-tooltip="Time gap between available booking slots">
                  <Info size={14} />
                </div>
              </label>
              <input
                type="number"
                className="dense-input"
                min={15}
                max={60}
                step={15}
                value={ptConfig.slotIntervalMinutes}
                onChange={(e) => setPtConfig((p) => ({ ...p, slotIntervalMinutes: +e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Blackout Days */}
        <div className="form-group">
          <div className="form-group__header">
            <Calendar size={16} />
            <h4 className="form-group__title">Blackout Days / Holidays</h4>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "4px 0 12px" }}>
            Days when the gym is closed for holidays or maintenance. No bookings allowed.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              type="date"
              className="dense-input"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{ flex: "0 0 180px" }}
            />
            <input
              type="text"
              className="dense-input"
              placeholder="Reason (optional)"
              value={newBlackoutReason}
              onChange={(e) => setNewBlackoutReason(e.target.value)}
              style={{ flex: 1, minWidth: 150 }}
            />
            <button
              className="settings-save-btn"
              onClick={addBlackoutDay}
              disabled={!newBlackoutDate}
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {blackoutDays.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-tertiary)", fontSize: 13 }}>
              No blackout days configured
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {blackoutDays
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((b) => (
                  <div
                    key={b.date}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "var(--bg-secondary, #f9fafb)",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(b.date + "T00:00:00").toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {b.reason && (
                        <span style={{ color: "var(--text-tertiary)" }}> &mdash; {b.reason}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeBlackoutDay(b.date)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-tertiary)",
                        padding: 4,
                        borderRadius: 4,
                      }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="policy-note">
          <div className="policy-note__icon">
            <AlertCircle size={16} />
          </div>
          <span>
            <strong>Note:</strong> Changes to operating hours and blackout days affect member booking
            availability immediately.
          </span>
        </div>
      </div>
    </div>
  )
}

export default GymProfileSection
